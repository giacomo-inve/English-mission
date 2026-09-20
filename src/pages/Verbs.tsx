import { useState, useMemo, useEffect, useCallback } from 'react'
import { Volume2, Plus, Check, Search, X, Flame } from 'lucide-react'
import { irregularVerbs, type IrregularPattern, type IrregularVerb } from '../db/seed'
import { db } from '../db/database'
import { useProgress } from '../hooks/useProgress'
import SectionGuideModal from '../components/SectionGuideModal'

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-GB'
  utt.rate = 0.82
  window.speechSynthesis.speak(utt)
}

function speakForms(verb: IrregularVerb) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()

  const sayOne = (form: string, onDone: () => void) => {
    const u = new SpeechSynthesisUtterance(form)
    u.lang = 'en-GB'
    u.rate = 0.82
    u.onend = onDone
    window.speechSynthesis.speak(u)
  }

  const seq = [verb.base, verb.past, verb.pastParticiple]
  const step = (idx: number) => {
    if (idx >= seq.length) return
    sayOne(seq[idx], () => setTimeout(() => step(idx + 1), 320))
  }
  step(0)
}

// ─────────────────────────────────────────
// Pattern config
// ─────────────────────────────────────────

type FilterPattern = IrregularPattern | 'tutti'
type FilterLevel = 'tutti' | 'A1' | 'A2' | 'B1' | 'B2'

const PATTERN_META: Record<IrregularPattern, { desc: string; color: string; example: string }> = {
  AAA: { desc: 'Base = Past = Past Participle',         color: '#3DDC84', example: 'cut · cut · cut' },
  ABA: { desc: 'Base = Past Participle ≠ Past',         color: '#a78bfa', example: 'come · came · come' },
  ABB: { desc: 'Past = Past Participle ≠ Base',         color: '#64748b', example: 'buy · bought · bought' },
  ABC: { desc: 'Tutte e tre le forme diverse',           color: '#FF5C5C', example: 'go · went · gone' },
}

function PatternBadge({ pattern }: { pattern: IrregularPattern }) {
  const meta = PATTERN_META[pattern]
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 rounded-sm border"
      style={{ borderColor: meta.color, color: meta.color }}
    >
      {pattern}
    </span>
  )
}

function SRSButton({ verbId, inQueue, onAdd }: { verbId: string; inQueue: boolean; onAdd: () => void }) {
  const [flash, setFlash] = useState(false)

  const handleClick = () => {
    onAdd()
    setFlash(true)
    setTimeout(() => setFlash(false), 1200)
  }

  if (inQueue) {
    return (
      <span
        className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-pill border"
        style={{ borderColor: '#3DDC84', color: '#3DDC84' }}
      >
        <Check size={11} strokeWidth={2.5} /> IN CODA
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-pill border',
        'transition-all duration-150',
        flash
          ? 'border-signal-ok text-signal-ok'
          : 'border-border-subtle text-text-content/50 hover:border-text-display hover:text-text-display',
      ].join(' ')}
      style={{ letterSpacing: '0.12em' }}
    >
      <Plus size={11} strokeWidth={2.5} /> AGGIUNGI
    </button>
  )
}

function VerbRow({
  verb,
  inQueue,
  onAddToQueue,
}: {
  verb: IrregularVerb
  inQueue: boolean
  onAddToQueue: (id: string) => void
}) {
  return (
    <tr
      className="border-b transition-colors hover:bg-bg-section/60"
      style={{ borderColor: '#3a3a3f' }}
    >
      {/* BASE */}
      <td className="py-4 px-4 font-sans font-medium text-text-display">
        <div className="flex items-center gap-2">
          <span>{verb.base}</span>
          <button
            onClick={() => speak(verb.base)}
            className="text-text-content/30 hover:text-text-display transition-colors"
            title="Pronuncia forma base"
          >
            <Volume2 size={14} />
          </button>
        </div>
      </td>

      {/* PAST SIMPLE */}
      <td className="py-4 px-4 font-mono text-text-content/90 text-sm">
        <div className="flex items-center gap-2">
          <span>{verb.past}</span>
          <button
            onClick={() => speak(verb.past)}
            className="text-text-content/30 hover:text-text-display transition-colors"
            title="Pronuncia Past Simple"
          >
            <Volume2 size={14} />
          </button>
        </div>
      </td>

      {/* PAST PARTICIPLE */}
      <td className="py-4 px-4 font-mono text-text-content/90 text-sm">
        <div className="flex items-center gap-2">
          <span>{verb.pastParticiple}</span>
          <button
            onClick={() => speak(verb.pastParticiple)}
            className="text-text-content/30 hover:text-text-display transition-colors"
            title="Pronuncia Past Participle"
          >
            <Volume2 size={14} />
          </button>
        </div>
      </td>

      {/* TRADUZIONE */}
      <td className="py-4 px-4 font-sans text-text-content/60 text-sm">
        {verb.translation}
      </td>

      {/* PATTERN */}
      <td className="py-4 px-4">
        <PatternBadge pattern={verb.pattern} />
      </td>

      {/* LIVELLO */}
      <td className="py-4 px-4 font-mono text-xs text-text-content/40">
        {verb.level}
      </td>

      {/* AZIONI: TUTTE LE FORME + SRS */}
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => speakForms(verb)}
            className="font-mono text-xs px-2.5 py-1.5 rounded-sm border border-border-subtle hover:border-text-display text-text-content/60 hover:text-text-display transition-colors flex items-center gap-1"
            title="Riproduci sequenza 3 forme"
          >
            <Volume2 size={12} /> 3 FORME
          </button>
          <SRSButton verbId={verb.id} inQueue={inQueue} onAdd={() => onAddToQueue(verb.id)} />
        </div>
      </td>
    </tr>
  )
}

export default function Verbs() {
  const { progress, updateSectionLevel } = useProgress()
  const [patternFilter, setPatternFilter] = useState<FilterPattern>('tutti')
  const [levelFilter, setLevelFilter] = useState<FilterLevel>('tutti')
  const [search, setSearch] = useState('')
  const [srsQueueIds, setSrsQueueIds] = useState<Set<string>>(new Set())

  // Sync initial level from Dexie
  useEffect(() => {
    if (progress?.verbs_level && ['A1', 'A2', 'B1', 'B2'].includes(progress.verbs_level)) {
      setLevelFilter(progress.verbs_level as FilterLevel)
    }
  }, [progress?.verbs_level])

  // Load SRS queue to see what's already queued
  useEffect(() => {
    db.srs_items
      .where('itemType')
      .equals('verb')
      .toArray()
      .then((items) => {
        setSrsQueueIds(new Set(items.map((i) => i.itemId)))
      })
  }, [])

  const handleLevelChange = async (lvl: FilterLevel) => {
    setLevelFilter(lvl)
    if (lvl !== 'tutti') {
      await updateSectionLevel('verbs_level', lvl)
    }
  }

  // Add a verb to SRS table
  const handleAddToQueue = useCallback(async (verbId: string) => {
    const existing = await db.srs_items
      .where('[itemId+itemType]')
      .equals([verbId, 'verb'])
      .first()
    if (!existing) {
      await db.srs_items.add({
        itemId: verbId,
        itemType: 'verb',
        box: 1,
        nextReviewAt: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
        lastReviewedAt: 0,
      })
      setSrsQueueIds((prev) => new Set([...prev, verbId]))
    }
  }, [])

  // Filter verbs
  const filteredVerbs = useMemo(() => {
    return irregularVerbs.filter((v) => {
      const matchPattern = patternFilter === 'tutti' || v.pattern === patternFilter
      const matchLevel = levelFilter === 'tutti' || v.level === levelFilter
      const matchSearch =
        !search ||
        v.base.toLowerCase().includes(search.toLowerCase()) ||
        v.past.toLowerCase().includes(search.toLowerCase()) ||
        v.pastParticiple.toLowerCase().includes(search.toLowerCase()) ||
        v.translation.toLowerCase().includes(search.toLowerCase())
      return matchPattern && matchLevel && matchSearch
    })
  }, [patternFilter, levelFilter, search])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-6xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8 flex items-start justify-between">
        <div>
          <p
            className="font-mono text-text-content/40 text-xs tracking-widest mb-1"
            style={{ letterSpacing: '0.22em' }}
          >
            SISTEMA DI PROPULSIONE LINGUISTICA · FORME VERBALI
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
            <Flame size={30} strokeWidth={1.5} className="text-signal-ok" /> PROPULSIONE
          </h1>
        </div>

        <SectionGuideModal
          sectionTitle="PROPULSIONE · GUIDA OPERATIVA"
          sectionSubtitle="TABELLE FORME VERBALI E PATTERN FONETICI"
          objective="Padroneggiare i verbi irregolari inglesi raggruppandoli per pattern fonetico (AAA, ABA, ABB, ABC) per una memorizzazione solida ed efficiente."
          methodology={[
            'Filtra per pattern fonetico: il cervello memorizza molto più facilmente gruppi di verbi con identico schema.',
            'Usa il pulsante [3 FORME] per ascoltare in sequenza: Base, Past Simple, Past Participle.',
            'Aggiungi i verbi più difficili alla coda ORBITA SRS per ripeterli a intervalli crescenti.',
          ]}
          controls={[
            { name: 'FILTRO PATTERN', desc: 'Isola i verbi in base alla ripetizione delle forme (AAA, ABA, ABB, ABC).' },
            { name: 'FILTRO LIVELLO', desc: 'Bypass diretto per livello formativo (A1, A2, B1, B2).' },
            { name: '3 FORME AUDIO', desc: 'Riproduce automaticamente tutte e tre le forme in rapida successione.' },
            { name: 'AGGIUNGI A SRS', desc: 'Invia il verbo all\'algoritmo di ripasso spaziato Leitner.' },
          ]}
        />
      </div>

      {/* ── LEVEL SELECTOR & STATUS BADGE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-bg-section p-4 rounded border border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-content/40 uppercase tracking-wider">
            LIVELLO:
          </span>
          <div className="flex items-center gap-1.5">
            {(['tutti', 'A1', 'A2', 'B1', 'B2'] as FilterLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={[
                  'font-mono text-xs px-3 py-1 rounded transition-all duration-150 uppercase',
                  levelFilter === lvl
                    ? 'bg-text-display text-bg-primary font-bold shadow'
                    : 'text-text-content/60 hover:text-text-display border border-border-subtle hover:border-text-display',
                ].join(' ')}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* High contrast status badge */}
        <span className="font-mono text-xs px-3 py-1 rounded bg-signal-ok/15 text-signal-ok border border-signal-ok/40 font-bold tracking-wider">
          STATUS: LIVELLO {levelFilter === 'tutti' ? 'COMPLETO (A1-B2)' : levelFilter}
        </span>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Pattern Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="font-mono text-xs text-text-content/40 uppercase tracking-wider mr-1">
            PATTERN:
          </span>
          {(['tutti', 'AAA', 'ABA', 'ABB', 'ABC'] as FilterPattern[]).map((p) => (
            <button
              key={p}
              onClick={() => setPatternFilter(p)}
              className={[
                'font-mono text-xs px-3 py-1 rounded border transition-all uppercase',
                patternFilter === p
                  ? 'border-text-display text-text-display bg-bg-section font-bold'
                  : 'border-border-subtle text-text-content/40 hover:text-text-display',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-content/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca forma o traduzione..."
            className="w-full bg-bg-section border border-border-subtle rounded px-9 py-2 text-xs font-mono text-text-display outline-none focus:border-text-display"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-content/40 hover:text-text-display"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── VERBS TABLE ── */}
      <div className="bg-bg-section border border-border-subtle rounded-md overflow-x-auto shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b font-mono text-[11px] text-text-content/40 uppercase tracking-widest bg-bg-primary/50" style={{ borderColor: '#3a3a3f' }}>
              <th className="py-3 px-4">BASE</th>
              <th className="py-3 px-4">PAST SIMPLE</th>
              <th className="py-3 px-4">PAST PARTICIPLE</th>
              <th className="py-3 px-4">ITALIANO</th>
              <th className="py-3 px-4">PATTERN</th>
              <th className="py-3 px-4">LIVELLO</th>
              <th className="py-3 px-4 text-right">TELEMETRIA AUDIO</th>
            </tr>
          </thead>
          <tbody>
            {filteredVerbs.map((verb) => (
              <VerbRow
                key={verb.id}
                verb={verb}
                inQueue={srsQueueIds.has(verb.id)}
                onAddToQueue={handleAddToQueue}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-mono text-xs text-text-content/40 mt-4 text-right">
        {filteredVerbs.length} FORME VERBALI DISPONIBILI
      </p>
    </div>
  )
}
