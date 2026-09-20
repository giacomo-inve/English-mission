import { useState, useEffect } from 'react'
import {
  Sliders,
  Volume2,
  Target,
  Shield,
  Sun,
  Moon,
  AlertOctagon,
  RotateCcw,
  Check,
  Plus,
  User,
  Type,
} from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { db, initDB } from '../db/database'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'

export default function Settings() {
  const { progress, reload, updatePilotName, updateFontSize } = useProgress()
  const [pilotInput, setPilotInput] = useState('')
  const [dailyMinutes, setDailyMinutes] = useState<number>(10)
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0)
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB')
  const [freezeCount, setFreezeCount] = useState<number>(1)
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')
  const [fontSize, setFontSizeState] = useState<'standard' | 'large' | 'extra'>('standard')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  // Initialize from progress and document class
  useEffect(() => {
    if (progress) {
      if (progress.pilotName) setPilotInput(progress.pilotName)
      if (progress.dailyGoalMinutes) setDailyMinutes(progress.dailyGoalMinutes)
      if (progress.voiceSpeed) setVoiceSpeed(progress.voiceSpeed)
      setFreezeCount(progress.streakFreeze ?? 0)
      if (progress.fontSize) setFontSizeState(progress.fontSize)
    }
    const isLight = document.documentElement.classList.contains('light-theme')
    setThemeState(isLight ? 'light' : 'dark')

    const currentFont = (document.documentElement.getAttribute('data-font-size') ||
      localStorage.getItem('emc-font-size') ||
      'standard') as 'standard' | 'large' | 'extra'
    setFontSizeState(currentFont)
  }, [progress])

  const notifySaved = (section: string) => {
    setSavedSection(section)
    setTimeout(() => setSavedSection(null), 1800)
  }

  // 1. Save pilot call sign
  const handleSavePilot = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = pilotInput.trim() || 'Commander Giacomo'
    await updatePilotName(clean)
    notifySaved('pilot')
  }

  // 2. Font size preference
  const handleSaveFontSize = async (size: 'standard' | 'large' | 'extra') => {
    setFontSizeState(size)
    await updateFontSize(size)
    notifySaved('font')
  }

  // 3. Daily goal minutes
  const handleSaveDailyMinutes = async (mins: number) => {
    setDailyMinutes(mins)
    const p = await db.user_progress.toCollection().first()
    if (p && p.id != null) {
      const mappedXP = mins === 5 ? 10 : mins === 10 ? 20 : 40
      await db.user_progress.update(p.id, { dailyGoalMinutes: mins, dailyGoal: mappedXP })
      await reload()
      notifySaved('goal')
    }
  }

  // 4. Voice speed
  const handleSaveVoiceSpeed = async (speed: number) => {
    setVoiceSpeed(speed)
    const p = await db.user_progress.toCollection().first()
    if (p && p.id != null) {
      await db.user_progress.update(p.id, { voiceSpeed: speed })
      await reload()
      notifySaved('speed')
    }
  }

  const testVoice = (speedToTest = voiceSpeed) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance('English Mission Control telemetry test at requested velocity.')
    utt.lang = accent
    utt.rate = speedToTest
    window.speechSynthesis.speak(utt)
  }

  // 5. Streak Freeze Management
  const addShield = async () => {
    const p = await db.user_progress.toCollection().first()
    if (p && p.id != null) {
      const newCount = (p.streakFreeze ?? 0) + 1
      await db.user_progress.update(p.id, { streakFreeze: newCount })
      setFreezeCount(newCount)
      await reload()
      notifySaved('shield')
    }
  }

  // 6. Light theme toggle
  const toggleTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme')
      localStorage.setItem('emc-theme', 'light')
    } else {
      document.documentElement.classList.remove('light-theme')
      localStorage.setItem('emc-theme', 'dark')
    }
    notifySaved('theme')
  }

  // 7. Danger reset IndexedDB
  const handleFullReset = async () => {
    await db.srs_items.clear()
    await db.streak_history.clear()
    await db.user_progress.clear()
    await db.section_levels.clear()
    await db.completed_exercises.clear()
    localStorage.clear()
    await initDB()
    await reload()
    setResetModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-3xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8">
        <p className="font-mono text-text-content/40 text-xs tracking-widest mb-1" style={{ letterSpacing: '0.22em' }}>
          CONFIGURAZIONE SISTEMA · MISSION CONTROL
        </p>
        <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
          <Sliders size={28} strokeWidth={1.5} className="text-signal-ok" /> CONTROLLI
        </h1>
      </div>

      <div className="divide-y divide-border-subtle">
        {/* ── SEZIONE 0: PROFILO PILOTA / INDICATIVO DI CHIAMATA ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User size={18} className="text-text-content/60" />
              <h2 className="font-mono text-xs text-text-display tracking-widest uppercase font-semibold">
                INDICATIVO DI CHIAMATA PILOTA
              </h2>
            </div>
            {savedSection === 'pilot' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1 font-bold">
                <Check size={12} /> AGGIORNATO
              </span>
            )}
          </div>

          <p className="text-text-content/60 text-xs mb-4 max-w-xl leading-relaxed">
            Nome o identificativo radio mostrato nella testata del Navigation Drawer, nella scheda astronauta e nella plancia rotta.
          </p>

          <form onSubmit={handleSavePilot} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              value={pilotInput}
              onChange={(e) => setPilotInput(e.target.value)}
              placeholder="es. Commander Giacomo"
              className="flex-1 px-4 py-2.5 bg-bg-section border border-border-subtle rounded font-mono text-xs text-text-display outline-none focus:border-signal-ok transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-pill bg-text-display text-bg-primary hover:opacity-90 font-mono text-xs font-semibold tracking-wider transition-opacity shrink-0"
            >
              SALVA PILOTA
            </button>
          </form>
        </div>

        {/* ── SEZIONE 1: SCALABILITÀ DIMENSIONE CARATTERI ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type size={18} className="text-text-content/60" />
              <h2 className="font-mono text-xs text-text-display tracking-widest uppercase font-semibold">
                DIMENSIONE CARATTERI TELEMETRIA
              </h2>
            </div>
            {savedSection === 'font' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1 font-bold">
                <Check size={12} /> IMPOSTATO
              </span>
            )}
          </div>

          <p className="text-text-content/60 text-xs mb-6 max-w-xl leading-relaxed">
            Regola dinamicamente la dimensione base del testo dell'intera applicazione per una leggibilità ottimale su ogni display.
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              { id: 'standard', label: 'STANDARD' },
              { id: 'large', label: 'GRANDE' },
              { id: 'extra', label: 'EXTRA' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleSaveFontSize(f.id as 'standard' | 'large' | 'extra')}
                className={[
                  'font-mono text-xs px-5 py-2.5 rounded-pill border transition-all duration-150',
                  fontSize === f.id
                    ? 'border-text-display text-bg-primary bg-text-display font-bold'
                    : 'border-border-subtle text-text-content/50 hover:border-text-display hover:text-text-display',
                ].join(' ')}
                style={{ letterSpacing: '0.14em' }}
              >
                [ {f.label} ]
              </button>
            ))}
          </div>
        </div>

        {/* ── SEZIONE 2: TEMA GRAFICO (SCURO / CHIARO) ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sun size={18} className="text-text-content/60" />
              <h2 className="font-mono text-xs text-text-display tracking-widest uppercase font-semibold">
                TEMA INTERFACCIA DI BORDO
              </h2>
            </div>
            {savedSection === 'theme' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1 font-bold">
                <Check size={12} /> APPLICATO
              </span>
            )}
          </div>

          <p className="text-text-content/60 text-xs mb-6 max-w-xl leading-relaxed">
            Seleziona la modalità cromatica preferita. Il tema chiaro garantisce contrasto calibrato (testo #0A0A0C su sfondo #F4F5F7).
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleTheme('dark')}
              className={[
                'inline-flex items-center gap-2 font-mono text-xs px-5 py-2.5 rounded-pill border transition-all duration-150',
                theme === 'dark'
                  ? 'border-text-display text-bg-primary bg-text-display font-bold'
                  : 'border-border-subtle text-text-content/50 hover:border-text-display hover:text-text-display',
              ].join(' ')}
            >
              <Moon size={14} /> [ TEMA SCURO ]
            </button>
            <button
              onClick={() => toggleTheme('light')}
              className={[
                'inline-flex items-center gap-2 font-mono text-xs px-5 py-2.5 rounded-pill border transition-all duration-150',
                theme === 'light'
                  ? 'border-text-display text-bg-primary bg-text-display font-bold'
                  : 'border-border-subtle text-text-content/50 hover:border-text-display hover:text-text-display',
              ].join(' ')}
            >
              <Sun size={14} /> [ TEMA CHIARO ]
            </button>
          </div>
        </div>

        {/* ── SEZIONE 3: OBIETTIVO GIORNALIERO ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-text-content/60" />
              <h2 className="font-mono text-xs text-text-display tracking-widest uppercase font-semibold">
                OBIETTIVO GIORNALIERO DI APPRENDIMENTO
              </h2>
            </div>
            {savedSection === 'goal' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1 font-bold">
                <Check size={12} /> SALVATO
              </span>
            )}
          </div>

          <p className="text-text-content/60 text-xs mb-6 max-w-xl leading-relaxed">
            Imposta l'impegno minimo richiesto per sessione per mantenere attiva la serie orbitale streak.
          </p>

          <div className="flex flex-wrap gap-3">
            {[5, 10, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSaveDailyMinutes(mins)}
                className={[
                  'font-mono text-xs px-5 py-2.5 rounded-pill border transition-all duration-150',
                  dailyMinutes === mins
                    ? 'border-text-display text-bg-primary bg-text-display font-bold'
                    : 'border-border-subtle text-text-content/50 hover:border-text-display hover:text-text-display',
                ].join(' ')}
                style={{ letterSpacing: '0.14em' }}
              >
                [ {mins} MIN ]
              </button>
            ))}
          </div>
        </div>

        {/* ── SEZIONE 4: VELOCITÀ SINTESI VOCALE ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 size={18} className="text-text-content/60" />
              <h2 className="font-mono text-xs text-text-display tracking-widest uppercase font-semibold">
                VELOCITÀ SINTESI VOCALE (TTS)
              </h2>
            </div>
            {savedSection === 'speed' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1 font-bold">
                <Check size={12} /> SALVATO
              </span>
            )}
          </div>

          <p className="text-text-content/60 text-xs mb-6 max-w-xl leading-relaxed">
            Calibra la velocità di pronuncia dei testi audio e delle frasi guida.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  handleSaveVoiceSpeed(spd)
                  testVoice(spd)
                }}
                className={[
                  'font-mono text-xs px-5 py-2.5 rounded-pill border transition-all duration-150',
                  voiceSpeed === spd
                    ? 'border-text-display text-bg-primary bg-text-display font-bold'
                    : 'border-border-subtle text-text-content/50 hover:border-text-display hover:text-text-display',
                ].join(' ')}
                style={{ letterSpacing: '0.14em' }}
              >
                [ {spd}X ]
              </button>
            ))}

            <button
              onClick={() => testVoice()}
              className="font-mono text-xs px-4 py-2 rounded-pill border border-signal-ok/40 text-signal-ok hover:bg-signal-ok/10 transition-colors ml-auto"
            >
              TEST AUDIO
            </button>
          </div>
        </div>

        {/* ── SEZIONE 5: STREAK FREEZE / SCUDO ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-text-content/60" />
              <h2 className="font-mono text-xs text-text-display tracking-widest uppercase font-semibold">
                SCUDO DI CONTINUITÀ (STREAK FREEZE)
              </h2>
            </div>
            {savedSection === 'shield' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1 font-bold">
                <Check size={12} /> AGGIUNTO
              </span>
            )}
          </div>

          <p className="text-text-content/60 text-xs mb-6 max-w-xl leading-relaxed">
            Conserva la serie di giorni consecutivi qualora non fosse possibile completare la sessione quotidiana.
          </p>

          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-text-display font-bold">
              {freezeCount} SCUDI ATTIVI
            </span>
            <button
              onClick={addShield}
              className="inline-flex items-center gap-1.5 font-mono text-xs px-4 py-2 rounded-pill border border-border-subtle hover:border-text-display text-text-display transition-colors"
            >
              <Plus size={14} /> AGGIUNGI SCUDO
            </button>
          </div>
        </div>

        {/* ── SEZIONE 6: RIPRISTINO DATI ── */}
        <div className="py-8">
          <div className="flex items-center gap-2 mb-2 text-signal-err">
            <AlertOctagon size={18} />
            <h2 className="font-mono text-xs tracking-widest uppercase font-semibold">
              RESET COMPLETO TELEMETRIA DI BORDO
            </h2>
          </div>

          <p className="text-text-content/60 text-xs mb-6 max-w-xl leading-relaxed">
            Azione irreversibile: azzera tutti i progressi locali, il database Dexie e la cronologia della missione.
          </p>

          <button
            onClick={() => setResetModalOpen(true)}
            className="px-5 py-2.5 rounded-pill border border-signal-err/50 text-signal-err hover:bg-signal-err hover:text-white font-mono text-xs tracking-wider transition-colors"
          >
            AZZERA TUTTI I DATI
          </button>
        </div>
      </div>

      {/* ── RESET CONFIRMATION MODAL ── */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-section border border-signal-err/50 rounded-md p-6 sm:p-8">
            <h3 className="heading-display text-xl text-signal-err mb-3">
              CONFERMA DI AZZERAMENTO
            </h3>
            <p className="text-text-content/80 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
              Tutti i dati, il profilo pilota, le flashcard SRS e la serie streak verranno cancellati in modo definitivo da questo browser.
            </p>
            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-pill border border-border-subtle text-text-display"
              >
                ANNULLA
              </button>
              <button
                onClick={handleFullReset}
                className="px-5 py-2 rounded-pill bg-signal-err text-white font-semibold"
              >
                CONFERMA AZZERAMENTO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
