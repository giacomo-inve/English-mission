import { useState, useEffect } from 'react'
import { Check, ChevronRight, ChevronLeft, X, Target, Radio, Compass, RefreshCw } from 'lucide-react'
import { setOnboardingSeen } from '../db/database'

interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
}

interface TourStep {
  badge: string
  title: string
  desc: string
  focusId?: string
  icon: any
}

const STEPS: TourStep[] = [
  {
    badge: 'STEP 01 / 04 · TELEMETRIA DI BORDO',
    title: 'MONITORAGGIO PARAMETRI QUOTIDIANI',
    desc: 'Le tre tessere centrali tracciano i tuoi parametri critici: la serie Streak di giorni consecutivi (protetta da scudi freeze), i punti XP accumulati verso il target giornaliero e il conteggio reale degli elementi in scadenza nei box di memoria a lungo termine.',
    focusId: 'tour-stat-tiles',
    icon: Target,
  },
  {
    badge: 'STEP 02 / 04 · ACCENSIONE MOTORI',
    title: 'SESSIONE RAPIDA DI APPRENDIMENTO',
    desc: 'Il comando principale "INIZIA" avvia la sessione core loop: quesiti compatti a risposta rapida con barra di avanzamento sottile da 2px, feedback visivo immediato e pronuncia nativa britannica via Web Speech API. Un percorso senza distrazioni.',
    focusId: 'tour-hero-cta',
    icon: Radio,
  },
  {
    badge: 'STEP 03 / 04 · MEMORIA A LUNGO TERMINE',
    title: 'MOTORE SPACED REPETITION (SRS)',
    desc: 'Basato sulla curva dell\'oblio e sulle scatole di Leitner, il sistema calcola matematicamente il momento esatto in cui stai per dimenticare un vocabolo o un verbo irregolare, riproponendolo con intervalli progressivi da 1 minuto fino a 30 giorni.',
    focusId: 'tour-srs-tile',
    icon: RefreshCw,
  },
  {
    badge: 'STEP 04 / 04 · ROTTA OPERATIVA',
    title: 'NAVIGAZIONE E FLIGHT MANUAL',
    desc: 'Esplora la Mappa del Percorso A1–B2, allenati nei moduli dedicati di Ascolto, Parlato e Scrittura, o consulta il Flight Manual operativo in qualsiasi momento per comprendere l\'algoritmo e i principi cognitivi del metodo.',
    focusId: 'tour-nav',
    icon: Compass,
  },
]

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      else if (e.key === 'ArrowLeft' && currentStep > 0) setCurrentStep((s) => s - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const Icon = step.icon

  const handleNext = async () => {
    if (isLast) {
      await setOnboardingSeen(true)
      onClose()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleSkip = async () => {
    await setOnboardingSeen(true)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 select-none"
      style={{
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* ── MISSION BRIEFING BOX (1PX SOLID WHITE BORDER) ── */}
      <div
        className="w-full max-w-xl p-8 sm:p-10 rounded-sm border border-white flex flex-col justify-between relative shadow-none"
        style={{ background: '#0a0a0a' }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Icon size={16} className="text-white" strokeWidth={1.5} />
            <span
              className="font-mono text-white/50 text-xs tracking-widest uppercase"
              style={{ letterSpacing: '0.2em' }}
            >
              MISSION BRIEFING · {step.badge}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-white/30 hover:text-white transition-colors"
            aria-label="Chiudi briefing"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3
            className="heading-display text-2xl sm:text-3xl text-white font-bold mb-4 leading-tight"
            style={{ letterSpacing: '0.1em' }}
          >
            {step.title}
          </h3>

          <p className="text-text-content/75 font-sans text-sm sm:text-base leading-relaxed">
            {step.desc}
          </p>
        </div>

        {/* Step dots indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === currentStep ? '32px' : '12px',
                background: i === currentStep ? '#ffffff' : '#3a3a3f',
              }}
            />
          ))}
        </div>

        {/* Controls Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <button
            onClick={handleSkip}
            className="font-mono text-xs px-4 py-2 rounded-pill border border-border-subtle text-white/40 hover:text-white hover:border-white transition-all"
            style={{ letterSpacing: '0.12em' }}
          >
            [ SALTA ]
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="font-mono text-xs px-4 py-2 rounded-pill border border-border-subtle text-white/40 hover:text-white hover:border-white transition-all flex items-center gap-1"
                style={{ letterSpacing: '0.12em' }}
              >
                <ChevronLeft size={13} /> INDIETRO
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-ghost text-xs py-2 px-6"
              style={{ letterSpacing: '0.16em' }}
            >
              {isLast ? (
                <>
                  <Check size={13} /> COMPLETA BRIEFING
                </>
              ) : (
                <>
                  AVANTI <ChevronRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
