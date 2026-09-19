import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Target, X, Headphones, Mic, PenTool, RefreshCw, Compass, Settings as SettingsIcon, BookMarked } from 'lucide-react'

const PRIMARY_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'PERCORSO', to: '/percorso' },
  { label: 'GRAMMATICA', to: '/grammatica' },
  { label: 'VOCABOLI', to: '/vocaboli' },
  { label: 'VERBI', to: '/verbi' },
  { label: 'RIPASSO', to: '/ripasso' },
  { label: 'MANUALE', to: '/manuale' },
]

const OVERLAY_ITEMS = [
  {
    label: 'ASCOLTO',
    to: '/ascolto',
    desc: 'Comprensione uditiva, waveform e dettato',
    icon: <Headphones size={20} strokeWidth={1.5} />,
  },
  {
    label: 'PARLATO',
    to: '/parlato',
    desc: 'Pronuncia vocale e riconoscimento in tempo reale',
    icon: <Mic size={20} strokeWidth={1.5} />,
  },
  {
    label: 'SCRITTURA',
    to: '/scrittura',
    desc: 'Composizione su traccia e validazione euristica',
    icon: <PenTool size={20} strokeWidth={1.5} />,
  },
  {
    label: 'RIPASSO',
    to: '/ripasso',
    desc: 'Flashcard 3D e Spaced Repetition Leitner',
    icon: <RefreshCw size={20} strokeWidth={1.5} />,
  },
  {
    label: 'PROGRESSI',
    to: '/progressi',
    desc: 'Tracciamento livelli, telemetria e distintivi di missione',
    icon: <Compass size={20} strokeWidth={1.5} />,
  },
  {
    label: 'MANUALE',
    to: '/manuale',
    desc: 'Flight Manual e protocollo metodologico 10 min/giorno',
    icon: <BookMarked size={20} strokeWidth={1.5} />,
  },
  {
    label: 'IMPOSTAZIONI',
    to: '/impostazioni',
    desc: 'Preferenze di sintesi vocale e obiettivi giornalieri',
    icon: <SettingsIcon size={20} strokeWidth={1.5} />,
  },
]

export default function Nav() {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Close overlay on route change or ESC
  useEffect(() => {
    setOverlayOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlayOpen(false)
    }
    if (overlayOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [overlayOpen])

  const handleSelect = (to: string) => {
    setOverlayOpen(false)
    navigate(to)
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 gap-6 justify-between"
        style={{
          borderBottom: '1px solid #3a3a3f',
          background: 'rgba(0,0,0,0.94)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo mark */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <Target size={16} className="text-white" strokeWidth={1.5} />
          <span
            className="text-white font-mono text-xs"
            style={{ letterSpacing: '0.22em' }}
          >
            EMC
          </span>
        </NavLink>

        {/* Primary Links */}
        <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto">
          {PRIMARY_LINKS.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'text-xs font-mono shrink-0 transition-colors duration-150',
                  isActive
                    ? 'text-white'
                    : 'text-white/35 hover:text-white/75',
                ].join(' ')
              }
              style={{ letterSpacing: '0.18em' }}
            >
              {label}
            </NavLink>
          ))}

          {/* ALTRO button */}
          <button
            onClick={() => setOverlayOpen(true)}
            className={[
              'text-xs font-mono shrink-0 px-3 py-1 rounded-pill border transition-all duration-150',
              overlayOpen
                ? 'border-white text-black bg-white'
                : 'border-border-subtle text-white/50 hover:border-white/50 hover:text-white',
            ].join(' ')}
            style={{ letterSpacing: '0.18em' }}
          >
            ALTRO
          </button>
        </div>
      </nav>

      {/* ── FULL SCREEN OVERLAY "ALTRO" ── */}
      {overlayOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
          style={{ background: '#000000' }}
        >
          {/* Top Bar inside Overlay */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-6">
            <div className="flex items-center gap-3">
              <Target size={20} className="text-white" strokeWidth={1.5} />
              <span
                className="text-white font-mono text-xs tracking-widest"
                style={{ letterSpacing: '0.24em' }}
              >
                MISSION CONTROL · MODULI AVANZATI
              </span>
            </div>
            <button
              onClick={() => setOverlayOpen(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-border-subtle hover:border-white text-white/60 hover:text-white font-mono text-xs tracking-wider transition-colors duration-150"
            >
              <X size={14} /> CHIUDI (ESC)
            </button>
          </div>

          {/* Grid of Menu items */}
          <div className="max-w-4xl mx-auto w-full py-12">
            <p
              className="font-mono text-white/20 text-xs tracking-widest mb-8"
              style={{ letterSpacing: '0.22em' }}
            >
              SELEZIONA MODULO OPERATIVO
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OVERLAY_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSelect(item.to)}
                  className="group text-left p-6 rounded-sm border border-border-subtle hover:border-white transition-all duration-200"
                  style={{ background: '#0a0a0a' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-mono text-lg sm:text-xl font-semibold tracking-display text-white group-hover:text-white"
                      style={{ letterSpacing: '0.16em' }}
                    >
                      {item.label}
                    </span>
                    <span className="text-white/25 group-hover:text-white transition-colors">
                      {item.icon}
                    </span>
                  </div>
                  <p className="text-text-content/40 text-xs font-sans group-hover:text-text-content/70 transition-colors">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer info */}
          <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-white/20 text-xs tracking-widest">
              ENGLISH MISSION CONTROL SYSTEM · SPA PROTOCOL V4
            </span>
            <span className="font-mono text-white/20 text-xs tracking-wider">
              PRESS ESC TO RETURN
            </span>
          </div>
        </div>
      )}
    </>
  )
}
