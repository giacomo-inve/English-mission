import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Volume2, Target, Shield, Sun, Moon, AlertOctagon, RotateCcw, Check, Plus } from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { db, initDB } from '../db/database'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'

export default function Settings() {
  const { progress, reload, addXP } = useProgress()
  const [dailyMinutes, setDailyMinutes] = useState<number>(10)
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0)
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB')
  const [freezeCount, setFreezeCount] = useState<number>(1)
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  // Initialize from progress and document class
  useEffect(() => {
    if (progress) {
      if (progress.dailyGoalMinutes) setDailyMinutes(progress.dailyGoalMinutes)
      if (progress.voiceSpeed) setVoiceSpeed(progress.voiceSpeed)
      setFreezeCount(progress.streakFreeze ?? 0)
    }
    const isLight = document.documentElement.classList.contains('light-theme')
    setThemeState(isLight ? 'light' : 'dark')
  }, [progress])

  const notifySaved = (section: string) => {
    setSavedSection(section)
    setTimeout(() => setSavedSection(null), 1500)
  }

  // 1. Daily goal minutes
  const handleSaveDailyMinutes = async (mins: number) => {
    setDailyMinutes(mins)
    const p = await db.user_progress.toCollection().first()
    if (p && p.id != null) {
      // Map minutes to XP: 5 min -> 10 XP, 10 min -> 20 XP, 20 min -> 40 XP
      const mappedXP = mins === 5 ? 10 : mins === 10 ? 20 : 40
      await db.user_progress.update(p.id, { dailyGoalMinutes: mins, dailyGoal: mappedXP })
      await reload()
      notifySaved('goal')
    }
  }

  // 2. Voice speed
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

  // 3. Streak Freeze Management
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

  // 4. Light theme toggle
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

  // 5. Danger reset IndexedDB
  const handleFullReset = async () => {
    await db.srs_items.clear()
    await db.streak_history.clear()
    await db.user_progress.clear()
    await initDB()
    await reload()
    setResetModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-3xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8">
        <p className="font-mono text-white/30 text-xs tracking-widest mb-1" style={{ letterSpacing: '0.22em' }}>
          CONFIGURAZIONE SISTEMA · MISSION CONTROL
        </p>
        <h1 className="heading-display text-3xl sm:text-4xl text-white flex items-center gap-3">
          <SettingsIcon size={28} strokeWidth={1.5} /> IMPOSTAZIONI
        </h1>
      </div>

      <div className="divide-y divide-border-subtle">
        {/* ── VOCE 1: OBIETTIVO GIORNALIERO [ 5 MIN ] [ 10 MIN ] [ 20 MIN ] ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-white/60" />
              <h2 className="font-mono text-xs text-white tracking-widest uppercase">
                OBIETTIVO GIORNALIERO DI APPRENDIMENTO
              </h2>
            </div>
            {savedSection === 'goal' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1">
                <Check size={12} /> SALVATO
              </span>
            )}
          </div>

          <p className="text-text-content/40 text-xs mb-6 max-w-xl leading-relaxed">
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
                    ? 'border-white text-black bg-white font-semibold'
                    : 'border-border-subtle text-white/40 hover:border-white/50 hover:text-white',
                ].join(' ')}
                style={{ letterSpacing: '0.14em' }}
              >
                [ {mins} MIN ]
              </button>
            ))}
          </div>
        </div>

        {/* ── VOCE 2: VELOCITÀ SINTESI VOCALE (0.75X - 1.0X - 1.25X) + SLIDER ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 size={18} className="text-white/60" />
              <h2 className="font-mono text-xs text-white tracking-widest uppercase">
                VELOCITÀ SINTESI VOCALE PREDEFINITA
              </h2>
            </div>
            {savedSection === 'speed' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1">
                <Check size={12} /> AGGIORNATO
              </span>
            )}
          </div>

          <p className="text-text-content/40 text-xs mb-6 max-w-xl leading-relaxed">
            Regola la cadenza di pronuncia predefinita impiegata nelle flashcard, nei dettati e nei dialoghi.
          </p>

          <div className="space-y-4">
            {/* Quick buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {[0.75, 1.0, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    handleSaveVoiceSpeed(s)
                    testVoice(s)
                  }}
                  className={[
                    'font-mono text-xs px-4 py-2 rounded-pill border transition-all duration-150',
                    voiceSpeed === s
                      ? 'border-white text-black bg-white font-semibold'
                      : 'border-border-subtle text-white/40 hover:border-white/50 hover:text-white',
                  ].join(' ')}
                  style={{ letterSpacing: '0.12em' }}
                >
                  {s.toFixed(2)}X
                </button>
              ))}

              <GhostButton size="sm" onClick={() => testVoice()}>
                <Volume2 size={13} /> TEST VELOCITÀ ({voiceSpeed.toFixed(2)}X)
              </GhostButton>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-4 max-w-md pt-2">
              <span className="font-mono text-xs text-white/30">0.50X</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={voiceSpeed}
                onChange={(e) => handleSaveVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <span className="font-mono text-xs text-white/30">1.50X</span>
            </div>
          </div>
        </div>

        {/* ── VOCE 3: GESTIONE STREAK FREEZE (SCUDI DISPONIBILI) ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-white/60" />
              <h2 className="font-mono text-xs text-white tracking-widest uppercase">
                GESTIONE SCUDI (STREAK FREEZE)
              </h2>
            </div>
            {savedSection === 'shield' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1">
                <Check size={12} /> SCUDO ATTIVATO
              </span>
            )}
          </div>

          <p className="text-text-content/40 text-xs mb-6 max-w-xl leading-relaxed">
            Se salti un giorno di allenamento, uno scudo viene consumato automaticamente proteggendo la serie streak.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="data-tile px-6 py-4 flex flex-row items-center gap-4">
              <Shield size={24} strokeWidth={1.5} className="text-signal-ok" />
              <div>
                <span className="font-mono text-xs text-white/40 block">SCUDI ATTIVI</span>
                <span className="font-mono text-white text-2xl tabular-nums">
                  <AnimatedCounter value={freezeCount} /> DISPONIBIL{freezeCount === 1 ? 'E' : 'I'}
                </span>
              </div>
            </div>

            <GhostButton size="sm" onClick={addShield}>
              <Plus size={13} /> AGGIUNGI SCUDO DI RISERVA
            </GhostButton>
          </div>
        </div>

        {/* ── VOCE 4: SWITCH TEMA CHIARO OPZIONALE (CANVAS #FFFFFF, TESTO #000000) ── */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon size={18} className="text-white/60" /> : <Sun size={18} className="text-black" />}
              <h2 className="font-mono text-xs text-white tracking-widest uppercase">
                TEMA INTERFACCIA (SPACE CANVASES)
              </h2>
            </div>
            {savedSection === 'theme' && (
              <span className="font-mono text-xs text-signal-ok flex items-center gap-1">
                <Check size={12} /> APPLICATO
              </span>
            )}
          </div>

          <p className="text-text-content/40 text-xs mb-6 max-w-xl leading-relaxed">
            Seleziona la modalità cromatica preferita. La modalità scura rispetta lo standard Mission Control #000000; la modalità chiara applica canvas #ffffff con testi #000000.
          </p>

          <div className="flex items-center border border-border-subtle rounded-pill p-1 max-w-xs">
            <button
              onClick={() => toggleTheme('dark')}
              className={`flex-1 font-mono text-xs py-2 rounded-pill flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Moon size={12} /> SCURO (DEF.)
            </button>
            <button
              onClick={() => toggleTheme('light')}
              className={`flex-1 font-mono text-xs py-2 rounded-pill flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-black text-white font-semibold'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Sun size={12} /> CHIARO
            </button>
          </div>
        </div>

        {/* ── VOCE 5: TASTO GHOST PILL DI PERICOLO: "RESET COMPLETO DATI" ── */}
        <div className="py-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon size={18} className="text-signal-err" />
            <h2 className="font-mono text-xs text-signal-err tracking-widest uppercase">
              ZONA DI PERICOLO · OPERAZIONI CRITICHE
            </h2>
          </div>

          <p className="text-text-content/40 text-xs mb-6 max-w-xl leading-relaxed">
            L'operazione elimina irreversibilmente tutte le tabelle IndexedDB locali (streak, progressi, box SRS e storico XP) e reinstalla il dataset di seed originale.
          </p>

          <button
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-pill border border-signal-err text-signal-err font-mono text-xs tracking-display uppercase hover:bg-signal-err/10 transition-all duration-150"
          >
            <RotateCcw size={13} /> RESET COMPLETO DATI
          </button>
        </div>
      </div>

      {/* ── MODALE DI CONFERMA RESET ── */}
      {resetModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="w-full max-w-md p-8 rounded-sm border border-signal-err/60 flex flex-col justify-between"
            style={{ background: '#0a0a0a' }}
          >
            <div className="flex items-center gap-3 text-signal-err mb-4">
              <AlertOctagon size={24} />
              <h3 className="heading-display text-xl">CONFERMA RESET</h3>
            </div>

            <p className="text-text-content/70 font-sans text-sm mb-6 leading-relaxed">
              Sei sicuro di voler cancellare tutti i progressi locali, azzerare lo streak e resettare i box SRS? L'operazione non può essere annullata.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                onClick={() => setResetModalOpen(false)}
                className="font-mono text-xs px-4 py-2 rounded-pill border border-border-subtle text-white/50 hover:text-white"
              >
                ANNULLA
              </button>
              <button
                onClick={handleFullReset}
                className="font-mono text-xs px-5 py-2 rounded-pill border border-signal-err text-signal-err hover:bg-signal-err/20 font-bold"
              >
                CONFERMA ELIMINAZIONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
