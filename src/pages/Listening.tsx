import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Check, Eye, EyeOff, Volume2, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'

interface AudioClip {
  id: string
  title: string
  subtitle: string
  level: string
  durationSec: number
  text: string
  hint: string
}

const CLIPS: AudioClip[] = [
  {
    id: 'clip-1',
    title: 'ANNUNCIO AEROPORTUALE',
    subtitle: 'VOLO BA-482 · IMBARCO IMMEDIATO',
    level: 'A1–A2',
    durationSec: 18,
    text: 'Attention all passengers on British Airways flight BA-482 to London Heathrow. The flight is now boarding at Gate 14. Please have your passport and boarding pass ready for inspection. This is the final call for all remaining passengers.',
    hint: 'Fai attenzione al numero del volo, alla destinazione e al gate di imbarco.',
  },
  {
    id: 'clip-2',
    title: 'ORDINAZIONE AL CAFFÈ',
    subtitle: 'COLAZIONE E RICHIESTA CONTO',
    level: 'A1–A2',
    durationSec: 16,
    text: 'Good morning! Could I please have a black coffee and a warm croissant? I will also take a bottle of sparkling water. Can I pay by card or do you only accept cash? Thank you very much, keep the change.',
    hint: 'Concentrati sulle bevande richieste e sulla modalità di pagamento.',
  },
  {
    id: 'clip-3',
    title: 'BRIEFING CONTROLLO MISSIONE',
    subtitle: 'TELEMETRIA E PREPARAZIONE ACCENSIONE',
    level: 'A2–B1',
    durationSec: 22,
    text: 'Mission control to crew. All telemetry systems are nominal. Atmospheric pressure and oxygen levels are stable at one hundred and one kilopascals. Prepare for primary engine ignition in two minutes. Acknowledge and confirm trajectory coordinates.',
    hint: 'Ascolta i parametri di pressione e i minuti che mancano all\'accensione dei motori.',
  },
]

export default function Listening() {
  const { addXP } = useProgress()
  const [currentClipIdx, setCurrentClipIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1.0>(1.0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptionInput, setTranscriptionInput] = useState('')
  const [evaluated, setEvaluated] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [wordMatches, setWordMatches] = useState<{ word: string; matched: boolean }[]>([])
  const [xpEarned, setXpEarned] = useState(0)

  const clip = CLIPS[currentClipIdx]
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Clean speech synthesis on unmount or clip change
  const stopAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    return () => stopAudio()
  }, [stopAudio])

  // Reset clip state when switching
  const selectClip = (idx: number) => {
    stopAudio()
    setCurrentClipIdx(idx)
    setShowTranscript(false)
    setTranscriptionInput('')
    setEvaluated(false)
    setAccuracy(null)
    setWordMatches([])
  }

  const togglePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert('Sintesi vocale non supportata da questo browser.')
      return
    }

    if (isPlaying) {
      stopAudio()
      return
    }

    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(clip.text)
    utt.lang = 'en-GB'
    utt.rate = playbackSpeed
    utt.onend = () => setIsPlaying(false)
    utt.onerror = () => setIsPlaying(false)
    synthRef.current = utt

    setIsPlaying(true)
    window.speechSynthesis.speak(utt)
  }

  const changeSpeed = (speed: 0.75 | 1.0) => {
    setPlaybackSpeed(speed)
    if (isPlaying) {
      stopAudio()
    }
  }

  // Evaluate transcription
  const verifyTranscription = () => {
    if (!transcriptionInput.trim()) return

    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    const targetWords = clean(clip.text).split(/\s+/).filter(Boolean)
    const userWords = new Set(clean(transcriptionInput).split(/\s+/).filter(Boolean))

    let matchedCount = 0
    const matches = targetWords.map((w) => {
      const isMatched = userWords.has(w)
      if (isMatched) matchedCount++
      return { word: w, matched: isMatched }
    })

    const calculatedAcc = Math.round((matchedCount / targetWords.length) * 100)
    setWordMatches(matches)
    setAccuracy(calculatedAcc)
    setEvaluated(true)

    if (calculatedAcc >= 60 && xpEarned === 0) {
      const earned = calculatedAcc >= 90 ? 25 : 15
      setXpEarned(earned)
      addXP(earned)
    }
  }

  // Waveform bars heights pattern (32 bars)
  const waveformHeights = [
    8, 14, 22, 12, 28, 36, 18, 10, 24, 32, 16, 26, 38, 20, 14, 30,
    36, 18, 28, 12, 34, 22, 16, 26, 38, 14, 20, 30, 18, 12, 24, 10,
  ]

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-8">
        <div>
          <p className="font-mono text-white/30 text-xs tracking-widest mb-1" style={{ letterSpacing: '0.22em' }}>
            MODULO OPERATIVO · ASCOLTO & DETTATO
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-white">ASCOLTO</h1>
        </div>

        {/* Clip selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectClip((currentClipIdx - 1 + CLIPS.length) % CLIPS.length)}
            className="p-2 rounded-pill border border-border-subtle text-white/50 hover:text-white hover:border-white transition-colors"
            aria-label="Clip precedente"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-xs text-white/40 px-3 tracking-widest tabular-nums">
            CLIP {currentClipIdx + 1} / {CLIPS.length}
          </span>
          <button
            onClick={() => selectClip((currentClipIdx + 1) % CLIPS.length)}
            className="p-2 rounded-pill border border-border-subtle text-white/50 hover:text-white hover:border-white transition-colors"
            aria-label="Clip successiva"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── AUDIO PLAYER CARD ── */}
      <div
        className="p-6 sm:p-10 rounded-sm border border-border-subtle mb-10 text-center flex flex-col items-center"
        style={{ background: '#0a0a0a' }}
      >
        {/* Clip info */}
        <div className="mb-8">
          <span className="font-mono text-xs text-white/30 tracking-widest border border-border-subtle px-2.5 py-0.5 rounded-sm">
            {clip.level}
          </span>
          <h2 className="heading-display text-xl sm:text-2xl mt-3 text-white">
            {clip.title}
          </h2>
          <p className="font-mono text-white/35 text-xs tracking-wider mt-1">
            {clip.subtitle}
          </p>
        </div>

        {/* ── WAVEFORM VISUALIZER ── */}
        <div className="h-14 flex items-center justify-center gap-1.5 sm:gap-2 mb-8 w-full max-w-md select-none px-4">
          {waveformHeights.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying ? 'wave-bar-active bg-white' : 'bg-white/20'
              }`}
              style={{
                height: isPlaying ? `${h}px` : '4px',
                animationDelay: isPlaying ? `${(i * 0.05) % 0.8}s` : '0s',
              }}
            />
          ))}
        </div>

        {/* ── 72px CIRCULAR BUTTON ── */}
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={togglePlay}
            className="w-[72px] h-[72px] rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label={isPlaying ? 'Pausa audio' : 'Riproduci audio'}
          >
            {isPlaying ? (
              <Pause size={28} strokeWidth={1.75} />
            ) : (
              <Play size={28} strokeWidth={1.75} className="ml-1" />
            )}
          </button>
        </div>

        {/* Status text */}
        <p className="font-mono text-white/30 text-xs tracking-widest mb-6">
          {isPlaying ? 'IN RIPRODUZIONE AUDIO...' : 'PREMI PER AVVIARE LA RIPRODUZIONE'}
        </p>

        {/* ── SPEED SELECTOR & TRANSCRIPTION TOGGLE ── */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center border border-border-subtle rounded-pill p-0.5">
            <button
              onClick={() => changeSpeed(0.75)}
              className={`font-mono text-xs px-3 py-1 rounded-pill transition-all ${
                playbackSpeed === 0.75
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/40 hover:text-white'
              }`}
              style={{ letterSpacing: '0.14em' }}
            >
              0.75X
            </button>
            <button
              onClick={() => changeSpeed(1.0)}
              className={`font-mono text-xs px-3 py-1 rounded-pill transition-all ${
                playbackSpeed === 1.0
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/40 hover:text-white'
              }`}
              style={{ letterSpacing: '0.14em' }}
            >
              1.0X
            </button>
          </div>

          <button
            onClick={() => setShowTranscript((prev) => !prev)}
            className="btn-ghost text-xs py-1.5 px-4"
          >
            {showTranscript ? (
              <>
                <EyeOff size={13} /> NASCONDI TRASCRIZIONE
              </>
            ) : (
              <>
                <Eye size={13} /> MOSTRA TRASCRIZIONE
              </>
            )}
          </button>
        </div>

        {/* Revealed transcription */}
        {showTranscript && (
          <div className="mt-8 pt-6 border-t border-border-subtle w-full max-w-xl text-left">
            <p className="font-mono text-white/25 text-xs tracking-wider mb-2">
              TRASCRIZIONE ORIGINALE:
            </p>
            <p className="text-text-content/80 font-sans text-sm leading-relaxed">
              "{clip.text}"
            </p>
          </div>
        )}
      </div>

      {/* ── DICTATION & COMPREHENSION EXERCISE ── */}
      <div
        className="p-6 sm:p-8 rounded-sm border border-border-subtle"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-mono text-xs text-white tracking-widest uppercase">
              ESERCIZIO DI DETTATO
            </h3>
            <p className="text-text-content/40 text-xs mt-0.5">
              {clip.hint}
            </p>
          </div>
          {accuracy !== null && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/30">ACCURATEZZA:</span>
              <span
                className="font-mono text-sm font-bold tabular-nums"
                style={{ color: accuracy >= 70 ? '#3DDC84' : '#FF5C5C' }}
              >
                <AnimatedCounter value={accuracy} />%
              </span>
              {xpEarned > 0 && (
                <span className="font-mono text-xs flex items-center gap-1 text-signal-ok ml-2">
                  <Zap size={12} /> +{xpEarned} XP
                </span>
              )}
            </div>
          )}
        </div>

        {/* Input box */}
        <textarea
          value={transcriptionInput}
          onChange={(e) => setTranscriptionInput(e.target.value)}
          placeholder="Ascolta il file audio e digita qui il testo che hai compreso..."
          rows={4}
          className="w-full font-sans text-sm p-4 rounded-sm border border-border-subtle text-text-content placeholder:text-white/20 focus:border-white/50 focus:outline-none transition-colors duration-150 mb-4"
          style={{ background: '#000000' }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GhostButton onClick={verifyTranscription}>
              <Check size={14} /> VERIFICA TRASCRIZIONE
            </GhostButton>
            {evaluated && (
              <button
                onClick={() => {
                  setEvaluated(false)
                  setAccuracy(null)
                  setTranscriptionInput('')
                }}
                className="font-mono text-xs text-white/30 hover:text-white flex items-center gap-1 px-3 py-2"
              >
                <RotateCcw size={12} /> RESETTA
              </button>
            )}
          </div>
          <span className="font-mono text-white/20 text-xs tabular-nums">
            {transcriptionInput.trim().split(/\s+/).filter(Boolean).length} PAROLE DIGITATE
          </span>
        </div>

        {/* Evaluated word diff */}
        {evaluated && wordMatches.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <p className="font-mono text-white/25 text-xs tracking-wider mb-3">
              ANALISI VOCABOLARIO RICONOSCIUTO:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {wordMatches.map((item, i) => (
                <span
                  key={i}
                  className="font-mono text-xs px-2 py-0.5 rounded-sm border"
                  style={{
                    borderColor: item.matched ? '#3DDC84' : '#FF5C5C',
                    color: item.matched ? '#3DDC84' : '#FF5C5C',
                    background: 'transparent',
                  }}
                >
                  {item.word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
