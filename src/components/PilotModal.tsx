import { useState, useEffect } from 'react'
import { Rocket, Check, UserCheck } from 'lucide-react'

interface PilotModalProps {
  isOpen: boolean
  currentName?: string
  onSave: (name: string) => void
  onClose?: () => void
  isInitialSetup?: boolean
}

export default function PilotModal({
  isOpen,
  currentName = '',
  onSave,
  onClose,
  isInitialSetup = false,
}: PilotModalProps) {
  const [name, setName] = useState(currentName || 'Commander Giacomo')

  useEffect(() => {
    if (currentName) setName(currentName)
  }, [currentName])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = name.trim() || 'Commander Giacomo'
    onSave(clean)
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-md bg-bg-section border border-border-subtle rounded-md shadow-2xl p-6 sm:p-8"
        style={{ borderColor: '#3a3a3f' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full border border-signal-ok/40 bg-signal-ok/10 flex items-center justify-center text-signal-ok">
            <Rocket size={20} />
          </div>
          <div>
            <p className="font-mono text-xs text-text-content/40 tracking-widest uppercase">
              {isInitialSetup ? 'BENVENUTO A BORDO · MISSION PROTOCOL' : 'CONFIGURAZIONE PILOTA'}
            </p>
            <h2 className="heading-display text-xl sm:text-2xl text-text-display">
              IDENTIFICAZIONE PILOTA
            </h2>
          </div>
        </div>

        <p className="text-text-content/75 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
          Inserisci il tuo indicativo di chiamata o nominativo di volo ufficiale. Questo nome comparirà sul diario di bordo, nella telemetria e nella plancia di comando.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="pilot-name"
              className="block font-mono text-xs text-text-content/50 uppercase tracking-wider mb-2"
            >
              INDICATIVO DI CHIAMATA / NOME
            </label>
            <input
              id="pilot-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Commander Giacomo"
              autoFocus
              className="w-full px-4 py-3 bg-bg-primary border border-border-subtle focus:border-signal-ok rounded font-mono text-sm text-text-display outline-none transition-colors"
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-[10px] text-text-content/30 self-center">SUGGERIMENTI:</span>
            {['Commander Giacomo', 'Major Maverick', 'Pilot Elena'].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setName(sug)}
                className="font-mono text-[10px] px-2.5 py-1 rounded-pill border border-border-subtle hover:border-text-display text-text-content/60 hover:text-text-display transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {!isInitialSetup && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-pill border border-border-subtle font-mono text-xs text-text-content/60 hover:text-text-display"
              >
                ANNULLA
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-pill bg-white text-black hover:bg-white/90 font-mono text-xs font-semibold tracking-wider flex items-center gap-2 transition-all shadow"
            >
              <Check size={14} strokeWidth={2.5} /> CONFERMA PILOTA
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
