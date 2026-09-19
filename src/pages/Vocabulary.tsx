import { useState, useMemo, useCallback } from 'react'
import { Volume2, ArrowLeft, ChevronRight, RotateCcw, Zap } from 'lucide-react'
import { vocabCategories, type VocabCategory, type CategoryVocabItem } from '../db/seed'
import { useProgress } from '../hooks/useProgress'
import GhostButton from '../components/GhostButton'
import AnimatedCounter from '../components/AnimatedCounter'

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
  options: string[]   // 4 Italian translations
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
      className="group text-left transition-all duration-200"
      style={{
        background: '#0a0a0a',
        border: '1px solid #3a3a3f',
        borderRadius: '8px',
        padding: '28px 24px',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3a3a3f')}
    >
      {/* Emoji */}
      <div className="text-3xl mb-4 select-none" aria-hidden="true">
        {category.emoji}
      </div>

      {/* Name */}
      <p
        className="text-white font-mono font-bold tracking-widest mb-1"
        style={{ fontSize: '0.7rem', letterSpacing: '0.22em' }}
      >
        {category.name}
      </p>
      <p className="text-white/35 font-sans text-sm mb-4">{category.nameIT}</p>

      {/* Count */}
      <p
        className="font-mono text-white/20 tabular-nums"
        style={{ fontSize: '0.65rem', letterSpacing: '0.16em' }}
      >
        {category.items.length} PAROLE
      </p>

      {/* Arrow */}
      <div className="flex justify-end mt-4">
        <ChevronRight
          size={16}
          strokeWidth={1.5}
          className="text-white/15 group-hover:text-white/60 transition-colors"
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
      className="py-5 border-b cursor-pointer group"
      style={{ borderColor: '#3a3a3f' }}
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Top row: term + IPA + audio */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Part of speech */}
          <span
            className="font-mono text-white/20 text-xs mb-1 inline-block"
            style={{ letterSpacing: '0.14em' }}
          >
            {item.partOfSpeech.toUpperCase()}
          </span>

          {/* Term */}
          <div className="flex items-center gap-3">
            <h3
              className="text-text-display font-sans"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.1 }}
            >
              {item.term}
            </h3>
            <button
              onClick={(e) => { e.stopPropagation(); speak(item.term) }}
              className="text-white/20 hover:text-white/70 transition-colors shrink-0"
              aria-label={`Pronuncia ${item.term}`}
            >
              <Volume2 size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* IPA */}
          <p className="font-mono text-white/30 text-sm mt-0.5">{item.ipa}</p>
        </div>

        {/* Translation */}
        <div className="text-right shrink-0">
          <p className="text-text-content/65 font-sans text-base">{item.translation}</p>
        </div>
      </div>

      {/* Example — shown on expand */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? '80px' : '0', opacity: expanded ? 1 : 0 }}
      >
        <p className="text-text-content/35 text-sm italic mt-3 font-sans">
          "{item.example}"
        </p>
      </div>

      {/* Expand hint */}
      {!expanded && (
        <p className="font-mono text-white/10 text-xs mt-2" style={{ letterSpacing: '0.1em' }}>
          CLICCA PER ESEMPIO
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Mini-quiz component
// ─────────────────────────────────────────

function MiniQuiz({
  category,
  onClose,
}: {
  category: VocabCategory
  onClose: () => void
}) {
  const { addXP } = useProgress()
  const [slides] = useState<QuizSlide[]>(() => buildQuiz(category))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [done, setDone] = useState(false)

  const current = slides[index]
  const progress = Math.round((index / slides.length) * 100)

  const handleSelect = useCallback(async (optionIdx: number) => {
    if (selected !== null) return
    setSelected(optionIdx)

    const correct = optionIdx === current.correctIndex
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

  // ── Done screen ──
  if (done) {
    const accuracy = Math.round((score / slides.length) * 100)
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <p className="font-mono text-white/25 text-xs mb-3" style={{ letterSpacing: '0.22em' }}>
          QUIZ COMPLETATO · {category.name}
        </p>
        <h2 className="heading-display text-3xl mb-10">
          {accuracy >= 80 ? 'OTTIMO RISULTATO' : accuracy >= 50 ? 'BUON LAVORO' : 'CONTINUA A ESERCITARTI'}
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-sm">
          <div className="data-tile text-center">
            <p className="font-mono text-white/25 text-xs mb-1">CORRETTE</p>
            <p className="font-mono text-white text-2xl tabular-nums">
              <AnimatedCounter value={score} />/{slides.length}
            </p>
          </div>
          <div className="data-tile text-center">
            <p className="font-mono text-white/25 text-xs mb-1">ACCURATEZZA</p>
            <p className="font-mono text-white text-2xl tabular-nums">
              <AnimatedCounter value={accuracy} />%
            </p>
          </div>
          <div className="data-tile text-center">
            <p className="font-mono text-xs mb-1" style={{ color: '#3DDC84', letterSpacing: '0.12em' }}>XP</p>
            <p className="font-mono text-2xl tabular-nums" style={{ color: '#3DDC84' }}>
              +<AnimatedCounter value={xpEarned} />
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <GhostButton onClick={() => { setIndex(0); setSelected(null); setScore(0); setXpEarned(0); setDone(false) }}>
            <RotateCcw size={13} /> RIPROVA
          </GhostButton>
          <GhostButton onClick={onClose}>
            <ArrowLeft size={13} /> CATALOGO
          </GhostButton>
        </div>
      </div>
    )
  }

  // ── Active quiz ──
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="font-mono text-white/30 text-xs hover:text-white/70 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={12} /> ESCI
        </button>
        <span className="font-mono text-white/25 text-xs tabular-nums">
          {index + 1} / {slides.length}
        </span>
        <span className="font-mono text-xs flex items-center gap-1" style={{ color: '#3DDC84' }}>
          <Zap size={12} strokeWidth={1.5} />
          +<AnimatedCounter value={xpEarned} /> XP
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-border-subtle mb-8 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="text-center mb-10">
        <p className="font-mono text-white/20 text-xs mb-4" style={{ letterSpacing: '0.18em' }}>
          COSA SIGNIFICA IN ITALIANO?
        </p>

        <div className="flex items-center justify-center gap-3 mb-2">
          <h2
            className="text-text-display font-sans"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', lineHeight: 1 }}
          >
            {current.item.term}
          </h2>
          <button
            onClick={() => speak(current.item.term)}
            className="text-white/20 hover:text-white/60 transition-colors"
            aria-label={`Pronuncia ${current.item.term}`}
          >
            <Volume2 size={20} strokeWidth={1.5} />
          </button>
        </div>

        <p className="font-mono text-white/25 text-sm">{current.item.ipa}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect  = i === current.correctIndex
          const answered   = selected !== null

          let borderColor = '#3a3a3f'
          let textColor   = 'rgba(240,240,250,0.7)'

          if (answered) {
            if (isCorrect)           { borderColor = '#3DDC84'; textColor = '#3DDC84' }
            else if (isSelected)     { borderColor = '#FF5C5C'; textColor = '#FF5C5C' }
            else                     { borderColor = '#3a3a3f'; textColor = 'rgba(240,240,250,0.2)' }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className="font-sans text-sm py-4 px-5 rounded-pill border transition-all duration-200 text-left"
              style={{
                borderColor,
                color: textColor,
                background: 'transparent',
                cursor: answered ? 'default' : 'pointer',
              }}
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
// Detail view (single category)
// ─────────────────────────────────────────

function CategoryDetail({
  category,
  onBack,
}: {
  category: VocabCategory
  onBack: () => void
}) {
  const [quizMode, setQuizMode] = useState(false)

  if (quizMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <MiniQuiz category={category} onClose={() => setQuizMode(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
      {/* Breadcrumb */}
      <div className="py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-white/30 text-xs hover:text-white/70 transition-colors mb-6"
          style={{ letterSpacing: '0.14em' }}
        >
          <ArrowLeft size={13} /> CATALOGO
        </button>

        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl select-none" aria-hidden="true">{category.emoji}</span>
          <div>
            <p className="font-mono text-white/25 text-xs" style={{ letterSpacing: '0.18em' }}>
              {category.nameIT.toUpperCase()} · {category.items.length} PAROLE
            </p>
            <h1 className="heading-display text-3xl sm:text-4xl">{category.name}</h1>
          </div>
        </div>

        <hr className="hr-subtle mt-4 mb-2" />
      </div>

      {/* CTA quiz — fixed to the top near header */}
      <div className="mb-8">
        <GhostButton size="lg" onClick={() => setQuizMode(true)}>
          ALLENATI SU QUESTA CATEGORIA
        </GhostButton>
      </div>

      {/* Terms */}
      <div>
        {category.items.map((item) => (
          <TermRow key={item.id} item={item} />
        ))}
      </div>

      {/* Bottom CTA repeat */}
      <div className="mt-10 flex gap-3">
        <GhostButton size="lg" onClick={() => setQuizMode(true)}>
          ALLENATI SU QUESTA CATEGORIA
        </GhostButton>
        <GhostButton onClick={onBack}>
          <ArrowLeft size={13} /> CATALOGO
        </GhostButton>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Grid view (all categories)
// ─────────────────────────────────────────

function CategoryGrid({ onSelect }: { onSelect: (cat: VocabCategory) => void }) {
  const totalWords = useMemo(
    () => vocabCategories.reduce((acc, c) => acc + c.items.length, 0),
    [],
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 pt-12">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-white/25 text-xs mb-2" style={{ letterSpacing: '0.2em' }}>
          VOCABOLARIO · {vocabCategories.length} CATEGORIE · {totalWords} PAROLE
        </p>
        <h1 className="heading-display text-3xl sm:text-4xl mb-4">VOCABOLARIO</h1>
        <p className="text-text-content/40 text-sm max-w-md">
          Seleziona una categoria per esplorare i termini, ascoltare la pronuncia e allenarti con il mini-quiz.
        </p>
        <hr className="hr-subtle mt-6" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} onClick={() => onSelect(cat)} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────

export default function Vocabulary() {
  const [selected, setSelected] = useState<VocabCategory | null>(null)

  if (selected) {
    return <CategoryDetail category={selected} onBack={() => setSelected(null)} />
  }

  return <CategoryGrid onSelect={setSelected} />
}
