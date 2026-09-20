import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Volume2,
  ChevronRight,
  RotateCcw,
  Info,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
  Radio,
  BookOpen,
  Check,
  Send,
  HelpCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import { EXERCISES, type Exercise, type BBCExplanation } from '../db/seed'
import { getCompletedExerciseIds, markExerciseCompleted } from '../db/database'
import { useProgress } from '../hooks/useProgress'
import ProgressBar from '../components/ProgressBar'
import GhostButton from '../components/GhostButton'
import { playSuccessChime, playErrorHum } from '../utils/sfx'

const LEVEL_LIST = ['A1', 'A2', 'B1', 'B2'] as const
type LevelType = (typeof LEVEL_LIST)[number]
type AnswerState = 'idle' | 'correct' | 'incorrect'

interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

function speak(text: string, rate = 0.9) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-GB'
  utt.rate = rate
  window.speechSynthesis.speak(utt)
}

function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function verifyAnswer(userInput: string, target: string | string[]): boolean {
  const normUser = normalizeAnswer(userInput)
  if (!normUser) return false
  if (Array.isArray(target)) {
    return target.some((ans) => normalizeAnswer(ans) === normUser)
  }
  return normalizeAnswer(target) === normUser
}

// ─────────────────────────────────────────
// BBC 3-Part Explanation Panel
// ─────────────────────────────────────────

function ExplanationPanel({ explanation }: { explanation: string | BBCExplanation }) {
  if (typeof explanation === 'string') {
    return <p className="leading-relaxed">{explanation}</p>
  }

  return (
    <div className="space-y-3 font-sans text-left">
      {/* 1. Grammatical Rule */}
      <div className="p-3 rounded bg-bg-primary/60 border border-signal-ok/30 space-y-1">
        <span className="font-mono text-[10px] font-bold text-signal-ok uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen size={12} />
          REGOLA DIDATTICA (CAMBRIDGE / CEFR):
        </span>
        <p className="text-xs text-text-display/90 leading-relaxed font-normal">
          {explanation.rule}
        </p>
      </div>

      {/* 2. The Trap (Interference Warning) */}
      <div className="p-3 rounded bg-signal-warn/10 border border-signal-warn/30 space-y-1">
        <span className="font-mono text-[10px] font-bold text-signal-warn uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle size={12} />
          ATTENZIONE AL TRANELLO (THE TRAP):
        </span>
        <p className="text-xs text-signal-warn/95 leading-relaxed font-normal">
          {explanation.trapWarning}
        </p>
      </div>

      {/* 3. BBC in Action */}
      <div className="p-3 rounded bg-signal-ok/10 border border-signal-ok/30 space-y-1">
        <span className="font-mono text-[10px] font-bold text-signal-ok uppercase tracking-wider flex items-center gap-1.5">
          <Radio size={12} />
          ESEMPIO AUTENTICO (BBC IN ACTION):
        </span>
        <p className="text-xs italic text-text-display font-medium leading-relaxed">
          {explanation.bbcExample}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// ExerciseCard Component with key={currentExercise.id}
// ─────────────────────────────────────────

interface ExerciseCardProps {
  exercise: Exercise
  onVerified: (isCorrect: boolean) => void
  answerState: AnswerState
  onNext: () => void
  isLast: boolean
}

function ExerciseCard({ exercise, onVerified, answerState, onNext, isLast }: ExerciseCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [textInput, setTextInput] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasSpeechRec, setHasSpeechRec] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0>(1.0)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const win = window as unknown as IWindow
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setHasSpeechRec(false)
    }
  }, [])

  // Clean speech synthesis and speech recognition on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [])

  // Handle multiple-choice answer
  const handleSelectOption = (idx: number) => {
    if (answerState !== 'idle') return
    setSelectedOption(idx)
    const selectedText = exercise.options?.[idx] ?? ''
    const isCorrect = verifyAnswer(selectedText, exercise.correctAnswer)
    onVerified(isCorrect)
  }

  // Handle text-based answer (cloze, sentence-transformation, listening-dictation)
  const handleSubmitText = () => {
    if (answerState !== 'idle' || !textInput.trim()) return
    const isCorrect = verifyAnswer(textInput, exercise.correctAnswer)
    onVerified(isCorrect)
  }

  // Handle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const win = window as unknown as IWindow
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      alert('Riconoscimento vocale non supportato in questo browser. Utilizza la casella di testo.')
      return
    }

    try {
      const recognition = new SpeechRec()
      recognition.lang = 'en-GB'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTextInput(transcript)
        const isCorrect = verifyAnswer(transcript, exercise.correctAnswer)
        onVerified(isCorrect)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const playReferenceAudio = (text: string) => {
    speak(text, playbackSpeed)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ── Exercise Meta & Instruction ── */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-signal-ok/10 text-signal-ok border border-signal-ok/30 font-semibold uppercase">
            {exercise.level} · {exercise.type.replace('-', ' ')}
          </span>
          <span className="font-mono text-xs text-text-content/50 uppercase">
            {exercise.title}
          </span>
          {exercise.phoneticsFocus && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-signal-warn/10 text-signal-warn border border-signal-warn/30 flex items-center gap-1">
              <Volume2 size={12} />
              {exercise.phoneticsFocus}
            </span>
          )}
        </div>

        {/* Info button for Cambridge grammatical rationale */}
        <button
          onClick={() => setShowInfo((prev) => !prev)}
          className={`p-1.5 rounded-full border transition-all ${
            showInfo
              ? 'border-signal-ok text-signal-ok bg-signal-ok/10'
              : 'border-border-subtle text-text-content/50 hover:text-text-display hover:border-text-display'
          }`}
          title="Mostra spiegazione didattica Cambridge / BBC"
          aria-label="Grammar explanation info"
        >
          <Info size={16} />
        </button>
      </div>

      {/* ── Context Scenario Badge (BBC Learning English) ── */}
      {exercise.contextScenario && (
        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded bg-signal-ok/5 border border-signal-ok/25 text-xs text-text-content/90 animate-fadeIn">
          <Radio size={15} className="text-signal-ok shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] uppercase font-bold text-signal-ok tracking-wider block">
              SCENARIO CONTESTUALE · BBC LEARNING ENGLISH
            </span>
            <p className="italic text-text-display/95 font-medium">{exercise.contextScenario}</p>
          </div>
        </div>
      )}

      {/* ── Optional Cambridge / BBC Grammar Info Collapsible ── */}
      {showInfo && (
        <div className="p-4 rounded bg-bg-section border border-signal-ok/40 text-xs font-sans text-text-content/90 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 font-mono text-signal-ok font-semibold">
            <HelpCircle size={14} />
            <span>METODOLOGIA DIDATTICA CEFR / BBC:</span>
          </div>
          <ExplanationPanel explanation={exercise.explanation} />
        </div>
      )}

      {/* ── Instruction ── */}
      <p className="text-text-content/70 text-sm font-sans italic">
        {exercise.instruction}
      </p>

      {/* ── Real Dialogue Conversation Flow (BBC English at Work) ── */}
      {exercise.dialogue && exercise.dialogue.length > 0 && (
        <div className="space-y-2.5 p-4 rounded bg-bg-section/70 border border-border-subtle animate-fadeIn">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={13} className="text-signal-ok" />
            <span className="font-mono text-[10px] text-text-content/50 tracking-wider uppercase">
              DIALOGO IN CONTESTO REALE
            </span>
          </div>
          {exercise.dialogue.map((turn, dIdx) => (
            <div key={dIdx} className="flex items-start gap-3 text-sm">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-bg-primary border border-border-subtle text-signal-ok shrink-0 min-w-[75px] text-center">
                {turn.speaker}
              </span>
              <p className="font-sans text-text-display/90 leading-relaxed bg-bg-primary/50 px-3 py-1.5 rounded border border-border-subtle/40 flex-1">
                {turn.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Context Sentence (for Cambridge sentence-transformation) ── */}
      {exercise.contextSentence && (
        <div className="p-4 rounded bg-bg-section/80 border border-border-subtle">
          <span className="font-mono text-[10px] text-text-content/40 tracking-wider uppercase block mb-1">
            FRASE DI PARTENZA / CONTESTO
          </span>
          <p className="text-text-display text-base font-sans font-medium">
            "{exercise.contextSentence}"
          </p>
        </div>
      )}

      {/* ── Prompt Sentence & Audio Button ── */}
      <div className="p-5 rounded bg-bg-section border border-border-subtle text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-text-display text-xl sm:text-2xl font-sans font-light leading-snug">
            {exercise.prompt}
          </h2>

          {(exercise.audioText || exercise.type === 'listening-dictation') && (
            <button
              onClick={() => playReferenceAudio(exercise.audioText || exercise.prompt)}
              className="shrink-0 p-2 rounded-full border border-border-subtle text-text-content/60 hover:text-signal-ok hover:border-signal-ok transition-colors"
              title="Ascolta sintesi vocale"
              aria-label="Pronuncia audio"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>

        {exercise.type === 'listening-dictation' && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="font-mono text-[10px] text-text-content/40 uppercase">VELOCITÀ AUDIO:</span>
            <button
              onClick={() => setPlaybackSpeed(1.0)}
              className={`px-2 py-0.5 font-mono text-[10px] rounded border ${
                playbackSpeed === 1.0 ? 'border-signal-ok text-signal-ok' : 'border-border-subtle text-text-content/40'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => setPlaybackSpeed(0.8)}
              className={`px-2 py-0.5 font-mono text-[10px] rounded border ${
                playbackSpeed === 0.8 ? 'border-signal-ok text-signal-ok' : 'border-border-subtle text-text-content/40'
              }`}
            >
              0.8x
            </button>
          </div>
        )}
      </div>

      {/* ── INTERACTIVE INPUT AREA ACCORDING TO EXERCISE TYPE ── */}

      {/* 1. Multiple-Choice Type */}
      {exercise.type === 'multiple-choice' && exercise.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {exercise.options.map((option, i) => {
            const isSelected = selectedOption === i
            const isCorrectOption = verifyAnswer(option, exercise.correctAnswer)

            let style = 'bg-bg-section border-border-subtle text-text-display hover:border-text-display'
            if (answerState !== 'idle') {
              if (isCorrectOption) {
                style = 'bg-signal-ok/15 border-signal-ok text-signal-ok font-semibold'
              } else if (isSelected && !isCorrectOption) {
                style = 'bg-signal-err/15 border-signal-err text-signal-err font-semibold'
              } else {
                style = 'opacity-40 border-border-subtle text-text-content'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                disabled={answerState !== 'idle'}
                className={`w-full text-left p-4 rounded border text-sm font-sans transition-all flex items-center justify-between ${style}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs opacity-50 select-none">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </div>
                {answerState !== 'idle' && isCorrectOption && (
                  <Check size={16} className="text-signal-ok shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* 2. Cloze, Sentence-Transformation & Dictation Types */}
      {(exercise.type === 'cloze' ||
        exercise.type === 'sentence-transformation' ||
        exercise.type === 'listening-dictation') && (
        <div className="pt-2 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitText()
              }}
              disabled={answerState !== 'idle'}
              placeholder={
                exercise.type === 'listening-dictation'
                  ? 'Trascrivi il messaggio ascoltato...'
                  : 'Scrivi qui la parola o espressione mancante...'
              }
              className="flex-1 bg-bg-section border border-border-subtle rounded px-4 py-3 text-sm text-text-display font-sans placeholder:text-text-content/30 focus:outline-none focus:border-signal-ok disabled:opacity-60"
              autoFocus
            />
            <button
              onClick={handleSubmitText}
              disabled={answerState !== 'idle' || !textInput.trim()}
              className="px-5 py-3 rounded bg-text-display text-bg-primary font-mono text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center gap-2 shrink-0"
            >
              <span>INVIA</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Speaking Prompt Type */}
      {exercise.type === 'speaking-prompt' && (
        <div className="pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GhostButton
              onClick={() => playReferenceAudio(exercise.audioText || exercise.prompt)}
              className="w-full sm:w-auto"
            >
              <Volume2 size={15} />
              ASCOLTA GUIDA PRONUNCIA
            </GhostButton>

            {hasSpeechRec && (
              <button
                onClick={toggleSpeechRecognition}
                disabled={answerState !== 'idle'}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-pill border font-mono text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isListening
                    ? 'border-signal-ok bg-signal-ok/20 text-signal-ok animate-pulse'
                    : 'border-border-subtle hover:border-text-display text-text-display'
                } disabled:opacity-40`}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                {isListening ? 'IN ASCOLTO (PARLA ORA)...' : 'REGISTRA CON MICROFONO'}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitText()
              }}
              disabled={answerState !== 'idle'}
              placeholder="Oppure verifica digitando la frase pronunciata..."
              className="flex-1 bg-bg-section border border-border-subtle rounded px-4 py-3 text-sm text-text-display font-sans placeholder:text-text-content/30 focus:outline-none focus:border-signal-ok disabled:opacity-60"
            />
            <button
              onClick={handleSubmitText}
              disabled={answerState !== 'idle' || !textInput.trim()}
              className="px-5 py-3 rounded bg-text-display text-bg-primary font-mono text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
            >
              VERIFICA
            </button>
          </div>
        </div>
      )}

      {/* ── FEEDBACK & NEXT BUTTON ── */}
      {answerState !== 'idle' && (
        <div className="pt-4 space-y-4 animate-fadeIn">
          <div
            className="p-5 rounded border text-sm space-y-2"
            style={{
              borderColor: answerState === 'correct' ? '#3DDC84' : '#FF5C5C',
              backgroundColor: answerState === 'correct' ? 'rgba(61, 220, 132, 0.08)' : 'rgba(255, 92, 92, 0.08)',
            }}
          >
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold">
              {answerState === 'correct' ? (
                <>
                  <CheckCircle2 size={16} className="text-signal-ok" />
                  <span className="text-signal-ok">RISPOSTA CORRETTA (+15 XP)</span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-signal-err" />
                  <span className="text-signal-err">DA REVISIONARE</span>
                </>
              )}
            </div>

            {answerState === 'incorrect' && (
              <p className="text-xs font-mono text-text-display">
                <span className="opacity-60">Risposta attesa: </span>
                <strong className="text-signal-ok">
                  {Array.isArray(exercise.correctAnswer)
                    ? exercise.correctAnswer.join('  /  ')
                    : exercise.correctAnswer}
                </strong>
              </p>
            )}

            <div className="pt-2 border-t border-border-subtle/50 text-xs leading-relaxed text-text-content/90 font-sans">
              <span className="font-mono text-[10px] text-text-content/50 uppercase block mb-1">
                SPIEGAZIONE DIDATTICA APPROFONDITA:
              </span>
              <ExplanationPanel explanation={exercise.explanation} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <GhostButton size="lg" onClick={onNext}>
              {isLast ? (
                <>COMPLETA SESSIONE <Sparkles size={16} className="text-signal-ok ml-2" /></>
              ) : (
                <>AVANTI <ChevronRight size={16} className="ml-1" /></>
              )}
            </GhostButton>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Main Lesson Page
// ─────────────────────────────────────────

export default function Lesson() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { progress, addXP } = useProgress()

  const urlLevel = searchParams.get('level') as LevelType | null
  const urlUnit = searchParams.get('unit')

  const [selectedLevel, setSelectedLevel] = useState<LevelType>(
    urlLevel && LEVEL_LIST.includes(urlLevel) ? urlLevel : 'B1',
  )
  const [selectedUnit, setSelectedUnit] = useState<string | null>(urlUnit || null)

  // In-memory decoupled session queue
  const [sessionQueue, setSessionQueue] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLevelMastered, setIsLevelMastered] = useState(false)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load session queue decoupled from Dexie continuous writes
  const initSession = useCallback(
    async (lvl: LevelType, unitId: string | null = null, practice = false) => {
      setLoading(true)
      const completedIds = await getCompletedExerciseIds()
      const completedSet = new Set(completedIds)

      let candidates = EXERCISES.filter((e) => e.level === lvl)
      if (unitId) {
        const unitMatches = candidates.filter((e) => e.unit === unitId)
        if (unitMatches.length > 0) {
          candidates = unitMatches
        }
      }

      const uncompleted = practice
        ? candidates
        : candidates.filter((e) => !completedSet.has(e.id))

      if (uncompleted.length === 0) {
        setSessionQueue(candidates)
        setIsLevelMastered(true)
        setCurrentIndex(0)
      } else {
        setSessionQueue(uncompleted)
        setIsLevelMastered(false)
        setCurrentIndex(0)
      }

      setIsPracticeMode(practice)
      setAnswerState('idle')
      setScore(0)
      setLoading(false)
    },
    [],
  )

  // Initial load
  useEffect(() => {
    initSession(selectedLevel, selectedUnit, false)
  }, [selectedLevel, selectedUnit, initSession])

  // Handle verified answer
  const handleAnswerVerified = useCallback(
    async (isCorrect: boolean) => {
      if (answerState !== 'idle') return
      setAnswerState(isCorrect ? 'correct' : 'incorrect')

      const current = sessionQueue[currentIndex]
      if (isCorrect && current) {
        playSuccessChime()
        setScore((prev) => prev + 1)
        await addXP(15)
        // Background persistence in Dexie — decoupled from memory sessionQueue!
        await markExerciseCompleted(current.id, 'lesson')
      } else {
        playErrorHum()
      }
    },
    [answerState, sessionQueue, currentIndex, addXP],
  )

  // Handle moving to next exercise
  const handleNextExercise = useCallback(() => {
    if (currentIndex + 1 < sessionQueue.length) {
      setCurrentIndex((prev) => prev + 1)
      setAnswerState('idle')
    } else {
      setIsLevelMastered(true)
    }
  }, [currentIndex, sessionQueue.length])

  // Switch to next CEFR level
  const handleNextLevel = () => {
    const nextIdx = LEVEL_LIST.indexOf(selectedLevel) + 1
    if (nextIdx < LEVEL_LIST.length) {
      const nextLvl = LEVEL_LIST[nextIdx]
      setSelectedLevel(nextLvl)
      setSelectedUnit(null)
      setSearchParams({ level: nextLvl })
      initSession(nextLvl, null, false)
    } else {
      // Completed all levels through B2
      setSelectedLevel('B2')
      setSelectedUnit(null)
      initSession('B2', null, true)
    }
  }

  // Replay current level for practice
  const handleRepeatForTraining = () => {
    initSession(selectedLevel, selectedUnit, true)
  }

  // Switch level manually via tab selector
  const handleSelectLevelTab = (lvl: LevelType) => {
    setSelectedLevel(lvl)
    setSelectedUnit(null)
    setSearchParams({ level: lvl })
    initSession(lvl, null, false)
  }

  const currentExercise: Exercise | undefined = sessionQueue[currentIndex]
  const total = sessionQueue.length
  const progressPercent = total > 0 ? Math.round(((currentIndex + (answerState !== 'idle' ? 1 : 0)) / total) * 100) : 100

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      {/* ── TOP CONTROLS & LEVEL TABS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle mb-6">
        <div>
          <p className="font-mono text-text-content/40 text-[11px] tracking-widest uppercase">
            ENGLISH MISSION CONTROL · SESSIONE ATTIVA
          </p>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="heading-display text-2xl text-text-display">
              ADDESTRAMENTO ACCADEMICO
            </h1>
            {selectedUnit && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-bg-section border border-border-subtle text-text-content/60">
                UNITÀ: {selectedUnit}
              </span>
            )}
          </div>
        </div>

        {/* Level selector badges */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {LEVEL_LIST.map((lvl) => {
            const isActive = selectedLevel === lvl
            return (
              <button
                key={lvl}
                onClick={() => handleSelectLevelTab(lvl)}
                className={`px-3 py-1.5 rounded font-mono text-xs tracking-wider font-semibold transition-all ${
                  isActive
                    ? 'bg-signal-ok text-bg-primary shadow-sm'
                    : 'bg-bg-section border border-border-subtle text-text-content/70 hover:text-text-display'
                }`}
              >
                {lvl}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── LOADING STATE ── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-signal-ok border-t-transparent animate-spin mb-4" />
          <p className="font-mono text-xs text-text-content/50 uppercase tracking-wider">
            CARICAMENTO CODA DI SESSIONE...
          </p>
        </div>
      ) : isLevelMastered ? (
        /* ── SUMMARY SCREEN: "MISSIONE COMPLETATA: LIVELLO PADRONEGGIATO" ── */
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-signal-ok/15 border-2 border-signal-ok text-signal-ok flex items-center justify-center shadow-lg">
            <Award size={40} strokeWidth={2} />
          </div>

          <div>
            <span className="font-mono text-xs px-3 py-1 rounded-pill bg-signal-ok/20 text-signal-ok border border-signal-ok/30 font-bold uppercase tracking-wider">
              PADRONANZA CEFR {selectedLevel}
            </span>
            <h2 className="heading-display text-3xl sm:text-4xl text-text-display mt-3">
              MISSIONE COMPLETATA: LIVELLO PADRONEGGIATO
            </h2>
            <p className="text-text-content/70 text-sm max-w-md mx-auto mt-2 font-sans">
              {score > 0
                ? `Hai completato con successo la sessione rispondendo correttamente a ${score} esercizi su ${total}.`
                : `Tutti gli esercizi del livello ${selectedLevel} risultano completati nel tuo diario telemetrico.`}
            </p>
          </div>

          <div className="p-4 rounded bg-bg-section border border-border-subtle max-w-sm w-full font-mono text-xs space-y-2">
            <div className="flex justify-between text-text-content/60">
              <span>LIVELLO CORRENTE:</span>
              <span className="text-text-display font-semibold">{selectedLevel}</span>
            </div>
            <div className="flex justify-between text-text-content/60">
              <span>STATO TELEMETRIA:</span>
              <span className="text-signal-ok font-semibold">100% COMPLETATO</span>
            </div>
            {isPracticeMode && (
              <div className="flex justify-between text-text-content/60">
                <span>MODALITÀ:</span>
                <span className="text-text-display font-semibold">ALLENAMENTO</span>
              </div>
            )}
          </div>

          {/* TWO REQUIRED ACTIONS: [ PASSA AL LIVELLO SUCCESSIVO ] and [ RIPETI PER ALLENAMENTO ] */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <GhostButton size="lg" onClick={handleNextLevel}>
              <ArrowRight size={16} className="text-signal-ok" />
              PASSA AL LIVELLO SUCCESSIVO
            </GhostButton>

            <GhostButton size="lg" onClick={handleRepeatForTraining}>
              <RotateCcw size={16} />
              RIPETI PER ALLENAMENTO
            </GhostButton>

            <button
              onClick={() => navigate('/percorso')}
              className="text-text-content/50 hover:text-text-display font-mono text-xs uppercase tracking-wider py-2"
            >
              Mappa Missioni &rarr;
            </button>
          </div>
        </div>
      ) : currentExercise ? (
        /* ── ACTIVE EXERCISE WITH CLEAN KEY UNMOUNT ── */
        <div className="flex-1 flex flex-col justify-between space-y-6">
          {/* Progress Tracker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-text-content/50">
              <span className="tracking-widest">
                ESERCIZIO {currentIndex + 1} DI {total}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-signal-ok">PUNTI SESSIONE: {score}</span>
                {isPracticeMode && (
                  <span className="px-2 py-0.5 rounded bg-bg-section border border-border-subtle text-[10px] text-text-content/40">
                    ALLENAMENTO
                  </span>
                )}
              </div>
            </div>
            <ProgressBar value={progressPercent} />
          </div>

          {/* Keyed Exercise Component ensures clean state reset on each exercise transition */}
          <div className="flex-1 flex flex-col justify-center py-4">
            <ExerciseCard
              key={currentExercise.id}
              exercise={currentExercise}
              onVerified={handleAnswerVerified}
              answerState={answerState}
              onNext={handleNextExercise}
              isLast={currentIndex + 1 >= total}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
