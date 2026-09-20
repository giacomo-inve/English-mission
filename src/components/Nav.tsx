import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Compass,
  Rocket,
  Flame,
  Package,
  Radio,
  Mic,
  BookOpen,
  RotateCcw,
  User,
  Sliders,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { useProgress } from '../hooks/useProgress'
import { playNavClick, playModalToggle } from '../utils/sfx'

interface NavFlightItem {
  id: string
  label: string
  subtitle: string
  to: string
  icon: LucideIcon
}

const FLIGHT_NAV_ITEMS: NavFlightItem[] = [
  {
    id: 'rotta',
    label: 'ROTTA',
    subtitle: 'Panoramica e stato giornaliero',
    to: '/',
    icon: Compass,
  },
  {
    id: 'missioni',
    label: 'MISSIONI',
    subtitle: 'Albero delle tappe A1-B2',
    to: '/percorso',
    icon: Rocket,
  },
  {
    id: 'propulsione',
    label: 'PROPULSIONE',
    subtitle: 'Tabelle forme verbali e pattern',
    to: '/verbi',
    icon: Flame,
  },
  {
    id: 'carico',
    label: 'CARICO',
    subtitle: 'Payload lessicale per categorie',
    to: '/vocaboli',
    icon: Package,
  },
  {
    id: 'comunicazioni',
    label: 'COMUNICAZIONI',
    subtitle: 'Segnali audio e trascrizione',
    to: '/ascolto',
    icon: Radio,
  },
  {
    id: 'vocal-link',
    label: 'VOCAL LINK',
    subtitle: 'Verifica pronuncia e dialoghi',
    to: '/parlato',
    icon: Mic,
  },
  {
    id: 'logbook',
    label: 'LOGBOOK',
    subtitle: 'Diario di bordo e composizione',
    to: '/scrittura',
    icon: BookOpen,
  },
  {
    id: 'orbita-srs',
    label: 'ORBITA SRS',
    subtitle: 'Sessioni Leitner',
    to: '/ripasso',
    icon: RotateCcw,
  },
  {
    id: 'astronauta',
    label: 'ASTRONAUTA',
    subtitle: 'Dati pilota e statistiche',
    to: '/progressi',
    icon: User,
  },
  {
    id: 'controlli',
    label: 'CONTROLLI',
    subtitle: 'Impostazioni di bordo',
    to: '/impostazioni',
    icon: Sliders,
  },
]

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { progress } = useProgress()
  const location = useLocation()
  const navigate = useNavigate()

  const pilotName = progress?.pilotName || 'Commander Giacomo'

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  // Manage body scroll & ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [drawerOpen])

  return (
    <>
      {/* ── TOP BAR (ALTEZZA 56px / 3.5rem) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 px-4 sm:px-6 flex items-center justify-between border-b border-border-subtle bg-bg-primary/95 backdrop-blur-md transition-colors"
      >
        {/* Left: Logo 36px + Mission Control */}
        <NavLink
          to="/"
          onClick={() => playNavClick()}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity select-none"
        >
          <img
            src="./logo.png"
            alt="Mission Control Logo"
            className="h-9 w-auto max-w-[42px] object-contain rounded-full shadow-sm"
          />
          <div className="flex flex-col">
            <span
              className="text-text-display font-mono text-sm sm:text-base font-bold tracking-widest leading-none"
              style={{ letterSpacing: '0.18em' }}
            >
              MISSION CONTROL
            </span>
            <span className="font-mono text-[9px] text-text-content/40 tracking-wider hidden xs:inline">
              SPA FLIGHT PROTOCOL V4
            </span>
          </div>
        </NavLink>

        {/* Right: Hamburger button Android style */}
        <button
          onClick={() => {
            playModalToggle(true)
            setDrawerOpen(true)
          }}
          aria-label="Apri menu navigazione"
          className="p-2 text-text-display hover:bg-bg-section rounded-md border border-border-subtle hover:border-text-display transition-colors flex items-center justify-center"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
      </header>

      {/* ── ANDROID NAVIGATION DRAWER ── */}
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => {
          playModalToggle(false)
          setDrawerOpen(false)
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel (Slide-in a tutta altezza da destra) */}
      <aside
        className={[
          'fixed top-0 right-0 bottom-0 z-50 w-[88vw] max-w-sm bg-bg-section border-l border-border-subtle shadow-2xl flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Menu navigazione di bordo"
      >
        {/* Drawer Header: Pilota in comando + pulsante chiusura (X) */}
        <div className="p-5 border-b border-border-subtle bg-bg-primary/50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-signal-ok/40 bg-signal-ok/10 flex items-center justify-center text-signal-ok font-mono font-bold text-sm">
              <User size={18} />
            </div>
            <div>
              <p className="font-mono text-[10px] text-text-content/40 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={11} className="text-signal-ok" /> PILOTA IN COMANDO
              </p>
              <h2 className="font-mono text-sm sm:text-base font-bold text-text-display truncate max-w-[190px]">
                {pilotName}
              </h2>
              <span className="inline-block mt-0.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-signal-ok/15 text-signal-ok border border-signal-ok/30 tracking-wider">
                LIVELLI SBLOCCATI · A1-B2
              </span>
            </div>
          </div>

          {/* Close button (X) */}
          <button
            onClick={() => {
              playModalToggle(false)
              setDrawerOpen(false)
            }}
            aria-label="Chiudi navigazione"
            className="p-1.5 rounded-sm text-text-content/50 hover:text-text-display hover:bg-bg-primary transition-colors border border-transparent hover:border-border-subtle"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <p className="px-3 py-1 font-mono text-[10px] text-text-content/30 tracking-widest uppercase">
            SISTEMI DI VOLO E MODULI
          </p>

          {FLIGHT_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={() => {
                  playNavClick()
                  setDrawerOpen(false)
                }}
                className={[
                  'flex items-center gap-3.5 px-3.5 py-3 rounded transition-all duration-150 group',
                  isActive
                    ? 'bg-text-display text-bg-primary font-semibold shadow-sm'
                    : 'text-text-content/80 hover:text-text-display hover:bg-bg-primary/60',
                ].join(' ')}
              >
                <div
                  className={[
                    'p-1.5 rounded shrink-0 transition-colors',
                    isActive ? 'bg-bg-primary text-text-display' : 'text-text-content/60 group-hover:text-text-display',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        'font-mono text-xs tracking-wider uppercase',
                        isActive ? 'text-bg-primary font-bold' : 'text-text-display font-medium',
                      ].join(' ')}
                      style={{ letterSpacing: '0.12em' }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-ok shrink-0" />
                    )}
                  </div>
                  <p
                    className={[
                      'text-[11px] font-sans truncate',
                      isActive ? 'text-bg-primary/75' : 'text-text-content/40 group-hover:text-text-content/60',
                    ].join(' ')}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </NavLink>
            )
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-subtle bg-bg-primary/40 flex items-center justify-between text-[10px] font-mono text-text-content/40">
          <span>ENGLISH MISSION CONTROL</span>
          <span className="px-2 py-0.5 rounded border border-border-subtle">LOCAL-FIRST</span>
        </div>
      </aside>
    </>
  )
}
