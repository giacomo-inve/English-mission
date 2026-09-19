import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, ChevronRight, RotateCcw } from 'lucide-react'
import { quizItems, type QuizItem } from '../db/seed'
import { useProgress } from '../hooks/useProgress'
import { useSRS } from '../hooks/useSRS'
import ProgressBar from '../components/ProgressBar'
import GhostButton from '../components/GhostButton'

type AnswerState = 'idle' | 'correct' | 'incorrect'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-GB'
  utt.rate = 0.9
  window.speechSynthesis.speak(utt)
}

interface QuestionCardProps {
  item: QuizItem
  onAnswer: (index: number) => void
  answerState: AnswerState
  selectedIndex: number | null
}

function QuestionCard({ item, onAnswer, answerState, selectedIndex }: QuestionCardProps) {
  const getOptionClass = (i: number) => {
    if (answerState === 'idle') return 'answer-option'
    if (i === item.correctIndex) return 'answer-option correct'
    if (i === selectedIndex && answerState === 'incorrect') return 'answer-option incorrect'
    return 'answer-option opacity-40'
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      {/* Options */}
      {item.options.map((option, i) => (
        <button
          key={i}
          className={getOptionClass(i)}
          onClick={() => onAnswer(i)}
          disabled={answerState !== 'idle'}
        >
          <span className="font-mono text-xs text-white/20 mr-3 select-none">
            {String.fromCharCode(65 + i)}
          </span>
          {option}
        </button>
      ))}
    </div>
  )
}

export default function Lesson() {
  const navigate = useNavigate()
  const { addXP } = useProgress()
  const { recordAnswer, ensureItem } = useSRS()

  const [index, setIndex] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const total = quizItems.length
  const current: QuizItem = quizItems[index]
  const progress = Math.round((index / total) * 100)

  // Ensure SRS item exists for this quiz
  useEffect(() => {
    if (current?.relatedId) {
      ensureItem(current.relatedId)
    }
  }, [current, ensureItem])

  const handleAnswer = useCallback(async (i: number) => {
    if (answerState !== 'idle') return
    setSelectedIndex(i)
    const correct = i === current.correctIndex
    setAnswerState(correct ? 'correct' : 'incorrect')
    if (correct) {
      setScore((s) => s + 1)
      await addXP(10)
    }
    if (current.relatedId) {
      await recordAnswer(current.relatedId, correct)
    }
  }, [answerState, current, addXP, recordAnswer])

  const handleNext = () => {
    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex((i) => i + 1)
      setAnswerState('idle')
      setSelectedIndex(null)
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-white/30 text-xs tracking-widest mb-4" style={{ letterSpacing: '0.2em' }}>
          SESSIONE COMPLETATA
        </p>
        <h2 className="heading-display text-4xl mb-2">{score}/{total}</h2>
        <p className="text-text-content/50 text-sm mb-10">
          {score === total ? 'Perfetto! Sessione senza errori.' : `${score} risposte corrette su ${total}.`}
        </p>
        <div className="flex gap-4">
          <GhostButton onClick={() => { setIndex(0); setDone(false); setScore(0); setAnswerState('idle'); setSelectedIndex(null) }}>
            <RotateCcw size={14} />
            RICOMINCIA
          </GhostButton>
          <GhostButton onClick={() => navigate('/')}>
            HOME
          </GhostButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary">

      {/* ── TOP BAR: progress + counter ── */}
      <div className="px-6 pt-6 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-white/20 text-xs tracking-widest" style={{ letterSpacing: '0.18em' }}>
            {index + 1} / {total}
          </span>
          <span className="font-mono text-white/20 text-xs">
            {score} ✓
          </span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* ── QUESTION ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Type badge */}
        <p className="font-mono text-white/20 text-xs tracking-widest mb-8 uppercase" style={{ letterSpacing: '0.18em' }}>
          {current.type === 'translate' && 'TRADUZIONE'}
          {current.type === 'fill-blank' && 'COMPLETA LA FRASE'}
          {current.type === 'choose-form' && 'SCEGLI LA FORMA'}
        </p>

        {/* Question text */}
        <div className="flex items-center gap-3 mb-10 text-center">
          <h2 className="text-text-display text-2xl font-sans font-light leading-snug max-w-lg">
            {current.question}
          </h2>
          {current.audioText && (
            <button
              onClick={() => speak(current.audioText!)}
              className="shrink-0 text-white/30 hover:text-white transition-colors"
              aria-label="Pronuncia"
            >
              <Volume2 size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Answer options */}
        <QuestionCard
          item={current}
          onAnswer={handleAnswer}
          answerState={answerState}
          selectedIndex={selectedIndex}
        />

        {/* Feedback & Next */}
        {answerState !== 'idle' && (
          <div className="mt-8 w-full max-w-xl mx-auto space-y-4">
            {/* Explanation */}
            <div
              className="px-5 py-4 rounded-sm text-sm"
              style={{
                border: `1px solid ${answerState === 'correct' ? '#3DDC84' : '#FF5C5C'}`,
                color: answerState === 'correct' ? '#3DDC84' : '#FF5C5C',
              }}
            >
              <p className="font-mono text-xs mb-1 uppercase tracking-wider opacity-70">
                {answerState === 'correct' ? 'CORRETTO' : 'SBAGLIATO'}
              </p>
              <p className="text-text-content text-sm" style={{ color: '#f0f0fa' }}>
                {current.explanation}
              </p>
            </div>

            <div className="flex justify-end">
              <GhostButton onClick={handleNext}>
                {index + 1 < total ? (
                  <>AVANTI <ChevronRight size={14} /></>
                ) : (
                  'RISULTATI'
                )}
              </GhostButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
