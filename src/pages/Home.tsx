import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Flame, Zap, RefreshCw, BookOpen, Layers, AlignLeft, Shield, BookMarked, HelpCircle } from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { useSRS } from '../hooks/useSRS'
import { initDB } from '../db/database'
import StatTile from '../components/StatTile'
import GhostButton from '../components/GhostButton'
import AnimatedCounter from '../components/AnimatedCounter'
import OnboardingTour from '../components/OnboardingTour'

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
          <span className="font-mono text-white/20" style={{ fontSize: '9px' }}>
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// Quick access items
// ─────────────────────────────────────────

const QUICK_ACCESS = [
  {
    icon: <BookOpen size={16} strokeWidth={1.5} />,
    label: 'Vocaboli A1',
    to: '/vocaboli',
    desc: 'Catalogo terminologico per categorie',
  },
  {
    icon: <Layers size={16} strokeWidth={1.5} />,
    label: 'Verbi irregolari',
    to: '/verbi',
    desc: '38 verbi catalogati per pattern fonetico',
  },
  {
    icon: <AlignLeft size={16} strokeWidth={1.5} />,
    label: 'Grammatica',
    to: '/grammatica',
    desc: 'Regole sintattiche ed esercizi applicati',
  },
  {
    icon: <BookMarked size={16} strokeWidth={1.5} />,
    label: 'Flight Manual',
    to: '/manuale',
    desc: 'Manuale operativo e protocollo 10 min/giorno',
  },
]

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { progress, loading, reload } = useProgress()
  const { dueCount, refreshDueCount } = useSRS()
  const [tourOpen, setTourOpen] = useState(false)
  const hasAutoTriggeredRef = useRef(false)
  const dismissedRef = useRef(false)

  useEffect(() => {
    initDB().then(() => {
      refreshDueCount()
      reload()
    })
  }, [refreshDueCount, reload])

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

  const streak    = progress?.streak   ?? 0
  const todayXP   = progress?.todayXP  ?? 0
  const dailyGoal = progress?.dailyGoal ?? 20
  const freeze    = progress?.streakFreeze ?? 0
  const ticks     = progress?.sevenDayTicks ?? Array(7).fill(false)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">

      {/* ── HERO ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p
          className="font-mono text-white/25 text-xs mb-6"
          style={{ letterSpacing: '0.25em' }}
        >
          ENGLISH MISSION CONTROL · SESSIONE DI OGGI
        </p>

        <h1
          className="heading-display mb-4 leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '0.12em' }}
        >
          INIZIA ORA
        </h1>

        <p className="text-text-content/45 text-sm max-w-sm mb-10">
          Un obiettivo chiaro. Nessuna distrazione. Impara ogni giorno.
        </p>

        <div id="tour-hero-cta" className="flex flex-wrap items-center justify-center gap-3">
          <GhostButton size="lg" onClick={() => navigate('/lezione')}>
            INIZIA
          </GhostButton>
          {dueCount > 0 && (
            <GhostButton size="lg" onClick={() => navigate('/ripasso')}>
              RIPASSA ({dueCount})
            </GhostButton>
          )}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <hr className="hr-subtle mx-6" />

      {/* ── STAT TILES ── */}
      <section id="tour-stat-tiles" className="px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* STREAK */}
          <StatTile
            label="STREAK"
            value={
              <span className="flex items-center gap-2">
                <Flame size={24} strokeWidth={1.5} className="text-signal-ok" />
                {loading ? '—' : <AnimatedCounter value={streak} />}
              </span>
            }
            sub={
              <div>
                <StreakTicks ticks={ticks} />
                {freeze > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Shield size={11} strokeWidth={1.5} className="text-white/30" />
                    <span className="font-mono text-white/25 text-xs">
                      {freeze} scudo{freeze !== 1 ? 'i' : ''} disponibile{freeze !== 1 ? '' : ''}
                    </span>
                  </div>
                )}
              </div>
            }
          />

          {/* XP OGGI */}
          <StatTile
            label="XP OGGI"
            value={
              <span className="flex items-center gap-2">
                <Zap size={22} strokeWidth={1.5} className="text-white/50" />
                {loading ? '—' : <AnimatedCounter value={todayXP} />}
              </span>
            }
            sub={
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-white/20 text-xs">
                    obiettivo: {dailyGoal} XP
                  </span>
                  <span className="font-mono text-white/20 text-xs tabular-nums">
                    {Math.min(100, Math.round((todayXP / dailyGoal) * 100))}%
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="w-full h-px bg-border-subtle overflow-hidden rounded-full">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (todayXP / dailyGoal) * 100)}%`,
                      background: todayXP >= dailyGoal ? '#3DDC84' : '#ffffff40',
                    }}
                  />
                </div>
              </div>
            }
          />

          {/* RIPASSI IN SCADENZA — cliccabile */}
          <button
            id="tour-srs-tile"
            className="data-tile text-left group transition-colors duration-200"
            style={{ cursor: dueCount > 0 ? 'pointer' : 'default' }}
            onClick={() => dueCount > 0 && navigate('/ripasso')}
          >
            <p
              className="text-white/40 font-mono text-xs tracking-widest group-hover:text-white/60 transition-colors"
              style={{ letterSpacing: '0.18em' }}
            >
              RIPASSI IN SCADENZA
            </p>
            <div className="text-white font-mono text-3xl tabular-nums leading-tight mt-1">
              <span className="flex items-center gap-2">
                <RefreshCw
                  size={22}
                  strokeWidth={1.5}
                  className={dueCount > 0 ? 'text-signal-ok' : 'text-white/40'}
                />
                <AnimatedCounter value={dueCount} />
              </span>
            </div>
            <p className="text-white/25 font-mono text-xs mt-1">
              {dueCount === 0
                ? 'tutto aggiornato'
                : `clicca per iniziare il ripasso`}
            </p>
          </button>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <hr className="hr-subtle mx-6" />

      {/* ── QUICK ACCESS & MANUAL ── */}
      <section className="px-6 py-10 pb-16">
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
          <p
            className="font-mono text-white/25 text-xs tracking-widest uppercase"
            style={{ letterSpacing: '0.18em' }}
          >
            ACCESSO RAPIDO · MODULI E MANUALE
          </p>
          <button
            onClick={() => {
              dismissedRef.current = false
              setTourOpen(true)
            }}
            className="font-mono text-xs text-white/30 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle size={13} /> MISSION BRIEFING
          </button>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACCESS.map(({ icon, label, to, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="data-tile text-left group hover:border-white/25 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white/40 group-hover:text-white/80 transition-colors">
                {icon}
                <span className="font-mono text-xs tracking-wider uppercase">{label}</span>
              </div>
              <p className="text-text-content/35 text-xs mt-2">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── ONBOARDING TOUR MODAL ── */}
      <OnboardingTour
        isOpen={tourOpen}
        onClose={handleCloseTour}
      />
    </div>
  )
}
