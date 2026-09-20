import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Flame,
  Zap,
  RefreshCw,
  Package,
  Radio,
  Mic,
  BookOpen,
  Rocket,
  Compass,
  Shield,
  UserCheck,
} from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { useSRS } from '../hooks/useSRS'
import { initDB } from '../db/database'
import StatTile from '../components/StatTile'
import GhostButton from '../components/GhostButton'
import AnimatedCounter from '../components/AnimatedCounter'
import OnboardingTour from '../components/OnboardingTour'
import PilotModal from '../components/PilotModal'

// ─────────────────────────────────────────
// Streak ticks — 7 days, data-driven
// ─────────────────────────────────────────

function StreakTicks({ ticks }: { ticks: boolean[] }) {
  const dayLabels = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
  const today = new Date().getDay()
  const labels = Array.from({ length: 7 }, (_, i) => {
    const dayIdx = ((today - 6 + i) + 7) % 7
    return dayLabels[dayIdx === 0 ? 6 : dayIdx - 1]
  })

  return (
    <div className="flex items-end gap-1.5 mt-2">
      {ticks.map((filled, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-full transition-all duration-500"
            style={{
              height: filled ? '6px' : '4px',
              background: filled ? '#3DDC84' : '#3a3a3f',
            }}
          />
          <span className="font-mono text-text-content/30" style={{ fontSize: '9px' }}>
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// Quick access items (Flight Metaphors)
// ─────────────────────────────────────────

const QUICK_ACCESS = [
  {
    icon: <Radio size={18} strokeWidth={1.5} />,
    label: 'COMUNICAZIONI',
    to: '/ascolto',
    desc: 'Segnali audio e trascrizione fonetica',
  },
  {
    icon: <Mic size={18} strokeWidth={1.5} />,
    label: 'VOCAL LINK',
    to: '/parlato',
    desc: 'Verifica pronuncia e dialoghi con Web Audio',
  },
  {
    icon: <BookOpen size={18} strokeWidth={1.5} />,
    label: 'LOGBOOK',
    to: '/scrittura',
    desc: 'Diario di bordo e composizione guidata',
  },
  {
    icon: <Package size={18} strokeWidth={1.5} />,
    label: 'CARICO',
    to: '/vocaboli',
    desc: 'Payload lessicale per categorie A1-B2',
  },
  {
    icon: <Flame size={18} strokeWidth={1.5} />,
    label: 'PROPULSIONE',
    to: '/verbi',
    desc: 'Tabelle forme verbali e pattern fonetici',
  },
  {
    icon: <Rocket size={18} strokeWidth={1.5} />,
    label: 'MISSIONI',
    to: '/percorso',
    desc: 'Albero delle tappe formative A1-B2 sbloccato',
  },
]

// ─────────────────────────────────────────
// Page ROTTA
// ─────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { progress, loading, reload, updatePilotName } = useProgress()
  const { dueCount, refreshDueCount } = useSRS()
  const [tourOpen, setTourOpen] = useState(false)
  const [pilotModalOpen, setPilotModalOpen] = useState(false)
  const hasAutoTriggeredRef = useRef(false)
  const dismissedRef = useRef(false)

  useEffect(() => {
    initDB().then(() => {
      refreshDueCount()
      reload()
    })
  }, [refreshDueCount, reload])

  // Check if pilot name needs to be confirmed on first visit
  useEffect(() => {
    if (!loading && progress) {
      const hasConfigured = localStorage.getItem('emc-pilot-configured')
      if (!hasConfigured) {
        setPilotModalOpen(true)
      }
    }
  }, [loading, progress])

  // Trigger tour on first visit or query parameter ?briefing=true
  useEffect(() => {
    if (loading || !progress || dismissedRef.current) return

    if (location.search.includes('briefing=true')) {
      setTourOpen(true)
    } else if (!hasAutoTriggeredRef.current && progress.has_seen_onboarding !== true) {
      hasAutoTriggeredRef.current = true
      setTourOpen(true)
    }
  }, [loading, progress, location.search])

  const handleCloseTour = () => {
    dismissedRef.current = true
    setTourOpen(false)
    if (location.search.includes('briefing=true')) {
      navigate('/', { replace: true })
    }
    reload()
  }

  const handleSavePilot = async (name: string) => {
    localStorage.setItem('emc-pilot-configured', 'true')
    await updatePilotName(name)
    setPilotModalOpen(false)
  }

  const streak    = progress?.streak   ?? 0
  const todayXP   = progress?.todayXP  ?? 0
  const dailyGoal = progress?.dailyGoal ?? 20
  const freeze    = progress?.streakFreeze ?? 0
  const ticks     = progress?.sevenDayTicks ?? Array(7).fill(false)
  const pilotName = progress?.pilotName || 'Commander Giacomo'

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary">
      {/* Pilot initial setup modal */}
      <PilotModal
        isOpen={pilotModalOpen}
        currentName={pilotName}
        onSave={handleSavePilot}
        isInitialSetup={true}
      />

      {/* ── HERO ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Pilot Call Sign Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-bg-section border border-border-subtle mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-signal-ok animate-pulse" />
          <span className="font-mono text-xs text-text-display font-semibold tracking-wider">
            PILOTA IN COMANDO: {pilotName.toUpperCase()}
          </span>
        </div>

        <p
          className="font-mono text-text-content/40 text-xs mb-4 tracking-widest uppercase"
          style={{ letterSpacing: '0.25em' }}
        >
          ROTTA DI VOLO · SESSIONE DI OGGI
        </p>

        <h1
          className="heading-display mb-4 leading-none text-text-display font-bold"
          style={{ fontSize: 'clamp(2.75rem, 8vw, 4.75rem)', letterSpacing: '0.12em' }}
        >
          INIZIA ORA
        </h1>

        <p className="text-text-content/60 text-sm max-w-sm mb-10">
          Un obiettivo chiaro. Nessuna distrazione. Impara e parla inglese ogni giorno.
        </p>

        <div id="tour-hero-cta" className="flex flex-wrap items-center justify-center gap-3">
          <GhostButton size="lg" onClick={() => navigate('/lezione')}>
            AVVIA SESSIONE
          </GhostButton>
          {dueCount > 0 && (
            <GhostButton size="lg" onClick={() => navigate('/ripasso')}>
              ORBITA SRS ({dueCount})
            </GhostButton>
          )}
        </div>
      </section>

      {/* ── METRICS TILES ── */}
      <section
        id="tour-telemetry-strip"
        className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-subtle max-w-4xl mx-auto w-full px-6 mb-16"
      >
        {/* Tile 1 — Streak */}
        <StatTile
          label="SERIE ATTIVA"
          value={streak}
          subtext="GIORNI CONSECUTIVI"
          icon={<Flame size={14} className="text-signal-ok" />}
        >
          <StreakTicks ticks={ticks} />
        </StatTile>

        {/* Tile 2 — Today XP */}
        <StatTile
          label="TELEMETRIA OGGI"
          value={todayXP}
          subtext={`OBIETTIVO: ${dailyGoal} XP`}
          icon={<Zap size={14} className="text-signal-ok" />}
        >
          <div className="w-full bg-bg-primary h-1 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-signal-ok transition-all duration-500"
              style={{ width: `${Math.min(100, (todayXP / (dailyGoal || 20)) * 100)}%` }}
            />
          </div>
        </StatTile>

        {/* Tile 3 — SRS or Shield */}
        <StatTile
          label="ORBITA SRS"
          value={dueCount}
          subtext={dueCount === 0 ? 'CODA AGGIORNATA' : 'ELEMENTI IN SCADENZA'}
          icon={<RefreshCw size={14} className="text-signal-ok" />}
        >
          <div className="flex items-center gap-1.5 mt-2 font-mono text-xs text-text-content/40">
            <Shield size={12} className="text-signal-ok" />
            <span>SCUDO STREAK: {freeze} ATTIVO</span>
          </div>
        </StatTile>
      </section>

      {/* ── QUICK ACCESS MODULES (6 Flight Metaphors) ── */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-20">
        <p
          className="font-mono text-text-content/30 text-xs tracking-widest mb-6 uppercase"
          style={{ letterSpacing: '0.22em' }}
        >
          SISTEMI DI BORDO · ACCESSO RAPIDO
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_ACCESS.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="group text-left p-5 rounded bg-bg-section border border-border-subtle hover:border-text-display transition-all duration-150"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-text-display tracking-wider uppercase">
                  {item.label}
                </span>
                <span className="text-text-content/30 group-hover:text-signal-ok transition-colors">
                  {item.icon}
                </span>
              </div>
              <p className="text-text-content/50 text-xs font-sans group-hover:text-text-content/80 transition-colors">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Onboarding tour modal if needed */}
      <OnboardingTour
        isOpen={tourOpen}
        onClose={handleCloseTour}
      />
    </div>
  )
}
