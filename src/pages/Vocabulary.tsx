import { useState, useMemo, useCallback, useEffect } from 'react'
import { Volume2, ArrowLeft, ChevronRight, RotateCcw, Zap, Package } from 'lucide-react'
import { vocabCategories, type VocabCategory, type CategoryVocabItem } from '../db/seed'
import { useProgress } from '../hooks/useProgress'
import GhostButton from '../components/GhostButton'
import AnimatedCounter from '../components/AnimatedCounter'
import SectionGuideModal from '../components/SectionGuideModal'

// ─────────────────────────────────────────
// TTS
// ─────────────────────────────────────────

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-GB'
  utt.rate = 0.82
  window.speechSynthesis.speak(utt)
}

// ─────────────────────────────────────────
// Mini-quiz types
// ─────────────────────────────────────────

interface QuizSlide {
  item: CategoryVocabItem
  options: string[]
  correctIndex: number
}

function buildQuiz(category: VocabCategory): QuizSlide[] {
  const items = [...category.items].sort(() => Math.random() - 0.5)
  return items.map((item) => {
    const wrong = category.items
      .filter((i) => i.id !== item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((i) => i.translation)
    const all = [item.translation, ...wrong].sort(() => Math.random() - 0.5)
    return { item, options: all, correctIndex: all.indexOf(item.translation) }
  })
}

// ─────────────────────────────────────────
// Category grid card
// ─────────────────────────────────────────

function CategoryCard({
  category,
  onClick,
}: {
  category: VocabCategory
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left transition-all duration-200 bg-bg-section border border-border-subtle hover:border-text-display rounded-md p-6"
    >
      {/* Emoji & level */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl select-none" aria-hidden="true">
          {category.emoji}
        </span>
        {category.level && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-signal-ok/10 text-signal-ok border border-signal-ok/30">
            {category.level}
          </span>
        )}
      </div>

      {/* Name */}
      <p
        className="text-text-display font-mono font-bold tracking-widest mb-1 text-xs"
        style={{ letterSpacing: '0.2em' }}
      >
        {category.name}
      </p>
      <p className="text-text-content/60 font-sans text-sm mb-4">{category.nameIT}</p>

      {/* Count */}
      <p
        className="font-mono text-text-content/40 tabular-nums text-xs"
        style={{ letterSpacing: '0.14em' }}
      >
        {category.items.length} TERMINI ATTIVI
      </p>

      {/* Arrow */}
      <div className="flex justify-end mt-4">
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="text-text-content/20 group-hover:text-text-display transition-colors"
        />
      </div>
    </button>
  )
}

// ─────────────────────────────────────────
// Term row in detail view
// ─────────────────────────────────────────

function TermRow({ item }: { item: CategoryVocabItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="py-5 border-b border-border-subtle cursor-pointer group"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span
            className="font-mono text-text-content/40 text-xs mb-1 inline-block"
            style={{ letterSpacing: '0.14em' }}
          >
            {item.partOfSpeech.toUpperCase()}
          </span>

          <div className="flex items-center gap-3">
            <h3
              className="text-text-display font-sans"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.1 }}
            >
              {item.term}
            </h3>
            <button
              onClick={(e) => { e.stopPropagation(); speak(item.term) }}
              className="text-text-content/30 hover:text-text-display transition-colors shrink-0"
              aria-label={`Pronuncia ${item.term}`}
            >
              <Volume2 size={18} strokeWidth={1.5} />
            </button>
          </div>

          <p className="text-text-content/60 font-sans text-sm mt-1">{item.translation}</p>
        </div>

        <span className="font-mono text-xs text-text-content/40 shrink-0 self-center">
          {item.ipa}
        </span>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border-subtle/50 text-xs text-text-content/75 italic">
          "{item.example}"
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Mini Quiz View
// ─────────────────────────────────────────

function CategoryQuizView({
  category,
  onClose,
}: {
  category: VocabCategory
  onClose: () => void
}) {
  const { addXP } = useProgress()
  const slides = useMemo(() => buildQuiz(category), [category])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  const current = slides[index]

  const handleSelect = useCallback(async (optIdx: number) => {
    if (selected !== null || !current) return
    setSelected(optIdx)

    const correct = optIdx === current.correctIndex
    if (correct) {
      setScore((s) => s + 1)
      setXpEarned((x) => x + 10)
      await addXP(10)
    }

    setTimeout(() => {
      if (index + 1 >= slides.length) {
        setDone(true)
      } else {
        setIndex((i) => i + 1)
        setSelected(null)
      }
    }, 900)
  }, [selected, current, index, slides.length, addXP])

  if (done) {
    const accuracy = Math.round((score / slides.length) * 100)
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <p className="font-mono text-text-content/40 text-xs mb-3 tracking-widest">
          VERIFICA CARICO COMPLETATA · {category.name}
        </p>
        <h2 className="heading-display text-3xl mb-8 text-text-display">
          {accuracy >= 80 ? 'CARICO CONVALIDATO' : 'VERIFICA PARZIALE'}
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
          <div className="data-tile text-center">
            <p className="font-mono text-text-content/40 text-xs mb-1">CORRETTE</p>
            <p className="font-mono text-text-display text-2xl tabular-nums">
              <AnimatedCounter value={score} />/{slides.length}
            </p>
          </div>
          <div className="data-tile text-center">
            <p className="font-mono text-text-content/40 text-xs mb-1">ACCURATEZZA</p>
            <p className="font-mono text-text-display text-2xl tabular-nums">
              <AnimatedCounter value={accuracy} />%
            </p>
          </div>
          <div className="data-tile text-center">
            <p className="font-mono text-xs mb-1 text-signal-ok">XP</p>
            <p className="font-mono text-2xl tabular-nums text-signal-ok">
              +<AnimatedCounter value={xpEarned} />
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <GhostButton onClick={() => { setIndex(0); setSelected(null); setScore(0); setXpEarned(0); setDone(false) }}>
            <RotateCcw size={13} /> RIPETI
          </GhostButton>
          <GhostButton onClick={onClose}>
            <ArrowLeft size={13} /> CARICO
          </GhostButton>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="font-mono text-text-content/50 text-xs hover:text-text-display flex items-center gap-1.5"
        >
          <ArrowLeft size={12} /> ESCI
        </button>
        <span className="font-mono text-text-content/40 text-xs tabular-nums">
          {index + 1} / {slides.length}
        </span>
        <span className="font-mono text-xs flex items-center gap-1 text-signal-ok">
          <Zap size={12} strokeWidth={1.5} />
          +<AnimatedCounter value={xpEarned} /> XP
        </span>
      </div>

      <div className="bg-bg-section border border-border-subtle rounded-md p-8 mb-6 text-center">
        <p className="font-mono text-xs text-text-content/40 mb-2 uppercase">TRADUCI IN ITALIANO:</p>
        <h3 className="heading-display text-3xl text-text-display mb-2">{current.item.term}</h3>
        <p className="font-mono text-xs text-text-content/50">{current.item.ipa}</p>
      </div>

      <div className="space-y-3">
        {current.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === current.correctIndex
          let cls = 'border-border-subtle text-text-content hover:border-text-display'
          if (selected !== null) {
            if (isCorrect) cls = 'border-signal-ok text-signal-ok bg-signal-ok/10'
            else if (isSelected) cls = 'border-signal-err text-signal-err bg-signal-err/10'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full text-left p-4 rounded border text-sm font-sans transition-all ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main Vocabulary Page
// ─────────────────────────────────────────

type FilterLevel = 'tutti' | 'A1' | 'A2' | 'B1' | 'B2'

export default function Vocabulary() {
  const { progress, updateSectionLevel } = useProgress()
  const [levelFilter, setLevelFilter] = useState<FilterLevel>('tutti')
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory | null>(null)
  const [quizMode, setQuizMode] = useState(false)

  // Sync initial level from Dexie
  useEffect(() => {
    if (progress?.vocab_level && ['A1', 'A2', 'B1', 'B2'].includes(progress.vocab_level)) {
      setLevelFilter(progress.vocab_level as FilterLevel)
    }
  }, [progress?.vocab_level])

  const handleLevelChange = async (lvl: FilterLevel) => {
    setLevelFilter(lvl)
    if (lvl !== 'tutti') {
      await updateSectionLevel('vocab_level', lvl)
    }
  }

  const filteredCategories = useMemo(() => {
    if (levelFilter === 'tutti') return vocabCategories
    return vocabCategories.filter((c) => c.level === levelFilter || !c.level)
  }, [levelFilter])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-6xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8 flex items-start justify-between">
        <div>
          <p
            className="font-mono text-text-content/40 text-xs tracking-widest mb-1"
            style={{ letterSpacing: '0.22em' }}
          >
            PAYLOAD LESSICALE · CATALOGO TERMINOLOGICO
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
            <Package size={30} strokeWidth={1.5} className="text-signal-ok" /> CARICO
          </h1>
        </div>

        <SectionGuideModal
          sectionTitle="CARICO · GUIDA OPERATIVA"
          sectionSubtitle="PAYLOAD LESSICALE PER CATEGORIE TEMATICHE"
          objective="Espandere il vocabolario operativo in lingua inglese navigando per ambiti specifici, dai viaggi al lessico aerospaziale e corporate."
          methodology={[
            'Seleziona una categoria per visualizzare tutti i termini, pronunce IPA e frasi di esempio.',
            'Tocca un termine per ascoltare la corretta pronuncia via audio di bordo.',
            'Avvia la sessione quiz di categoria per testare la memorizzazione e incassare telemetria XP.',
          ]}
          controls={[
            { name: 'FILTRO LIVELLO', desc: 'Isola le categorie pertinenti al livello prescelto (A1-B2).' },
            { name: 'CARD CATEGORIA', desc: 'Apre il dettaglio dei termini inclusi nel payload.' },
            { name: 'MODALITÀ VERIFICA', desc: 'Mini-quiz interattivo a risposta multipla per la categoria.' },
          ]}
        />
      </div>

      {/* ── LEVEL SELECTOR & STATUS BADGE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-bg-section p-4 rounded border border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-content/40 uppercase tracking-wider">
            LIVELLO:
          </span>
          <div className="flex items-center gap-1.5">
            {(['tutti', 'A1', 'A2', 'B1', 'B2'] as FilterLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={[
                  'font-mono text-xs px-3 py-1 rounded transition-all duration-150 uppercase',
                  levelFilter === lvl
                    ? 'bg-text-display text-bg-primary font-bold shadow'
                    : 'text-text-content/60 hover:text-text-display border border-border-subtle hover:border-text-display',
                ].join(' ')}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* High contrast status badge */}
        <span className="font-mono text-xs px-3 py-1 rounded bg-signal-ok/15 text-signal-ok border border-signal-ok/40 font-bold tracking-wider">
          STATUS: LIVELLO {levelFilter === 'tutti' ? 'COMPLETO (A1-B2)' : levelFilter}
        </span>
      </div>

      {/* ── CONTENT (GRID / DETAIL / QUIZ) ── */}
      {quizMode && selectedCategory ? (
        <CategoryQuizView category={selectedCategory} onClose={() => setQuizMode(false)} />
      ) : selectedCategory ? (
        <div>
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className="font-mono text-xs text-text-content/60 hover:text-text-display flex items-center gap-2"
            >
              <ArrowLeft size={14} /> TORNA AL CARICO COMPLETO
            </button>
            <button
              onClick={() => setQuizMode(true)}
              className="px-4 py-2 rounded-pill bg-signal-ok text-black font-mono text-xs font-semibold"
            >
              AVVIA TEST CARICO (+XP)
            </button>
          </div>

          <div className="divide-y divide-border-subtle">
            {selectedCategory.items.map((item) => (
              <TermRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
