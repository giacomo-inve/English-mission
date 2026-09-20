import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'
import SectionGuideModal from '../components/SectionGuideModal'
import { SPEAKING_PHRASES, type SpeakingPhrase } from '../db/seed'
import { playStartRecording, playSuccessChime, playErrorHum } from '../utils/sfx'

// Fallback SpeechRecognition type for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

const LEVEL_LIST = ['A1', 'A2', 'B1', 'B2'] as const
type LevelType = (typeof LEVEL_LIST)[number]

export default function Speaking() {
  const { progress, addXP, updateSectionLevel, markCompleted } = useProgress()
  const [selectedLevel, setSelectedLevel] = useState<LevelType>('A1')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [spokenText, setSpokenText] = useState('')
  const [hasSupport, setHasSupport] = useState(true)
  const [evaluated, setEvaluated] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [wordResults, setWordResults] = useState<{ word: string; correct: boolean }[]>([])
  const [xpAwarded, setXpAwarded] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [useManualFallback, setUseManualFallback] = useState(false)

  // Sync initial level from Dexie
  useEffect(() => {
    if (progress?.speaking_level && LEVEL_LIST.includes(progress.speaking_level as LevelType)) {
      setSelectedLevel(progress.speaking_level as LevelType)
    }
  }, [progress?.speaking_level])

  // Filter phrases by level
  const activePhrases = useMemo(() => {
    const list = SPEAKING_PHRASES.filter((p) => p.level === selectedLevel)
    return list.length > 0 ? list : SPEAKING_PHRASES
  }, [selectedLevel])

  const phrase = activePhrases[currentIdx] || activePhrases[0]
  const recognitionRef = useRef<any>(null)

  // Completed IDs set
  const completedSet = useMemo(() => {
    return new Set(progress?.completed_exercise_ids ?? [])
  }, [progress?.completed_exercise_ids])

  const isCurrentCompleted = completedSet.has(phrase?.id)

  // Check speech recognition support
  useEffect(() => {
    const win = window as unknown as IWindow
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setHasSupport(false)
      setUseManualFallback(true)
    }
  }, [])

  // Listen to reference audio via TTS
  const playSampleAudio = () => {
    if (!('speechSynthesis' in window) || !phrase) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(phrase.text)
    utt.lang = 'en-GB'
    utt.rate = progress?.voiceSpeed ?? 0.85
    window.speechSynthesis.speak(utt)
  }

  // Switch level
  const handleSelectLevel = async (lvl: LevelType) => {
    if (isRecording) stopRecording()
    setSelectedLevel(lvl)
    await updateSectionLevel('speaking_level', lvl)
    setCurrentIdx(0)
    resetEvaluation()
  }

  const resetEvaluation = () => {
    setSpokenText('')
    setEvaluated(false)
    setAccuracy(null)
    setWordResults([])
    setXpAwarded(false)
    setManualInput('')
  }

  // Switch phrase
  const switchPhrase = (idx: number) => {
    if (isRecording) stopRecording()
    setCurrentIdx(idx)
    resetEvaluation()
  }

  // Next sequential uncompleted
  const handleNextSequential = () => {
    if (activePhrases.length <= 1) return
    // Search forward for next uncompleted
    for (let i = 1; i < activePhrases.length; i++) {
      const targetIdx = (currentIdx + i) % activePhrases.length
      if (!completedSet.has(activePhrases[targetIdx].id)) {
        switchPhrase(targetIdx)
        return
      }
    }
    // All completed: simply advance to next
    switchPhrase((currentIdx + 1) % activePhrases.length)
  }

  // Compare words & trigger SFX
  const evaluateSpeech = useCallback(
    (textToEvaluate: string) => {
      if (!phrase) return
      const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '')
      const targetWords = phrase.text.split(/\s+/).filter(Boolean)
      const spokenWords = textToEvaluate.split(/\s+/).map(cleanWord).filter(Boolean)
      const spokenSet = new Set(spokenWords)

      let correctCount = 0
      const results = targetWords.map((origWord) => {
        const cleaned = cleanWord(origWord)
        const isCorrect = spokenSet.has(cleaned)
        if (isCorrect) correctCount++
        return { word: origWord, correct: isCorrect }
      })

      const acc = Math.round((correctCount / targetWords.length) * 100)
      setWordResults(results)
      setAccuracy(acc)
      setEvaluated(true)

      if (acc >= 70) {
        // Success SFX
        playSuccessChime()
        markCompleted(phrase.id, 'speaking')
        if (!xpAwarded) {
          const gain = acc >= 90 ? 25 : 15
          addXP(gain)
          setXpAwarded(true)
        }
      } else {
        // Error SFX
        playErrorHum()
      }
    },
    [phrase, xpAwarded, addXP, markCompleted],
  )

  // Start recording with Star Wars SFX
  const startRecording = () => {
    // SFX: Comms Open + Beep Droid
    playStartRecording()

    const win = window as unknown as IWindow
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setUseManualFallback(true)
      return
    }

    try {
      window.speechSynthesis?.cancel()
      const recognition = new SpeechRec()
      recognition.lang = 'en-GB'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsRecording(true)
        setSpokenText('')
        setEvaluated(false)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSpokenText(transcript)
        setIsRecording(false)
        evaluateSpeech(transcript)
      }

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.warn('Speech recognition start failed:', err)
      setIsRecording(false)
      setUseManualFallback(true)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
    }
    setIsRecording(false)
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return
    setSpokenText(manualInput)
    evaluateSpeech(manualInput)
  }

  const allCompletedInLevel = useMemo(() => {
    return activePhrases.length > 0 && activePhrases.every((p) => completedSet.has(p.id))
  }, [activePhrases, completedSet])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8 flex items-start justify-between">
        <div>
          <p
            className="font-mono text-text-content/40 text-xs tracking-widest mb-1"
            style={{ letterSpacing: '0.22em' }}
          >
            MODULO VOCALE ATTIVO · TELEMETRIA FONETICA
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
            <Mic size={30} strokeWidth={1.5} className="text-signal-ok" /> VOCAL LINK
          </h1>
        </div>

        {/* Top Right: Contextual Guide (i) */}
        <SectionGuideModal
          sectionTitle="VOCAL LINK · GUIDA OPERATIVA"
          sectionSubtitle="RILEVAMENTO E ALLENAMENTO FONETICO"
          objective="Addestrare l'apparato vocale alla corretta pronuncia inglese, collegando riconoscimento in tempo reale e correzione automatica."
          methodology={[
            'Ascolta attentamente la frase guida con il pulsante audio prima di registrare.',
            'Ripeti a voce alta scandendo chiaramente ogni sillaba senza fretta.',
            'Osserva le parole evidenziate in verde (corrette) o rosso (da rifinire).',
            'Raggiungi almeno il 70% di accuratezza per superare l\'esercizio e guadagnare telemetria XP.',
          ]}
          controls={[
            { name: 'REGISTRA (MIC)', desc: 'Attiva il ricevitore vocale con segnale radio SFX e registra la voce.' },
            { name: 'ASCOLTA GUIDA', desc: 'Riproduce la frase con accento britannico calibrato.' },
            { name: 'SELETTORE LIVELLO', desc: 'Bypass immediato tra A1, A2, B1 e B2 senza blocchi.' },
            { name: 'MODALITÀ SEQUENZIALE', desc: 'Avanza automaticamente ai soli esercizi non ancora superati.' },
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
              <CheckCircle2 size={13} /> SUPERATO
            </span>
          )}
        </div>
      </div>

      {allCompletedInLevel && (
        <div className="mb-6 p-4 rounded bg-signal-ok/10 border border-signal-ok/30 flex items-center gap-3 text-signal-ok text-xs font-mono">
          <Sparkles size={16} /> TUTTI GLI ESERCIZI DEL LIVELLO {selectedLevel} SONO STATI SUPERATI!
        </div>
      )}

      {/* ── PHRASE SELECTOR STRIP ── */}
      <div className="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {activePhrases.map((p, idx) => {
            const isCompleted = completedSet.has(p.id)
            return (
              <button
                key={p.id}
                onClick={() => switchPhrase(idx)}
                className={[
                  'font-mono text-xs px-3 py-1.5 rounded border transition-all shrink-0 flex items-center gap-1.5',
                  currentIdx === idx
                    ? 'border-signal-ok text-signal-ok bg-signal-ok/10 font-bold'
                    : 'border-border-subtle text-text-content/50 hover:border-text-display/50',
                ].join(' ')}
              >
                {isCompleted && <Check size={11} className="text-signal-ok" />}
                FRASI 0{idx + 1}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleNextSequential}
          className="font-mono text-xs px-3 py-1.5 rounded border border-border-subtle hover:border-text-display text-text-content/70 hover:text-text-display shrink-0 ml-2"
          title="Salta al prossimo non ancora completato"
        >
          PROSSIMO NON COMPLETATO &rarr;
        </button>
      </div>

      {/* ── MAIN VOCAL CARD ── */}
      <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-10 mb-8 flex flex-col items-center text-center shadow-lg">
        {/* Phrase badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-text-content/40 tracking-widest uppercase">
            TARGET LIVELLO {phrase?.level} · VOCAL LINK {currentIdx + 1}/{activePhrases.length}
          </span>
        </div>

        {/* Phrase English Text */}
        <h2 className="heading-display text-2xl sm:text-3xl text-text-display mb-4 max-w-2xl leading-relaxed">
          {phrase?.text}
        </h2>

        {/* IPA Pronunciation */}
        {phrase?.ipa && (
          <p className="font-mono text-text-content/50 text-xs sm:text-sm mb-3 tracking-wide">
            {phrase.ipa}
          </p>
        )}

        {/* Italian Translation */}
        <p className="font-sans text-sm text-text-content/60 max-w-xl mb-8 italic">
          "{phrase?.translation}"
        </p>

        {/* Listen button */}
        <button
          onClick={playSampleAudio}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill border border-border-subtle hover:border-text-display text-text-display font-mono text-xs tracking-wider transition-colors mb-8"
        >
          <Volume2 size={16} /> ASCOLTA GUIDA AUDIO
        </button>

        {/* ── RECORDING BUTTON & RING ── */}
        <div className="relative my-4 flex items-center justify-center">
          {isRecording && (
            <div className="absolute w-24 h-24 rounded-full border border-signal-ok pulse-white-ring" />
          )}
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? 'Interrompi registrazione' : 'Avvia registrazione'}
            className={[
              'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl',
              isRecording
                ? 'bg-signal-ok text-black scale-105'
                : 'bg-text-display text-bg-primary hover:scale-105',
            ].join(' ')}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
        </div>

        <p className="font-mono text-xs text-text-content/40 mt-3 tracking-wider uppercase">
          {isRecording ? 'REGISTRAZIONE IN CORSO · PARLA ORA' : 'TOCCA PER REGISTRARE'}
        </p>

        {/* Manual fallback input */}
        {useManualFallback && (
          <div className="w-full max-w-md mt-6 pt-6 border-t border-border-subtle">
            <p className="font-mono text-xs text-text-content/40 mb-2">
              FALLBACK MANUALE (SIMULAZIONE VOCALE):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Digita la frase pronunciata..."
                className="flex-1 bg-bg-primary border border-border-subtle px-3 py-2 rounded text-xs font-mono text-text-display"
              />
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 rounded border border-border-subtle hover:border-text-display text-xs font-mono"
              >
                VERIFICA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── EVALUATION RESULTS ── */}
      {evaluated && accuracy !== null && (
        <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <div>
              <p className="font-mono text-xs text-text-content/40 tracking-wider uppercase">
                TELEMETRIA RICONOSCIMENTO
              </p>
              <h3 className="heading-display text-xl text-text-display">
                ACCURATEZZA FONETICA: {accuracy}%
              </h3>
            </div>
            <div>
              {accuracy >= 70 ? (
                <span className="font-mono text-xs px-3 py-1.5 rounded bg-signal-ok/20 text-signal-ok border border-signal-ok font-bold flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.5} /> SOGLIA SUPERATA (+15 XP)
                </span>
              ) : (
                <span className="font-mono text-xs px-3 py-1.5 rounded bg-signal-err/20 text-signal-err border border-signal-err font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> RIPROVA PERFEZIONANDO
                </span>
              )}
            </div>
          </div>

          {/* Word-by-word breakdown */}
          <div className="mb-6">
            <p className="font-mono text-xs text-text-content/40 mb-3 tracking-wider uppercase">
              ANALISI VOCABOLI PRONUNCIATI:
            </p>
            <div className="flex flex-wrap gap-2">
              {wordResults.map((r, i) => (
                <span
                  key={i}
                  className={[
                    'font-mono text-sm px-3 py-1 rounded border',
                    r.correct
                      ? 'border-signal-ok text-signal-ok bg-signal-ok/10'
                      : 'border-signal-err/50 text-signal-err bg-signal-err/10',
                  ].join(' ')}
                >
                  {r.word}
                </span>
              ))}
            </div>
          </div>

          {/* Spoken sentence recorded */}
          {spokenText && (
            <p className="font-mono text-xs text-text-content/50 border-t border-border-subtle pt-4">
              TESTO ACQUISITO: <span className="text-text-display">"{spokenText}"</span>
            </p>
          )}

          {/* Next CTA if completed */}
          {accuracy >= 70 && (
            <div className="mt-6 flex justify-end">
              <GhostButton size="md" onClick={handleNextSequential}>
                PROSSIMA FRASE VOCAL LINK &rarr;
              </GhostButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
