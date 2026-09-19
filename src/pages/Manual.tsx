import { useNavigate } from 'react-router-dom'
import { BookMarked, Clock, RefreshCw, Layers, ArrowRight, Home, HelpCircle, Check, Shield } from 'lucide-react'
import GhostButton from '../components/GhostButton'

export default function Manual() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-3xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-8 mb-10">
        <p className="font-mono text-white/30 text-xs tracking-widest mb-2" style={{ letterSpacing: '0.24em' }}>
          DOCUMENTAZIONE OPERATIVA · SISTEMA DI BORDO
        </p>

        <h1 className="heading-display text-3xl sm:text-5xl text-white font-bold mb-4">
          FLIGHT MANUAL
        </h1>

        <p className="text-text-content/60 font-sans text-sm sm:text-base leading-relaxed max-w-2xl">
          Il protocollo scientifico di apprendimento di English Mission Control. Nessun elemento decorativo superfluo, nessuna perdita di tempo: solo principi cognitivi rigorosi per massimizzare la ritenzione e l'accuratezza linguistica.
        </p>
      </div>

      <div className="space-y-12">
        {/* ── SCHEDA 1: PROTOCOLLO 10 MIN/GIORNO ── */}
        <section
          className="p-6 sm:p-8 rounded-sm border border-border-subtle"
          style={{ background: '#0a0a0a' }}
        >
          <div className="flex items-center gap-2.5 mb-4 border-b border-border-subtle pb-3">
            <Clock size={18} className="text-white/70" />
            <h2 className="font-mono text-xs text-white tracking-widest uppercase">
              SCHEDA 01 · PROTOCOLLO 10 MINUTI AL GIORNO
            </h2>
          </div>

          <p className="text-text-content/50 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
            La continuità quotidiana breve è neurobiologicamente 4 volte più efficace di una sessione isolata settimanale di 70 minuti. Segui scrupolosamente questa sequenza operativa in ogni sessione:
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-white font-semibold tracking-wider">
                  FASE 1 · RIPASSO PRIORITARIO DEGLI ELEMENTI IN SCADENZA
                </span>
                <span className="font-mono text-xs text-signal-ok">3–4 MIN</span>
              </div>
              <p className="text-text-content/50 text-xs leading-relaxed">
                Prima di affrontare qualsiasi nuovo contenuto, svuota la coda nel modulo <strong>Ripasso</strong>. Consolidare le memorie deboli appena prima del decadimento impedisce il reset della curva dell'oblio.
              </p>
            </div>

            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-white font-semibold tracking-wider">
                  FASE 2 · ACQUISIZIONE NUOVA UNITÀ O LEZIONE RAPIDA
                </span>
                <span className="font-mono text-xs text-signal-ok">4–5 MIN</span>
              </div>
              <p className="text-text-content/50 text-xs leading-relaxed">
                Avvia la sessione core da <strong>"INIZIA"</strong> o apri la <strong>Mappa del Percorso</strong> per completare un'unità attiva. Concentrati su 3-5 nuovi termini o una forma sintattica isolata.
              </p>
            </div>

            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs text-white font-semibold tracking-wider">
                  FASE 3 · VERIFICA ATTIVA OUTPUT (PARLATO / SCRITTURA)
                </span>
                <span className="font-mono text-xs text-signal-ok">2 MIN</span>
              </div>
              <p className="text-text-content/50 text-xs leading-relaxed">
                Chiudi la sessione nel modulo <strong>Parlato</strong> (ripetizione vocale con verifica parola per parola) o con 50 parole nel modulo <strong>Scrittura</strong>. La produzione attiva forza la solidificazione neuronale.
              </p>
            </div>
          </div>
        </section>

        {/* ── SCHEDA 2: ALGORITMO SRS & LEITNER ── */}
        <section
          className="p-6 sm:p-8 rounded-sm border border-border-subtle"
          style={{ background: '#0a0a0a' }}
        >
          <div className="flex items-center gap-2.5 mb-4 border-b border-border-subtle pb-3">
            <RefreshCw size={18} className="text-white/70" />
            <h2 className="font-mono text-xs text-white tracking-widest uppercase">
              SCHEDA 02 · ALGORITMO SPACED REPETITION & LEITNER
            </h2>
          </div>

          <p className="text-text-content/50 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
            Ogni elemento memorizzato transita attraverso 5 scatole temporali progressive. Più dimostri di padroneggiare il termine, più si allontana la data di successiva verifica:
          </p>

          {/* Boxes breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6 text-center">
            {[
              { box: 'BOX 1', time: '1 MINUTO', desc: 'Apprendimento e recupero immediato' },
              { box: 'BOX 2', time: '1 GIORNO', desc: 'Consolidamento post-sonno' },
              { box: 'BOX 3', time: '3 GIORNI', desc: 'Memoria a medio termine' },
              { box: 'BOX 4', time: '7 GIORNI', desc: 'Stabilità settimanale' },
              { box: 'BOX 5', time: '30 GIORNI', desc: 'Memoria permanente' },
            ].map((b) => (
              <div key={b.box} className="p-3 rounded-sm border border-border-subtle bg-black">
                <span className="font-mono text-xs text-white font-bold block mb-1">{b.box}</span>
                <span className="font-mono text-[11px] text-signal-ok block mb-1">{b.time}</span>
                <span className="font-sans text-[10px] text-text-content/40 leading-tight block">{b.desc}</span>
              </div>
            ))}
          </div>

          {/* Rating choices criteria */}
          <p className="font-mono text-white/30 text-xs tracking-wider mb-3">
            CRITERIO DI SCELTA DEI 4 RATINGS OPERATIVI:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-sm border border-signal-err/40 bg-black">
              <span className="font-mono text-xs text-signal-err font-bold block mb-1">AGAIN · RETROCESSO A BOX 1</span>
              <p className="text-text-content/50 text-xs">
                Termine dimenticato o traduzione errata. L'elemento viene riproposto entro 60 secondi nella stessa sessione.
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-border-subtle bg-black">
              <span className="font-mono text-xs text-white/50 font-bold block mb-1">HARD · ARRETRAMENTO DI 1 BOX</span>
              <p className="text-text-content/50 text-xs">
                Ricordato solo dopo un'esitazione prolungata (&gt; 5 secondi). Evita che l'elemento salti a intervalli troppo lunghi.
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-white/40 bg-black">
              <span className="font-mono text-xs text-white font-bold block mb-1">GOOD · AVANZAMENTO ORDINARIO</span>
              <p className="text-text-content/50 text-xs">
                Risposta corretta con sforzo cognitivo standard. Promozione al box successivo (1g &rarr; 3g &rarr; 7g).
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-signal-ok/40 bg-black">
              <span className="font-mono text-xs text-signal-ok font-bold block mb-1">EASY · SALTO DI 2 BOX</span>
              <p className="text-text-content/50 text-xs">
                Termine evidente, padroneggiato all'istante senza esitazione. Salta due livelli per non saturare la coda di ripasso.
              </p>
            </div>
          </div>
        </section>

        {/* ── SCHEDA 3: MEMORIZZAZIONE FONETICA DEI VERBI ── */}
        <section
          className="p-6 sm:p-8 rounded-sm border border-border-subtle"
          style={{ background: '#0a0a0a' }}
        >
          <div className="flex items-center gap-2.5 mb-4 border-b border-border-subtle pb-3">
            <Layers size={18} className="text-white/70" />
            <h2 className="font-mono text-xs text-white tracking-widest uppercase">
              SCHEDA 03 · MEMORIZZAZIONE FONETICA DEI VERBI IRREGOLARI
            </h2>
          </div>

          <p className="text-text-content/50 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
            Perché le liste alfabetiche tradizionali falliscono: imparare <em>arise, awake, be, bear, beat</em> produce <strong>interferenza proattiva</strong>, poiché il cervello non trova alcuna rima o ancoraggio ritmico. English Mission Control organizza tutti i 38 verbi per pattern morfofonetico:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <span className="font-mono text-xs text-signal-ok font-bold block mb-1">
                PATTERN AAA · INVARIANZA TOTALE (es. cut · cut · cut)
              </span>
              <p className="text-text-content/50 text-xs">
                Le tre forme (infinitive, past, participle) coincidono integralmente: <em>cut, put, let, hit, set, hurt, read</em>. Zero carico sui mutamenti vocalici.
              </p>
            </div>

            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <span className="font-mono text-xs text-[#a78bfa] font-bold block mb-1">
                PATTERN ABA · RITORNO ALLA BASE (es. come · came · come)
              </span>
              <p className="text-text-content/50 text-xs">
                Il Past Simple muta, ma il Past Participle coincide con la forma base: <em>come-came-come</em>, <em>run-ran-run</em>, <em>become-became-become</em>.
              </p>
            </div>

            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <span className="font-mono text-xs text-white/70 font-bold block mb-1">
                PATTERN ABB · IDENTITÀ PASSATA (es. buy · bought · bought)
              </span>
              <p className="text-text-content/50 text-xs">
                Past Simple e Past Participle condividono esattamente la stessa desinenza o mutazione vocalica: <em>buy-bought-bought, find-found-found, teach-taught-taught, make-made-made</em>.
              </p>
            </div>

            <div className="p-4 rounded-sm border border-border-subtle bg-black">
              <span className="font-mono text-xs text-signal-err font-bold block mb-1">
                PATTERN ABC · ABLAUT COMPLETO (es. go · went · gone)
              </span>
              <p className="text-text-content/50 text-xs">
                Tutte e tre le forme variano seguendo scale armoniche storiche indoeuropee (Ablaut): <em>sing-sang-sung, drink-drank-drunk, write-wrote-written, begin-began-begun</em>.
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ACTIONS ── */}
        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <GhostButton
            size="lg"
            onClick={() => navigate('/?briefing=true')}
          >
            <HelpCircle size={14} /> RIPETI MISSION BRIEFING
          </GhostButton>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/percorso')}
              className="font-mono text-xs text-white/40 hover:text-white px-4 py-2 border border-border-subtle rounded-pill hover:border-white transition-colors"
            >
              VAI AL PERCORSO
            </button>
            <button
              onClick={() => navigate('/')}
              className="font-mono text-xs text-white/40 hover:text-white px-4 py-2 border border-border-subtle rounded-pill hover:border-white transition-colors"
            >
              HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
