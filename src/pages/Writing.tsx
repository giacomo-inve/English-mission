import { useState, useMemo, useEffect } from 'react'
import {
  PenTool,
  Check,
  AlertTriangle,
  Zap,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'
import SectionGuideModal from '../components/SectionGuideModal'
import { WRITING_PROMPTS, type WritingPrompt } from '../db/seed'
import { playSuccessChime, playErrorHum } from '../utils/sfx'

const LEVEL_LIST = ['A1', 'A2', 'B1', 'B2'] as const
type LevelType = (typeof LEVEL_LIST)[number]

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
  const { progress, addXP, updateSectionLevel, markCompleted } = useProgress()
  const [selectedLevel, setSelectedLevel] = useState<LevelType>('A1')
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0)
  const [text, setText] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Sync initial level from Dexie
  useEffect(() => {
    if (progress?.writing_level && LEVEL_LIST.includes(progress.writing_level as LevelType)) {
      setSelectedLevel(progress.writing_level as LevelType)
    }
  }, [progress?.writing_level])

  // Filter prompts by level
  const activePrompts = useMemo(() => {
    const list = WRITING_PROMPTS.filter((p) => p.level === selectedLevel)
    return list.length > 0 ? list : WRITING_PROMPTS
  }, [selectedLevel])

  const prompt = activePrompts[selectedPromptIdx] || activePrompts[0]

  // Completed IDs set
  const completedSet = useMemo(() => {
    return new Set(progress?.completed_exercise_ids ?? [])
  }, [progress?.completed_exercise_ids])

  const isCurrentCompleted = completedSet.has(prompt?.id)

  // Word count
  const wordCount = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).filter(Boolean).length
  }, [text])

  // Real-time keyword check
  const activeKeywords = useMemo(() => {
    if (!prompt) return []
    const lower = text.toLowerCase()
    return prompt.suggestedKeywords.map((kw) => ({
      keyword: kw,
      found: lower.includes(kw.toLowerCase()),
    }))
  }, [text, prompt])

  // Select prompt
  const handleSelectPrompt = (idx: number) => {
    setSelectedPromptIdx(idx)
    setText('')
    setResult(null)
    setSubmitted(false)
  }

  // Switch level
  const handleSelectLevel = async (lvl: LevelType) => {
    setSelectedLevel(lvl)
    await updateSectionLevel('writing_level', lvl)
    handleSelectPrompt(0)
  }

  // Sequential next uncompleted
  const handleNextSequential = () => {
    if (activePrompts.length <= 1) return
    for (let i = 1; i < activePrompts.length; i++) {
      const targetIdx = (selectedPromptIdx + i) % activePrompts.length
      if (!completedSet.has(activePrompts[targetIdx].id)) {
        handleSelectPrompt(targetIdx)
        return
      }
    }
    handleSelectPrompt((selectedPromptIdx + 1) % activePrompts.length)
  }

  // Heuristic validation
  const validateText = () => {
    if (!text.trim() || !prompt) return

    const lower = text.toLowerCase()
    const foundKeywords = prompt.suggestedKeywords.filter((kw) => lower.includes(kw.toLowerCase()))
    const missingKeywords = prompt.suggestedKeywords.filter((kw) => !lower.includes(kw.toLowerCase()))

    let wordCountPassed = false
    let wordCountStatus: 'low' | 'optimal' | 'high' = 'optimal'
    if (wordCount < prompt.minWords) {
      wordCountStatus = 'low'
    } else if (wordCount > prompt.maxWords + 15) {
      wordCountStatus = 'high'
    } else {
      wordCountPassed = true
    }

    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
    const capitalizationPassed = sentences.every((s) => /^[A-Z]/.test(s))
    const punctuationPassed = /[.!?]$/.test(text.trim())

    const notes: string[] = []
    let score = 50

    if (wordCountPassed) {
      score += 25
      notes.push(`Lunghezza ottimale (${wordCount} parole tra ${prompt.minWords} e ${prompt.maxWords}).`)
    } else if (wordCountStatus === 'low') {
      notes.push(`Traccia troppo concisa: ${wordCount}/${prompt.minWords} parole minime richieste.`)
    } else {
      score += 15
      notes.push(`Testo leggermente sopra il limite massimo (${wordCount}/${prompt.maxWords} parole).`)
    }

    const kwPercent = foundKeywords.length / (prompt.suggestedKeywords.length || 1)
    score += Math.round(kwPercent * 20)
    notes.push(`${foundKeywords.length} su ${prompt.suggestedKeywords.length} parole chiave o connettivi impiegati.`)

    if (capitalizationPassed) score += 3
    else notes.push('Verifica le lettere maiuscole a inizio frase.')

    if (punctuationPassed) score += 2
    else notes.push('Assicurati di inserire un segno di punteggiatura a chiusura del testo.')

    score = Math.min(100, Math.max(10, score))

    let xp = 0
    if (score >= 65 && !submitted) {
      xp = score >= 85 ? 30 : 20
      addXP(xp)
      playSuccessChime()
      markCompleted(prompt.id, 'writing')
    } else if (score < 65) {
      playErrorHum()
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
      xpAwarded: xp,
    })
    setSubmitted(true)
  }

  const allCompletedInLevel = useMemo(() => {
    return activePrompts.length > 0 && activePrompts.every((p) => completedSet.has(p.id))
  }, [activePrompts, completedSet])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8 flex items-start justify-between">
        <div>
          <p
            className="font-mono text-text-content/40 text-xs tracking-widest mb-1"
            style={{ letterSpacing: '0.22em' }}
          >
            COMPOSIZIONE REPORT · REGISTRO DI MISSIONE
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
            <BookOpen size={30} strokeWidth={1.5} className="text-signal-ok" /> LOGBOOK
          </h1>
        </div>

        {/* Contextual Guide (i) */}
        <SectionGuideModal
          sectionTitle="LOGBOOK · GUIDA OPERATIVA"
          sectionSubtitle="COMPOSIZIONE SCRITTA E VALIDAZIONE EURISTICA"
          objective="Affilare le competenze di scrittura in lingua inglese (Writing), dalla narrazione di base alla redazione di report tecnici e comunicazioni corporate."
          methodology={[
            'Leggi attentamente la traccia in italiano e il target di parole minime/massime.',
            'Integra le parole chiave e i connettivi logici suggeriti nel testo.',
            'Cura la punteggiatura finale e le maiuscole ad ogni inizio frase.',
            'Raggiungi uno score di almeno 65/100 per registrare la traccia come superata.',
          ]}
          controls={[
            { name: 'CONTEGGIO PAROLE', desc: 'Monitoraggio dinamico della lunghezza con indicatore di target.' },
            { name: 'CHIAVI DI VOCABOLARIO', desc: 'Badge interattivi che si illuminano all\'inclusione nel testo.' },
            { name: 'SELETTORE LIVELLO', desc: 'Accesso libero a tutte le tracce A1, A2, B1 e B2.' },
            { name: 'INVIA AL CONTROLLO', desc: 'Avvia l\'analisi euristica e registra i punti telemetria XP.' },
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
            {LEVEL_LIST.map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleSelectLevel(lvl)}
                className={[
                  'font-mono text-xs px-3 py-1 rounded transition-all duration-150',
                  selectedLevel === lvl
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
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-3 py-1 rounded bg-signal-ok/15 text-signal-ok border border-signal-ok/40 font-bold tracking-wider">
            STATUS: LIVELLO {selectedLevel}
          </span>
          {isCurrentCompleted && (
            <span className="font-mono text-xs text-signal-ok flex items-center gap-1">
              <CheckCircle2 size={13} /> TRACCIA ARCHIVIATA
            </span>
          )}
        </div>
      </div>

      {allCompletedInLevel && (
        <div className="mb-6 p-4 rounded bg-signal-ok/10 border border-signal-ok/30 flex items-center gap-3 text-signal-ok text-xs font-mono">
          <Sparkles size={16} /> TUTTE LE TRACCE LOGBOOK DEL LIVELLO {selectedLevel} SUPERATE!
        </div>
      )}

      {/* ── PROMPT STRIP ── */}
      <div className="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {activePrompts.map((p, idx) => {
            const isCompleted = completedSet.has(p.id)
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPrompt(idx)}
                className={[
                  'font-mono text-xs px-3 py-1.5 rounded border transition-all shrink-0 flex items-center gap-1.5',
                  selectedPromptIdx === idx
                    ? 'border-signal-ok text-signal-ok bg-signal-ok/10 font-bold'
                    : 'border-border-subtle text-text-content/50 hover:border-text-display/50',
                ].join(' ')}
              >
                {isCompleted && <Check size={11} className="text-signal-ok" />}
                TRACCIA 0{idx + 1}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleNextSequential}
          className="font-mono text-xs px-3 py-1.5 rounded border border-border-subtle hover:border-text-display text-text-content/70 hover:text-text-display shrink-0 ml-2"
        >
          PROSSIMA NON COMPLETATA &rarr;
        </button>
      </div>

      {/* ── PROMPT INSTRUCTIONS CARD ── */}
      <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 mb-8 shadow-md">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
          <div>
            <span className="font-mono text-[10px] text-text-content/40 tracking-widest uppercase">
              LIVELLO {prompt?.level} · TRACCIA {selectedPromptIdx + 1}/{activePrompts.length}
            </span>
            <h2 className="heading-display text-xl text-text-display mt-0.5">
              {prompt?.title}
            </h2>
          </div>
          <div className="font-mono text-xs text-text-content/60 border border-border-subtle px-3 py-1 rounded">
            TARGET: {prompt?.minWords}–{prompt?.maxWords} PAROLE
          </div>
        </div>

        <p className="text-text-content/85 text-sm font-sans mb-6 leading-relaxed">
          {prompt?.taskIT}
        </p>

        {/* Suggested keywords / connectors */}
        <div>
          <p className="font-mono text-[11px] text-text-content/40 tracking-wider uppercase mb-2">
            PAROLE CHIAVE E CONNETTORI RACCOMANDATI:
          </p>
          <div className="flex flex-wrap gap-2">
            {activeKeywords.map((kw, i) => (
              <span
                key={i}
                className={[
                  'font-mono text-xs px-2.5 py-1 rounded border transition-colors',
                  kw.found
                    ? 'border-signal-ok text-signal-ok bg-signal-ok/10 font-semibold'
                    : 'border-border-subtle text-text-content/40',
                ].join(' ')}
              >
                {kw.found ? '✓ ' : ''}{kw.keyword}
              </span>
            ))}
          </div>
        </div>

        {prompt?.exampleSentence && (
          <p className="font-mono text-xs text-text-content/50 border-t border-border-subtle pt-4 mt-6 italic">
            MODELLO SINTATTICO: "{prompt.exampleSentence}"
          </p>
        )}
      </div>

      {/* ── EDITOR CARD ── */}
      <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 mb-8 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs text-text-content/50 uppercase tracking-wider">
            STESURA DIARIO DI BORDO IN INGLESE:
          </p>
          <span
            className={[
              'font-mono text-xs px-2.5 py-0.5 rounded font-bold',
              wordCount >= (prompt?.minWords || 50) && wordCount <= (prompt?.maxWords || 80) + 15
                ? 'text-signal-ok bg-signal-ok/10'
                : 'text-text-content/50 bg-bg-primary',
            ].join(' ')}
          >
            {wordCount} / {prompt?.minWords}–{prompt?.maxWords} PAROLE
          </span>
        </div>

        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Begin drafting your mission logbook here..."
          className="w-full bg-bg-primary border border-border-subtle rounded p-4 font-mono text-sm text-text-display outline-none focus:border-signal-ok transition-colors"
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={validateText}
            disabled={!text.trim()}
            className="px-6 py-2.5 rounded-pill bg-white text-black hover:bg-white/90 font-mono text-xs font-semibold tracking-wider transition-opacity shadow disabled:opacity-30 disabled:cursor-not-allowed"
          >
            INVIA AL CONTROLLO MISSIONE
          </button>
        </div>
      </div>

      {/* ── EVALUATION RESULT ── */}
      {result && (
        <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <div>
              <p className="font-mono text-xs text-text-content/40 uppercase">
                VALUTAZIONE SINTATTICA ED EURISTICA
              </p>
              <h3 className="heading-display text-xl text-text-display">
                PUNTEGGIO GENERALE: {result.score} / 100
              </h3>
            </div>
            {result.score >= 65 ? (
              <span className="font-mono text-xs px-3 py-1.5 rounded bg-signal-ok/20 text-signal-ok border border-signal-ok font-bold">
                TRACCIA CONVALIDATA (+{result.xpAwarded || 20} XP)
              </span>
            ) : (
              <span className="font-mono text-xs px-3 py-1.5 rounded bg-signal-err/20 text-signal-err border border-signal-err font-bold">
                REVISIONE RICHIESTA (SOGLIA 65)
              </span>
            )}
          </div>

          <div className="space-y-2 mb-6">
            {result.feedbackNotes.map((note, idx) => (
              <p key={idx} className="font-mono text-xs text-text-content/80 flex items-start gap-2">
                <span className="text-signal-ok">▸</span> {note}
              </p>
            ))}
          </div>

          {result.score >= 65 && (
            <div className="flex justify-end">
              <GhostButton size="md" onClick={handleNextSequential}>
                PROSSIMA TRACCIA LOGBOOK &rarr;
              </GhostButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
