import { useState, useMemo } from 'react'
import { PenTool, Check, AlertTriangle, Zap, RotateCcw, Sparkles } from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'

interface WritingPrompt {
  id: string
  title: string
  taskIT: string
  minWords: number
  maxWords: number
  suggestedKeywords: string[]
  exampleSentence: string
}

const PROMPTS: WritingPrompt[] = [
  {
    id: 'pr-routine',
    title: 'DAILY ROUTINE',
    taskIT: 'Descrivi la tua routine mattutina tipica in 50-80 parole. Racconta a che ora ti svegli, cosa fai per prima cosa, cosa mangi o bevi a colazione e come ti prepari per la giornata.',
    minWords: 50,
    maxWords: 80,
    suggestedKeywords: ['wake up', 'morning', 'breakfast', 'coffee', 'shower', 'start', 'first'],
    exampleSentence: 'Every morning I wake up early, drink a warm cup of coffee and get ready for work.',
  },
  {
    id: 'pr-travel',
    title: 'TRAVEL MEMORY',
    taskIT: 'Descrivi un viaggio o una città che hai visitato in 50-80 parole. Spiega dove sei andato, quale mezzo di trasporto hai utilizzato e cosa ti ha colpito maggiormente dell\'esperienza.',
    minWords: 50,
    maxWords: 80,
    suggestedKeywords: ['travel', 'visit', 'hotel', 'beautiful', 'city', 'trip', 'enjoy'],
    exampleSentence: 'Last summer I traveled to London and visited several historic museums across the city.',
  },
  {
    id: 'pr-tech',
    title: 'TECH & WORK',
    taskIT: 'Descrivi il tuo ambiente di lavoro o una tecnologia che utilizzi ogni giorno in 50-80 parole. Spiega perché è utile, come collabori con gli altri e quali strumenti preferisci.',
    minWords: 50,
    maxWords: 80,
    suggestedKeywords: ['project', 'technology', 'team', 'software', 'learn', 'computer', 'work'],
    exampleSentence: 'In our software development team we use modern technology to build fast web applications.',
  },
]

interface ValidationResult {
  score: number
  wordCountPassed: boolean
  wordCountStatus: 'low' | 'optimal' | 'high'
  foundKeywords: string[]
  missingKeywords: string[]
  capitalizationPassed: boolean
  punctuationPassed: boolean
  feedbackNotes: string[]
  xpAwarded: number
}

export default function Writing() {
  const { addXP } = useProgress()
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0)
  const [text, setText] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const prompt = PROMPTS[selectedPromptIdx]

  // Real-time word count calculation
  const wordCount = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).filter(Boolean).length
  }, [text])

  // Real-time keyword check
  const activeKeywords = useMemo(() => {
    const lower = text.toLowerCase()
    return prompt.suggestedKeywords.map((kw) => ({
      keyword: kw,
      found: lower.includes(kw.toLowerCase()),
    }))
  }, [text, prompt.suggestedKeywords])

  // Select prompt
  const handleSelectPrompt = (idx: number) => {
    setSelectedPromptIdx(idx)
    setText('')
    setResult(null)
    setSubmitted(false)
  }

  // Heuristic validation
  const validateText = () => {
    if (!text.trim()) return

    const lower = text.toLowerCase()
    const foundKeywords = prompt.suggestedKeywords.filter((kw) => lower.includes(kw.toLowerCase()))
    const missingKeywords = prompt.suggestedKeywords.filter((kw) => !lower.includes(kw.toLowerCase()))

    let wordCountPassed = false
    let wordCountStatus: 'low' | 'optimal' | 'high' = 'optimal'
    if (wordCount < prompt.minWords) {
      wordCountStatus = 'low'
    } else if (wordCount > prompt.maxWords + 10) {
      wordCountStatus = 'high'
    } else {
      wordCountPassed = true
    }

    // Capitalization & punctuation heuristics
    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
    const capitalizationPassed = sentences.every((s) => /^[A-Z]/.test(s))
    const punctuationPassed = /[.!?]$/.test(text.trim())

    const notes: string[] = []
    let score = 50

    if (wordCountPassed) {
      score += 25
      notes.push(`Conteggio parole ottimale (${wordCount} parole).`)
    } else if (wordCountStatus === 'low') {
      notes.push(`Testo troppo breve (${wordCount}/${prompt.minWords} parole richieste).`)
    } else {
      score += 15
      notes.push(`Testo leggermente sopra il limite massimo (${wordCount} parole).`)
    }

    // Keyword score
    const kwPercent = foundKeywords.length / prompt.suggestedKeywords.length
    score += Math.round(kwPercent * 20)
    notes.push(`${foundKeywords.length} su ${prompt.suggestedKeywords.length} vocaboli suggeriti utilizzati.`)

    if (capitalizationPassed) score += 3
    else notes.push('Alcune frasi non iniziano con la lettera maiuscola.')

    if (punctuationPassed) score += 2
    else notes.push('Il testo non si conclude con un punto di chiusura.')

    score = Math.min(100, Math.max(10, score))

    // Award XP
    let xpGain = 0
    if (score >= 60) {
      xpGain = score >= 85 ? 30 : 20
      addXP(xpGain)
    }

    setResult({
      score,
      wordCountPassed,
      wordCountStatus,
      foundKeywords,
      missingKeywords,
      capitalizationPassed,
      punctuationPassed,
      feedbackNotes: notes,
      xpAwarded: xpGain,
    })
    setSubmitted(true)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-8">
        <div>
          <p className="font-mono text-white/30 text-xs tracking-widest mb-1" style={{ letterSpacing: '0.22em' }}>
            MODULO OPERATIVO · COMPOSIZIONE SCRITTA
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-white">SCRITTURA</h1>
        </div>

        {/* Prompt Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {PROMPTS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleSelectPrompt(idx)}
              className={[
                'font-mono text-xs px-3 py-1.5 rounded-pill border transition-all duration-150 shrink-0',
                selectedPromptIdx === idx
                  ? 'border-white text-black bg-white font-semibold'
                  : 'border-border-subtle text-white/40 hover:border-white/40 hover:text-white',
              ].join(' ')}
              style={{ letterSpacing: '0.14em' }}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── PROMPT INSTRUCTION CARD ── */}
      <div
        className="p-6 sm:p-8 rounded-sm border border-border-subtle mb-6"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs text-white/30 border border-border-subtle px-2.5 py-0.5 rounded-sm tracking-widest">
            TRACCIA: {prompt.title}
          </span>
          <span className="font-mono text-xs text-white/30 tracking-widest tabular-nums">
            OBIETTIVO: {prompt.minWords}–{prompt.maxWords} PAROLE
          </span>
        </div>

        <p className="text-text-content font-sans text-sm sm:text-base leading-relaxed mb-6">
          {prompt.taskIT}
        </p>

        {/* Suggested keywords */}
        <div>
          <p className="font-mono text-white/25 text-xs tracking-wider mb-2">
            VOCABOLI CHIAVE SUGGERITI (INCLUDILI NEL TESTO):
          </p>
          <div className="flex flex-wrap gap-2">
            {activeKeywords.map(({ keyword, found }) => (
              <span
                key={keyword}
                className="font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors duration-200 flex items-center gap-1.5"
                style={{
                  borderColor: found ? '#3DDC84' : '#3a3a3f',
                  color: found ? '#3DDC84' : 'rgba(240,240,250,0.3)',
                  background: 'transparent',
                }}
              >
                {found && <Check size={11} strokeWidth={2.5} />}
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEXTAREA INPUT AREA ── */}
      <div className="mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your response here in natural English..."
          rows={8}
          className="w-full font-sans text-sm sm:text-base p-5 rounded border border-border-subtle focus:border-white/60 focus:outline-none transition-colors duration-150 leading-relaxed text-[#f0f0fa] placeholder:text-white/20"
          style={{
            background: '#0a0a0a',
            borderRadius: '4px',
            border: '1px solid #3a3a3f',
          }}
        />

        {/* Real-time Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 px-1">
          {/* Real-time word counter */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-xs tracking-widest tabular-nums"
              style={{
                color:
                  wordCount >= prompt.minWords && wordCount <= prompt.maxWords
                    ? '#3DDC84'
                    : wordCount > prompt.maxWords
                    ? '#FF5C5C'
                    : 'rgba(255,255,255,0.3)',
              }}
            >
              <AnimatedCounter value={wordCount} /> / {prompt.maxWords} PAROLE
            </span>
            {wordCount >= prompt.minWords && wordCount <= prompt.maxWords && (
              <span className="font-mono text-xs text-signal-ok">✓ TARGET</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {text && (
              <button
                onClick={() => {
                  setText('')
                  setResult(null)
                  setSubmitted(false)
                }}
                className="font-mono text-xs text-white/30 hover:text-white px-2 py-1 flex items-center gap-1"
              >
                <RotateCcw size={12} /> CANCELLA
              </button>
            )}
            <GhostButton onClick={validateText} disabled={!text.trim()}>
              <PenTool size={13} /> INVIA E VERIFICA
            </GhostButton>
          </div>
        </div>
      </div>

      {/* ── HEURISTIC EVALUATION RESULTS ── */}
      {submitted && result && (
        <div
          className="p-6 sm:p-8 rounded-sm border border-border-subtle"
          style={{ background: '#0a0a0a' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4 mb-6">
            <div>
              <p className="font-mono text-white/30 text-xs tracking-widest">
                ESITO ANALISI EURISTICA MISSION CONTROL
              </p>
              <h3 className="heading-display text-xl sm:text-2xl mt-1 text-white">
                PUNTEGGIO: <AnimatedCounter value={result.score} /> / 100
              </h3>
            </div>

            {result.xpAwarded > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 border border-signal-ok rounded-pill">
                <Zap size={14} className="text-signal-ok" />
                <span className="font-mono text-xs text-signal-ok tracking-wider">
                  +{result.xpAwarded} XP ASSEGNATI
                </span>
              </div>
            )}
          </div>

          {/* Feedback details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="data-tile">
              <p className="font-mono text-white/30 text-xs tracking-wider">CONTEGGIO PAROLE</p>
              <p
                className="font-mono text-lg font-bold"
                style={{ color: result.wordCountPassed ? '#3DDC84' : '#FF5C5C' }}
              >
                {wordCount} PAROLE {result.wordCountPassed ? '(CONFORME)' : '(NON CONFORME)'}
              </p>
              <p className="text-text-content/40 text-xs mt-1">
                Target traccia: {prompt.minWords}–{prompt.maxWords} parole.
              </p>
            </div>

            <div className="data-tile">
              <p className="font-mono text-white/30 text-xs tracking-wider">VOCABOLI CHIAVE</p>
              <p className="font-mono text-lg font-bold text-white">
                {result.foundKeywords.length} / {prompt.suggestedKeywords.length} RILEVATI
              </p>
              <p className="text-text-content/40 text-xs mt-1">
                {result.foundKeywords.length >= 3
                  ? 'Ottimo utilizzo dei termini richiesti.'
                  : 'Consiglio: prova ad inserire più parole chiave suggerite.'}
              </p>
            </div>
          </div>

          {/* Evaluation notes */}
          <div>
            <p className="font-mono text-white/25 text-xs tracking-wider mb-2">
              NOTE DI FEEDBACK:
            </p>
            <ul className="space-y-1.5 font-sans text-xs text-text-content/60">
              {result.feedbackNotes.map((note, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-white/20">·</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
