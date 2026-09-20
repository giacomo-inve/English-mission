import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Volume2,
  Radio,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'
import SectionGuideModal from '../components/SectionGuideModal'
import { LISTENING_CLIPS, type AudioClip } from '../db/seed'
import { playSuccessChime, playErrorHum } from '../utils/sfx'

const LEVEL_LIST = ['A1', 'A2', 'B1', 'B2'] as const
type LevelType = (typeof LEVEL_LIST)[number]

export default function Listening() {
  const { progress, addXP, updateSectionLevel, markCompleted } = useProgress()
  const [selectedLevel, setSelectedLevel] = useState<LevelType>('A1')
  const [currentClipIdx, setCurrentClipIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1.0>(1.0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcriptionInput, setTranscriptionInput] = useState('')
  const [evaluated, setEvaluated] = useState(false)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [wordMatches, setWordMatches] = useState<{ word: string; matched: boolean }[]>([])
  const [xpEarned, setXpEarned] = useState(0)

  // Sync initial level from Dexie
  useEffect(() => {
    if (progress?.listening_level && LEVEL_LIST.includes(progress.listening_level as LevelType)) {
      setSelectedLevel(progress.listening_level as LevelType)
    }
  }, [progress?.listening_level])

  // Filter clips by level
  const activeClips = useMemo(() => {
    const list = LISTENING_CLIPS.filter((c) => c.level === selectedLevel)
    return list.length > 0 ? list : LISTENING_CLIPS
  }, [selectedLevel])

  const clip = activeClips[currentClipIdx] || activeClips[0]
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Completed IDs set
  const completedSet = useMemo(() => {
    return new Set(progress?.completed_exercise_ids ?? [])
  }, [progress?.completed_exercise_ids])

  const isCurrentCompleted = completedSet.has(clip?.id)

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
    setXpEarned(0)
  }

  // Switch level
  const handleSelectLevel = async (lvl: LevelType) => {
    stopAudio()
    setSelectedLevel(lvl)
    await updateSectionLevel('listening_level', lvl)
    selectClip(0)
  }

  // Sequential next uncompleted
  const handleNextSequential = () => {
    if (activeClips.length <= 1) return
    for (let i = 1; i < activeClips.length; i++) {
      const targetIdx = (currentClipIdx + i) % activeClips.length
      if (!completedSet.has(activeClips[targetIdx].id)) {
        selectClip(targetIdx)
        return
      }
    }
    selectClip((currentClipIdx + 1) % activeClips.length)
  }

  const togglePlay = () => {
    if (!('speechSynthesis' in window) || !clip) {
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
    if (!transcriptionInput.trim() || !clip) return

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

    if (calculatedAcc >= 60) {
      playSuccessChime()
      markCompleted(clip.id, 'listening')
      if (xpEarned === 0) {
        const earned = calculatedAcc >= 90 ? 25 : 15
        setXpEarned(earned)
        addXP(earned)
      }
    } else {
      playErrorHum()
    }
  }

  // Waveform bars heights pattern (32 bars)
  const waveformHeights = [
    8, 14, 22, 12, 28, 36, 18, 10, 24, 32, 16, 26, 38, 20, 14, 30,
    36, 18, 28, 12, 34, 22, 16, 26, 38, 14, 20, 30, 18, 12, 24, 10,
  ]

  const allCompletedInLevel = useMemo(() => {
    return activeClips.length > 0 && activeClips.every((c) => completedSet.has(c.id))
  }, [activeClips, completedSet])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8 flex items-start justify-between">
        <div>
          <p
            className="font-mono text-text-content/40 text-xs tracking-widest mb-1"
            style={{ letterSpacing: '0.22em' }}
          >
            INTERCETTAZIONE SEGNALI · MODULO RADIO
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
            <Radio size={30} strokeWidth={1.5} className="text-signal-ok" /> COMUNICAZIONI
          </h1>
        </div>

        {/* Contextual Guide (i) */}
        <SectionGuideModal
          sectionTitle="COMUNICAZIONI · GUIDA OPERATIVA"
          sectionSubtitle="DECODIFICA SEGNALI E TRASCRIZIONE AUDIO"
          objective="Sviluppare la comprensione all'ascolto (Listening Comprehension) di trasmissioni in lingua inglese reale, da annunci a briefing complessi."
          methodology={[
            'Ascolta la trasmissione a velocità nominale (1.0X) per cogliere il significato complessivo.',
            'Usa la velocità ridotta (0.75X) per isolare termini specifici o phrasal verbs complessi.',
            'Digita nel campo di decodifica tutto ciò che riesci a comprendere.',
            'Convalida la trascrizione: le parole riconosciute verranno evidenziate in verde.',
          ]}
          controls={[
            { name: 'PLAY / PAUSA', desc: 'Avvia o ferma il flusso audio sintetico della trasmissione.' },
            { name: 'VELOCITÀ (0.75X / 1.0X)', desc: 'Regola la velocità di scansione fonetica.' },
            { name: 'MOSTRA TRASCRIZIONE', desc: 'Svela il testo integrale per consultazione immediata.' },
            { name: 'VERIFICA DECODIFICA', desc: 'Calcola la percentuale di accuratezza e assegna XP.' },
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
              <CheckCircle2 size={13} /> DECODIFICATO
            </span>
          )}
        </div>
      </div>

      {allCompletedInLevel && (
        <div className="mb-6 p-4 rounded bg-signal-ok/10 border border-signal-ok/30 flex items-center gap-3 text-signal-ok text-xs font-mono">
          <Sparkles size={16} /> TUTTI GLI ESERCIZI DI ASCOLTO DEL LIVELLO {selectedLevel} COMPLETATI!
        </div>
      )}

      {/* ── CLIP STRIP ── */}
      <div className="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {activeClips.map((c, idx) => {
            const isCompleted = completedSet.has(c.id)
            return (
              <button
                key={c.id}
                onClick={() => selectClip(idx)}
                className={[
                  'font-mono text-xs px-3 py-1.5 rounded border transition-all shrink-0 flex items-center gap-1.5',
                  currentClipIdx === idx
                    ? 'border-signal-ok text-signal-ok bg-signal-ok/10 font-bold'
                    : 'border-border-subtle text-text-content/50 hover:border-text-display/50',
                ].join(' ')}
              >
                {isCompleted && <Check size={11} className="text-signal-ok" />}
                CANALE 0{idx + 1}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleNextSequential}
          className="font-mono text-xs px-3 py-1.5 rounded border border-border-subtle hover:border-text-display text-text-content/70 hover:text-text-display shrink-0 ml-2"
        >
          PROSSIMO NON COMPLETATO &rarr;
        </button>
      </div>

      {/* ── PLAYER & WAVEFORM CARD ── */}
      <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-6">
          <div>
            <span className="font-mono text-[10px] text-text-content/40 tracking-widest uppercase">
              FREQUENZA LIVELLO {clip?.level} · CANALE {currentClipIdx + 1}/{activeClips.length}
            </span>
            <h2 className="heading-display text-2xl text-text-display mt-1">
              {clip?.title}
            </h2>
            <p className="font-mono text-xs text-text-content/60 mt-0.5">
              {clip?.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-content/40">VELOCITÀ:</span>
            {[1.0, 0.75].map((spd) => (
              <button
                key={spd}
                onClick={() => changeSpeed(spd as 0.75 | 1.0)}
                className={[
                  'font-mono text-xs px-2.5 py-1 rounded border transition-all',
                  playbackSpeed === spd
                    ? 'border-text-display text-text-display bg-bg-primary font-bold'
                    : 'border-border-subtle text-text-content/40 hover:text-text-display',
                ].join(' ')}
              >
                {spd}X
              </button>
            ))}
          </div>
        </div>

        {/* Waveform visualization */}
        <div className="h-16 flex items-center justify-center gap-1.5 bg-bg-primary/70 rounded border border-border-subtle/50 px-4 mb-6">
          {waveformHeights.map((h, i) => (
            <div
              key={i}
              className={[
                'w-1.5 rounded-full transition-all duration-150',
                isPlaying ? 'bg-signal-ok wave-bar-active' : 'bg-border-subtle',
              ].join(' ')}
              style={{
                height: isPlaying ? `${Math.max(8, (h * (i % 3 + 1)) % 48)}px` : `${h / 2}px`,
                animationDelay: `${(i * 0.04) % 1}s`,
              }}
            />
          ))}
        </div>

        {/* Audio controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={togglePlay}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-pill bg-text-display text-bg-primary hover:opacity-90 font-mono text-xs font-semibold tracking-wider transition-opacity shadow"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'INTERROMPI SEGNALE' : 'AVVIA ASCOLTO'}
          </button>

          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-text-content/60 hover:text-text-display transition-colors"
          >
            {showTranscript ? <EyeOff size={14} /> : <Eye size={14} />}
            {showTranscript ? 'NASCONDI TRASCRIZIONE' : 'MOSTRA TRASCRIZIONE'}
          </button>
        </div>

        {/* Transcript reveal */}
        {showTranscript && (
          <div className="mt-6 pt-6 border-t border-border-subtle bg-bg-primary/40 p-4 rounded text-sm text-text-content/90 font-sans leading-relaxed">
            <p className="font-mono text-xs text-text-content/40 mb-2 uppercase">
              TRASCRIZIONE ORIGINALE CANALE:
            </p>
            {clip?.text}
          </div>
        )}

        {/* Hint */}
        {clip?.hint && (
          <p className="font-mono text-xs text-text-content/50 mt-4 italic">
            GUIDA BRIEFING: {clip.hint}
          </p>
        )}
      </div>

      {/* ── TRANSCRIPTION INPUT & VERIFICATION ── */}
      <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 mb-8 shadow-md">
        <p className="font-mono text-xs text-text-content/50 tracking-wider uppercase mb-2">
          LOG DI DECODIFICA PILOTA (DIGITA QUEL CHE ASCOLTI):
        </p>
        <textarea
          rows={4}
          value={transcriptionInput}
          onChange={(e) => setTranscriptionInput(e.target.value)}
          placeholder="Digita qui la trascrizione del segnale radio..."
          className="w-full bg-bg-primary border border-border-subtle rounded p-4 font-mono text-sm text-text-display outline-none focus:border-signal-ok transition-colors"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-text-content/40">
            {transcriptionInput.trim().split(/\s+/).filter(Boolean).length} PAROLE DIGITATE
          </span>

          <button
            onClick={verifyTranscription}
            disabled={!transcriptionInput.trim()}
            className="px-6 py-2 rounded-pill bg-signal-ok text-black hover:bg-signal-ok/90 font-mono text-xs font-semibold tracking-wider transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            VERIFICA DECODIFICA
          </button>
        </div>
      </div>

      {/* ── EVALUATION REPORT ── */}
      {evaluated && accuracy !== null && (
        <div className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <div>
              <p className="font-mono text-xs text-text-content/40 uppercase">
                ACCURATEZZA DI RICEZIONE
              </p>
              <h3 className="heading-display text-xl text-text-display">
                CORRISPONDENZA SEGNALE: {accuracy}%
              </h3>
            </div>
            {accuracy >= 60 ? (
              <span className="font-mono text-xs px-3 py-1.5 rounded bg-signal-ok/20 text-signal-ok border border-signal-ok font-bold">
                SEGNALE DECODIFICATO (+{xpEarned || 15} XP)
              </span>
            ) : (
              <span className="font-mono text-xs px-3 py-1.5 rounded bg-signal-err/20 text-signal-err border border-signal-err font-bold">
                SEGNALE DEBOLE (MIN 60%)
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {wordMatches.map((m, i) => (
              <span
                key={i}
                className={[
                  'font-mono text-xs px-2 py-0.5 rounded border',
                  m.matched
                    ? 'border-signal-ok text-signal-ok bg-signal-ok/10'
                    : 'border-border-subtle text-text-content/30',
                ].join(' ')}
              >
                {m.word}
              </span>
            ))}
          </div>

          {accuracy >= 60 && (
            <div className="flex justify-end">
              <GhostButton size="md" onClick={handleNextSequential}>
                PROSSIMO SEGNALE &rarr;
              </GhostButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
