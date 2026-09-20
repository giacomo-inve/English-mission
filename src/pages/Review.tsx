import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, RotateCcw, Home, Shield } from 'lucide-react'
import { db } from '../db/database'
import { vocabulary, irregularVerbs, type VocabItem, type IrregularVerb } from '../db/seed'
import { useSRS, type Rating, boxIntervalLabel } from '../hooks/useSRS'
import { useProgress } from '../hooks/useProgress'
import FlashCard from '../components/FlashCard'
import GhostButton from '../components/GhostButton'
import ProgressBar from '../components/ProgressBar'
import AnimatedCounter from '../components/AnimatedCounter'
import { type SRSItem } from '../db/database'
import SectionGuideModal from '../components/SectionGuideModal'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-GB'
  utt.rate = 0.85
  window.speechSynthesis.speak(utt)
}

function isVocabItem(item: VocabItem | IrregularVerb): item is VocabItem {
  return 'ipa' in item
}

function resolveItem(srsItem: SRSItem): VocabItem | IrregularVerb | null {
  if (srsItem.itemType === 'vocab') {
    return vocabulary.find((v) => v.id === srsItem.itemId) ?? null
  }
  return irregularVerbs.find((v) => v.id === srsItem.itemId) ?? null
}

// ─────────────────────────────────────────
// XP per rating
// ─────────────────────────────────────────

const XP_FOR: Record<Rating, number> = {
  again: 0,
  hard:  5,
  good:  10,
  easy:  15,
}

// ─────────────────────────────────────────
// Card face content
// ─────────────────────────────────────────

function CardFront({
  item,
  srsItem,
}: {
  item: VocabItem | IrregularVerb
  srsItem: SRSItem
}) {
  const term = isVocabItem(item) ? item.term : item.base

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
      {/* Box + type badge */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-white/20 text-xs" style={{ letterSpacing: '0.18em' }}>
          BOX {srsItem.box}
        </span>
        <span className="font-mono text-white/20 text-xs" style={{ letterSpacing: '0.14em' }}>
          ·
        </span>
        <span className="font-mono text-white/20 text-xs uppercase" style={{ letterSpacing: '0.14em' }}>
          {srsItem.itemType === 'vocab' ? 'VOCABOLO' : 'VERBO'}
        </span>
      </div>

      {/* Main term */}
      <div className="flex items-center gap-3">
        <h2
          className="text-text-display font-sans"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', lineHeight: 1.1 }}
        >
          {term}
        </h2>
        <button
          onClick={(e) => { e.stopPropagation(); speak(term) }}
          className="text-white/25 hover:text-white/70 transition-colors shrink-0"
          aria-label={`Pronuncia ${term}`}
        >
          <Volume2 size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* IPA or pattern */}
      {isVocabItem(item) ? (
        <p className="font-mono text-text-content/35 text-sm">{item.ipa}</p>
      ) : (
        <p className="font-mono text-white/25 text-sm tracking-wider">
          PATTERN {item.pattern}
        </p>
      )}

      {/* Flip hint */}
      <p className="text-white/15 text-xs font-mono mt-6" style={{ letterSpacing: '0.12em' }}>
        CLICCA O PREMI SPAZIO PER GIRARE
      </p>
    </div>
  )
}

function CardBack({
  item,
  srsItem,
}: {
  item: VocabItem | IrregularVerb
  srsItem: SRSItem
}) {
  const isVocab = isVocabItem(item)

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
      {/* Translation */}
      <h3 className="text-text-display font-sans text-2xl">
        {isVocab ? item.translation : item.translation}
      </h3>

      {/* Verb forms */}
      {!isVocab && (
        <div className="flex items-center gap-8 mt-2">
          {[
            { label: 'BASE', val: item.base },
            { label: 'PAST', val: item.past },
            { label: 'P.PART.', val: item.pastParticiple },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <p className="font-mono text-white/25 text-xs mb-1" style={{ letterSpacing: '0.14em' }}>
                {label}
              </p>
              <p className="text-text-content font-sans text-base">{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Examples / example */}
      <div className="space-y-1 max-w-xs">
        {isVocab
          ? item.examples.slice(0, 2).map((ex, i) => (
              <p key={i} className="text-text-content/45 text-sm italic">{ex}</p>
            ))
          : <p className="text-text-content/45 text-sm italic">{item.example}</p>
        }
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-2">
        <span className="font-mono text-white/20 text-xs">
          ✓ {srsItem.timesCorrect}
        </span>
        <span className="font-mono text-white/20 text-xs">
          ✗ {srsItem.timesWrong}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Rating buttons
// ─────────────────────────────────────────

const RATING_CONFIG: {
  id: Rating
  label: string
  colorClass: string
  hoverClass: string
}[] = [
  {
    id: 'again',
    label: 'AGAIN',
    colorClass: 'border-signal-err text-signal-err',
    hoverClass: 'hover:bg-signal-err/10',
  },
  {
    id: 'hard',
    label: 'HARD',
    colorClass: 'border-border-subtle text-white/40',
    hoverClass: 'hover:border-white/30 hover:text-white/60',
  },
  {
    id: 'good',
    label: 'GOOD',
    colorClass: 'border-white/30 text-white/70',
    hoverClass: 'hover:border-white hover:text-white',
  },
  {
    id: 'easy',
    label: 'EASY',
    colorClass: 'border-signal-ok text-signal-ok',
    hoverClass: 'hover:bg-signal-ok/10',
  },
]

// ─────────────────────────────────────────
// Session stats type
// ─────────────────────────────────────────

interface SessionStats {
  again: number
  hard: number
  good: number
  easy: number
  xpGained: number
}

// ─────────────────────────────────────────
// Summary screen
// ─────────────────────────────────────────

function Summary({
  stats,
  total,
  onRestart,
}: {
  stats: SessionStats
  total: number
  onRestart: () => void
}) {
  const navigate = useNavigate()
  const correct = stats.hard + stats.good + stats.easy

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 text-center">
      <p
        className="font-mono text-white/25 text-xs tracking-widest mb-4"
        style={{ letterSpacing: '0.22em' }}
      >
        SESSIONE COMPLETATA
      </p>

      <h2
        className="heading-display mb-10"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}
      >
        RIPASSO COMPLETO
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-10 w-full max-w-sm">
        <div className="data-tile text-center">
          <p className="font-mono text-white/30 text-xs tracking-wider mb-1">ELEMENTI</p>
          <p className="font-mono text-white text-3xl tabular-nums">
            <AnimatedCounter value={total} />
          </p>
        </div>
        <div className="data-tile text-center">
          <p className="font-mono text-white/30 text-xs tracking-wider mb-1">XP GUADAGNATI</p>
          <p className="font-mono text-3xl tabular-nums" style={{ color: '#3DDC84' }}>
            +<AnimatedCounter value={stats.xpGained} />
          </p>
        </div>
        <div className="data-tile text-center">
          <p className="font-mono text-xs tracking-wider mb-1" style={{ color: '#3DDC84' }}>
            EASY + GOOD
          </p>
          <p className="font-mono text-white text-3xl tabular-nums">
            <AnimatedCounter value={stats.good + stats.easy} />
          </p>
        </div>
        <div className="data-tile text-center">
          <p className="font-mono text-xs tracking-wider mb-1" style={{ color: '#FF5C5C' }}>
            AGAIN
          </p>
          <p className="font-mono text-white text-3xl tabular-nums">
            <AnimatedCounter value={stats.again} />
          </p>
        </div>
      </div>

      {/* Accuracy bar */}
      <div className="w-full max-w-sm mb-10">
        <div className="flex justify-between mb-1">
          <span className="font-mono text-white/25 text-xs">ACCURATEZZA</span>
          <span className="font-mono text-white/40 text-xs tabular-nums">
            {total > 0 ? Math.round((correct / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-px bg-border-subtle overflow-hidden">
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${total > 0 ? (correct / total) * 100 : 0}%`,
              background: '#3DDC84',
            }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <GhostButton onClick={onRestart}>
          <RotateCcw size={13} /> NUOVO RIPASSO
        </GhostButton>
        <GhostButton onClick={() => navigate('/')}>
          <Home size={13} /> HOME
        </GhostButton>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main Review page
// ─────────────────────────────────────────

export default function Review() {
  const navigate = useNavigate()
  const { rateItem, getDueItems, refreshDueCount } = useSRS()
  const { addXP } = useProgress()

  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<SRSItem[]>([])
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState<SessionStats>({
    again: 0, hard: 0, good: 0, easy: 0, xpGained: 0,
  })

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setDone(false)
    setIndex(0)
    setIsFlipped(false)
    setStats({ again: 0, hard: 0, good: 0, easy: 0, xpGained: 0 })

    const due = await getDueItems()
    // Filter out items with no matching seed data, then shuffle
    const valid = due.filter((item) => resolveItem(item) !== null)
    const shuffled = [...valid].sort(() => Math.random() - 0.5)
    setQueue(shuffled)
    setLoading(false)
  }, [getDueItems])

  useEffect(() => { loadQueue() }, [loadQueue])

  // Keyboard: space to flip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !done && !loading && !transitioning) {
        e.preventDefault()
        setIsFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [done, loading, transitioning])

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (!isFlipped || transitioning || index >= queue.length) return

      setTransitioning(true)

      const current = queue[index]
      await rateItem(current.itemId, rating)

      const xp = XP_FOR[rating]
      if (xp > 0) await addXP(xp)

      setStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
        xpGained: prev.xpGained + xp,
      }))

      // Brief pause before next card for visual clarity
      setTimeout(() => {
        const next = index + 1
        if (next >= queue.length) {
          setDone(true)
          refreshDueCount()
        } else {
          setIndex(next)
          setIsFlipped(false)
        }
        setTransitioning(false)
      }, 240)
    },
    [isFlipped, transitioning, index, queue, rateItem, addXP, refreshDueCount],
  )

  // ── Empty state ──────────────────────────────────────
  if (!loading && queue.length === 0 && !done) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 text-center">
        <p
          className="font-mono text-white/25 text-xs tracking-widest mb-4"
          style={{ letterSpacing: '0.22em' }}
        >
          NESSUN RIPASSO IN SCADENZA
        </p>
        <h2 className="heading-display text-3xl mb-3">TUTTO AGGIORNATO</h2>
        <p className="text-text-content/35 text-sm mb-10">
          Nessun elemento scaduto. Torna più tardi.
        </p>
        <GhostButton onClick={() => navigate('/')}>
          <Home size={13} /> HOME
        </GhostButton>
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p
          className="font-mono text-white/25 text-xs"
          style={{ letterSpacing: '0.2em' }}
        >
          CARICAMENTO CODA...
        </p>
      </div>
    )
  }

  // ── Session done ─────────────────────────────────────
  if (done) {
    return <Summary stats={stats} total={queue.length} onRestart={loadQueue} />
  }

  // ── Active review ────────────────────────────────────
  const current = queue[index]
  const seedItem = resolveItem(current)!
  const progressPct = Math.round((index / queue.length) * 100)
  const nextBoxAfterRating = (rating: Rating) => {
    const r: Record<Rating, number> = {
      again: 1,
      hard: Math.max(1, current.box - 1),
      good: Math.min(5, current.box + 1),
      easy: Math.min(5, current.box + 2),
    }
    return r[rating]
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary">

      {/* ── TOP: Header & Guide ── */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-border-subtle">
        <div>
          <span className="font-mono text-xs text-text-content/40 tracking-widest uppercase">
            SISTEMA DI RIPASSO SPAZIATO · LEITNER 5-BOX
          </span>
          <h1 className="heading-display text-xl text-text-display">
            ORBITA SRS
          </h1>
        </div>

        <SectionGuideModal
          sectionTitle="ORBITA SRS · GUIDA OPERATIVA"
          sectionSubtitle="SESSIONE SPACED REPETITION LEITNER"
          objective="Consolidare vocaboli e verbi trasferendoli dalla memoria a breve termine a quella permanente a lungo termine attraverso intervalli temporali crescenti."
          methodology={[
            'Tocca la card o premi la barra spaziatrice per girarla e verificare la risposta.',
            'Valuta la tua risposta in modo sincero: AGAIN (torna a Box 1), HARD, GOOD, EASY.',
            'Più alto è il box (1-5), più lungo sarà l\'intervallo prima del prossimo ripasso.',
          ]}
          controls={[
            { name: 'SPAZIO / CLICK', desc: 'Capovolge la flashcard a 360 gradi mostrando la traduzione.' },
            { name: 'AGAIN (1)', desc: 'Nessun ricordo: l\'elemento ricomincia il ciclo dal Box 1.' },
            { name: 'GOOD / EASY', desc: 'Ricordo accurato: avanza al box successivo con incremento XP.' },
          ]}
        />
      </div>

      {/* ── Progress bar ── */}
      <div className="px-6 pt-4 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-text-content/40 text-xs tabular-nums" style={{ letterSpacing: '0.14em' }}>
            {index + 1} / {queue.length}
          </span>
          <span className="font-mono text-signal-ok text-xs tabular-nums">
            +{stats.xpGained} XP
          </span>
        </div>
        <ProgressBar value={progressPct} />
      </div>

      {/* ── CARD AREA ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6">

        {/* FlashCard — h-80 = 320px */}
        <FlashCard
          front={<CardFront item={seedItem} srsItem={current} />}
          back={<CardBack item={seedItem} srsItem={current} />}
          isFlipped={isFlipped}
          onClick={() => !transitioning && setIsFlipped((f) => !f)}
          className="w-full max-w-xl h-80"
        />

        {/* ── RATING BUTTONS (visible after flip) ── */}
        <div
          className="w-full max-w-xl mt-5 transition-all duration-300"
          style={{
            opacity: isFlipped ? 1 : 0,
            transform: isFlipped ? 'translateY(0)' : 'translateY(12px)',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {RATING_CONFIG.map(({ id, label, colorClass, hoverClass }) => (
              <button
                key={id}
                onClick={() => handleRate(id)}
                disabled={transitioning || !isFlipped}
                className={[
                  'font-mono text-xs py-3 rounded-pill border',
                  'transition-all duration-150 tracking-wider',
                  colorClass,
                  hoverClass,
                  transitioning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                style={{ letterSpacing: '0.14em' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Micro-guide inline row: resulting interval and cognitive action */}
          <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-border-subtle/50 text-center select-none">
            {[
              { id: 'again', hint: '1 MIN', action: 'Reset a Box 1' },
              { id: 'hard',  hint: boxIntervalLabel(nextBoxAfterRating('hard')).toUpperCase(), action: 'Arretra di 1 box' },
              { id: 'good',  hint: boxIntervalLabel(nextBoxAfterRating('good')).toUpperCase(), action: 'Avanza a box +1' },
              { id: 'easy',  hint: boxIntervalLabel(nextBoxAfterRating('easy')).toUpperCase(), action: 'Salta a box +2' },
            ].map(({ id, hint, action }) => (
              <div key={id} className="font-mono">
                <span className="text-white/60 text-xs font-semibold block tabular-nums">{hint}</span>
                <span className="text-white/25 text-[10px] block mt-0.5">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flip nudge (visible before flip) */}
        {!isFlipped && (
          <p
            className="mt-6 font-mono text-white/15 text-xs"
            style={{ letterSpacing: '0.14em' }}
          >
            CLICCA SULLA CARD O PREMI SPAZIO
          </p>
        )}
      </div>
    </div>
  )
}
