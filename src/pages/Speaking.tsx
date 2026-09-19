import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, RotateCcw, ChevronLeft, ChevronRight, Zap, Check, AlertCircle } from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'

interface SpeakingPhrase {
  id: string
  text: string
  translation: string
  level: string
  ipa?: string
}

const PHRASES: SpeakingPhrase[] = [
  {
    id: 'spk-1',
    text: 'Could you please tell me where the nearest train station is?',
    translation: 'Potresti dirmi per favore dov\'è la stazione dei treni più vicina?',
    level: 'A1–A2',
    ipa: '/kʊd juː pliːz tel miː weər ðə ˈnɪə.rɪst treɪn ˈsteɪ.ʃən ɪz/',
  },
  {
    id: 'spk-2',
    text: 'I would like to improve my English speaking skills every single day.',
    translation: 'Vorrei migliorare le mie abilità di conversazione in inglese ogni singolo giorno.',
    level: 'A2',
    ipa: '/aɪ wʊd laɪk tuː ɪmˈpruːv maɪ ˈɪŋ.ɡlɪʃ ˈspiː.kɪŋ skɪlz ˈev.ri ˈsɪŋ.ɡəl deɪ/',
  },
  {
    id: 'spk-3',
    text: 'The weather is exceptionally pleasant this morning in the city.',
    translation: 'Il tempo è eccezionalmente piacevole questa mattina in città.',
    level: 'A2–B1',
    ipa: '/ðə ˈweð.ər ɪz ɪkˈsep.ʃən.əl.i ˈplez.ənt ðɪs ˈmɔːr.nɪŋ ɪn ðə ˈsɪt.i/',
  },
  {
    id: 'spk-4',
    text: 'We need to schedule an important team meeting before Friday afternoon.',
    translation: 'Dobbiamo programmare un\'importante riunione di team prima di venerdì pomeriggio.',
    level: 'B1',
    ipa: '/wiː niːd tuː ˈskedʒ.uːl ən ɪmˈpɔːr.tənt tiːm ˈmiː.tɪŋ bɪˈfɔːr ˈfraɪ.deɪ ˌɑːf.təˈnuːn/',
  },
  {
    id: 'spk-5',
    text: 'I have lived here for three years and I really enjoy the atmosphere.',
    translation: 'Vivo qui da tre anni e apprezzo davvero l\'atmosfera.',
    level: 'B1',
    ipa: '/aɪ hæv lɪvd hɪər fɔːr θriː jɪəz ænd aɪ ˈrɪə.li ɪnˈdʒɔɪ ðiː ˈæt.məs.fɪər/',
  },
]

// Fallback SpeechRecognition type for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export default function Speaking() {
  const { addXP } = useProgress()
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

  const phrase = PHRASES[currentIdx]
  const recognitionRef = useRef<any>(null)

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
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(phrase.text)
    utt.lang = 'en-GB'
    utt.rate = 0.85
    window.speechSynthesis.speak(utt)
  }

  // Switch phrase
  const switchPhrase = (idx: number) => {
    if (isRecording) stopRecording()
    setCurrentIdx(idx)
    setSpokenText('')
    setEvaluated(false)
    setAccuracy(null)
    setWordResults([])
    setXpAwarded(false)
    setManualInput('')
  }

  // Compare words
  const evaluateSpeech = useCallback((textToEvaluate: string) => {
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

    if (acc >= 70 && !xpAwarded) {
      const gain = acc >= 90 ? 20 : 15
      addXP(gain)
      setXpAwarded(true)
    }
  }, [phrase.text, xpAwarded, addXP])

  // Start recording
  const startRecording = () => {
    const win = window as unknown as IWindow
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setUseManualFallback(true)
      return
    }

    try {
      window.speechSynthesis?.cancel()
      const recognition = new SpeechRec()
      recognition.lang = 'en-US'
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-8">
        <div>
          <p className="font-mono text-white/30 text-xs tracking-widest mb-1" style={{ letterSpacing: '0.22em' }}>
            MODULO OPERATIVO · PARLATO & PRONUNCIA
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-white">PARLATO</h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchPhrase((currentIdx - 1 + PHRASES.length) % PHRASES.length)}
            className="p-2 rounded-pill border border-border-subtle text-white/50 hover:text-white hover:border-white transition-colors"
            aria-label="Frase precedente"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-xs text-white/40 px-3 tracking-widest tabular-nums">
            FRASE {currentIdx + 1} / {PHRASES.length}
          </span>
          <button
            onClick={() => switchPhrase((currentIdx + 1) % PHRASES.length)}
            className="p-2 rounded-pill border border-border-subtle text-white/50 hover:text-white hover:border-white transition-colors"
            aria-label="Frase successiva"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── CENTRAL PHRASE DISPLAY ── */}
      <div
        className="p-8 sm:p-12 rounded-sm border border-border-subtle mb-10 text-center flex flex-col items-center"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="font-mono text-xs text-white/30 border border-border-subtle px-2.5 py-0.5 rounded-sm tracking-widest">
            {phrase.level}
          </span>
          <button
            onClick={playSampleAudio}
            className="font-mono text-xs text-white/40 hover:text-white flex items-center gap-1.5 px-3 py-0.5 border border-border-subtle rounded-pill hover:border-white transition-colors"
          >
            <Volume2 size={13} /> ASCOLTA MODELLO
          </button>
        </div>

        {/* 32px natural-case English phrase */}
        <h2
          className="font-sans font-medium text-white mb-4 leading-relaxed max-w-2xl"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
        >
          {phrase.text}
        </h2>

        {phrase.ipa && (
          <p className="font-mono text-white/30 text-xs tracking-wider mb-2">
            {phrase.ipa}
          </p>
        )}

        <p className="text-text-content/40 text-sm font-sans italic max-w-xl">
          "{phrase.translation}"
        </p>

        {/* ── 72px CIRCULAR RECORDING BUTTON ── */}
        <div className="relative flex items-center justify-center my-10">
          {/* Pulsing thin white ring strictly active during recording */}
          {isRecording && (
            <div className="absolute inset-0 -m-3 rounded-full border border-white pulse-white-ring pointer-events-none" />
          )}

          <button
            onClick={toggleRecording}
            className={[
              'w-[72px] h-[72px] rounded-full border border-white flex items-center justify-center text-white transition-all duration-200 active:scale-95 cursor-pointer relative z-10',
              isRecording
                ? 'bg-white text-black ring-1 ring-white'
                : 'bg-transparent hover:bg-white hover:text-black',
            ].join(' ')}
            aria-label={isRecording ? 'Interrompi registrazione' : 'Inizia registrazione vocale'}
          >
            {isRecording ? (
              <MicOff size={28} strokeWidth={1.75} />
            ) : (
              <Mic size={28} strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Recording status instruction */}
        <p className="font-mono text-white/30 text-xs tracking-widest">
          {isRecording
            ? 'ASCOLTO IN CORSO... PARLA CHIARAMENTE'
            : 'CLICCA SUL MICROFONO E PRONUNCIA LA FRASE'}
        </p>

        {/* Speech recognition fallback toggle */}
        {!hasSupport && (
          <div className="mt-6 flex items-center gap-2 font-mono text-xs text-white/30 border border-border-subtle p-3 rounded-sm">
            <AlertCircle size={14} className="shrink-0" />
            <span>Riconoscimento vocale non supportato dal browser. Utilizza il test testuale qui sotto.</span>
          </div>
        )}
      </div>

      {/* ── FEEDBACK & WORD-BY-WORD COMPARISON ── */}
      {evaluated && wordResults.length > 0 && (
        <div
          className="p-6 sm:p-8 rounded-sm border border-border-subtle mb-10"
          style={{ background: '#0a0a0a' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-border-subtle pb-4">
            <div>
              <p className="font-mono text-white/30 text-xs tracking-widest">
                VERIFICA PRONUNCIA PAROLA PER PAROLA
              </p>
              {spokenText && (
                <p className="text-text-content/50 text-xs italic mt-1">
                  Trascrizione rilevata: "{spokenText}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/30">ACCURATEZZA:</span>
              <span
                className="font-mono text-lg font-bold tabular-nums"
                style={{ color: (accuracy ?? 0) >= 70 ? '#3DDC84' : '#FF5C5C' }}
              >
                <AnimatedCounter value={accuracy ?? 0} />%
              </span>
              {xpAwarded && (
                <span className="font-mono text-xs flex items-center gap-1 text-signal-ok">
                  <Zap size={13} /> +15 XP
                </span>
              )}
            </div>
          </div>

          {/* Word Pills with functional colors */}
          <div className="flex flex-wrap gap-2 mb-6">
            {wordResults.map((item, i) => (
              <span
                key={i}
                className="font-sans text-sm px-3 py-1.5 rounded-sm border"
                style={{
                  borderColor: item.correct ? '#3DDC84' : '#FF5C5C',
                  color: item.correct ? '#3DDC84' : '#FF5C5C',
                  background: 'transparent',
                }}
              >
                {item.word}
              </span>
            ))}
          </div>

          <div className="flex justify-end">
            <GhostButton
              onClick={() => switchPhrase((currentIdx + 1) % PHRASES.length)}
            >
              PROSSIMA FRASE <ChevronRight size={14} />
            </GhostButton>
          </div>
        </div>
      )}

      {/* ── MANUAL FALLBACK / TEST INPUT ── */}
      {useManualFallback && (
        <div
          className="p-6 rounded-sm border border-border-subtle"
          style={{ background: '#0a0a0a' }}
        >
          <p className="font-mono text-white/30 text-xs tracking-widest mb-2">
            MODALITÀ TEST MANUALE
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Inserisci la frase pronunciata per testare l'algoritmo..."
              className="flex-1 font-sans text-sm p-3 rounded-sm border border-border-subtle bg-black text-text-content focus:border-white/50 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <GhostButton onClick={handleManualSubmit}>
              <Check size={14} /> VERIFICA
            </GhostButton>
          </div>
        </div>
      )}
    </div>
  )
}
