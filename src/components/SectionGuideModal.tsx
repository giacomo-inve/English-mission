import { useState, useEffect } from 'react'
import { X, HelpCircle, Compass, CheckCircle2, Sliders } from 'lucide-react'

export interface GuideControl {
  name: string
  desc: string
}

export interface SectionGuideModalProps {
  sectionTitle: string
  sectionSubtitle?: string
  objective: string
  methodology: string[]
  controls: GuideControl[]
}

export default function SectionGuideModal({
  sectionTitle,
  sectionSubtitle,
  objective,
  methodology,
  controls,
}: SectionGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Minimalist 1px circular trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={`Guida per la sezione ${sectionTitle}`}
        title="Guida Operativa (i)"
        className="w-7 h-7 rounded-full border border-border-subtle hover:border-white text-text-content/60 hover:text-text-display flex items-center justify-center font-mono text-xs transition-all duration-150 shrink-0 select-none"
      >
        i
      </button>

      {/* Backdrop & Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl bg-bg-section border border-border-subtle rounded-md shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto"
            style={{ borderColor: '#3a3a3f' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-subtle pb-4 mb-6">
              <div>
                {sectionSubtitle && (
                  <p className="font-mono text-xs text-text-content/40 tracking-widest uppercase mb-1">
                    {sectionSubtitle}
                  </p>
                )}
                <h2 className="heading-display text-xl sm:text-2xl text-text-display flex items-center gap-2">
                  <Compass size={22} className="text-signal-ok" strokeWidth={1.5} />
                  {sectionTitle}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-content/50 hover:text-text-display transition-colors rounded-sm"
                aria-label="Chiudi guida"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6 text-sm font-sans">
              {/* 1. Obiettivo */}
              <div>
                <h3 className="font-mono text-xs text-text-content/60 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-ok" />
                  OBIETTIVO FORMATIVO
                </h3>
                <p className="text-text-content/85 leading-relaxed bg-bg-primary/50 p-3.5 rounded border border-border-subtle/60">
                  {objective}
                </p>
              </div>

              {/* 2. Metodologia / Come Allenarsi */}
              <div>
                <h3 className="font-mono text-xs text-text-content/60 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-signal-ok" />
                  ISTRUZIONI EFFICACI DI ALLENAMENTO
                </h3>
                <ul className="space-y-2">
                  {methodology.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-text-content/80 text-xs sm:text-sm">
                      <span className="font-mono text-text-content/30 text-xs shrink-0 mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Spiegazione Controlli */}
              {controls && controls.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs text-text-content/60 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <Sliders size={14} className="text-signal-ok" />
                    PANNELLO CONTROLLI DISPONIBILI
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {controls.map((ctrl, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-bg-primary/40 border border-border-subtle/60"
                      >
                        <p className="font-mono text-xs text-text-display font-semibold mb-1">
                          {ctrl.name}
                        </p>
                        <p className="text-text-content/60 text-xs">
                          {ctrl.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border-subtle pt-5 mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-pill border border-border-subtle hover:border-white font-mono text-xs tracking-wider text-text-display transition-colors"
              >
                RICEVUTO (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
