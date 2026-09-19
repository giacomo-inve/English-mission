import { useState, useMemo, useEffect, useCallback } from 'react'
import { Volume2, Plus, Check, Search, X } from 'lucide-react'
import { irregularVerbs, type IrregularPattern, type IrregularVerb } from '../db/seed'
import { db } from '../db/database'

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

  const forms = [verb.base, verb.past, verb.pastParticiple]
  let i = 0

  const sayNext = () => {
    if (i >= forms.length) return
    const utt = new SpeechSynthesisUtterance(forms[i])
    utt.lang = 'en-GB'
    utt.rate = 0.82
    utt.onend = () => {
      i++
      setTimeout(sayNext, 350)
    }
    window.speechSynthesis.speak(utt)
    i++
    // Note: onend fires after utt ends, so we don't increment here
  }

  // Reset and queue
  i = 0
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
type FilterLevel  = 'tutti' | 'A1' | 'A2' | 'B1'

const PATTERN_META: Record<IrregularPattern, { desc: string; color: string; example: string }> = {
  AAA: { desc: 'Base = Past = Past Participle',         color: '#3DDC84', example: 'cut · cut · cut' },
  ABA: { desc: 'Base = Past Participle ≠ Past',         color: '#a78bfa', example: 'come · came · come' },
  ABB: { desc: 'Past = Past Participle ≠ Base',         color: '#64748b', example: 'buy · bought · bought' },
  ABC: { desc: 'All three forms are different',         color: '#FF5C5C', example: 'go · went · gone' },
}

// ─────────────────────────────────────────
// Pattern badge
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// SRS row action
// ─────────────────────────────────────────

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
          : 'border-border-subtle text-white/40 hover:border-white/50 hover:text-white/80',
      ].join(' ')}
      style={{ letterSpacing: '0.12em' }}
    >
      <Plus size={11} strokeWidth={2.5} /> AGGIUNGI
    </button>
  )
}

// ─────────────────────────────────────────
// Table row
// ─────────────────────────────────────────

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
      className="group border-b"
      style={{ borderColor: '#3a3a3f', height: '56px' }}
    >
      {/* INFINITIVE */}
      <td className="px-4 py-0">
        <div className="flex items-center gap-2">
          <span className="text-text-display font-sans text-base">{verb.base}</span>
          <button
            onClick={() => speakForms(verb)}
            className="text-white/20 hover:text-white/70 transition-colors shrink-0"
            aria-label={`Pronuncia ${verb.base}, ${verb.past}, ${verb.pastParticiple}`}
            title="Ascolta le tre forme"
          >
            <Volume2 size={14} strokeWidth={1.5} />
          </button>
        </div>
      </td>

      {/* PAST SIMPLE */}
      <td className="px-4 py-0">
        <span className="text-text-content/75 font-sans text-sm">{verb.past}</span>
      </td>

      {/* PAST PARTICIPLE */}
      <td className="px-4 py-0">
        <span className="text-text-content/75 font-sans text-sm">{verb.pastParticiple}</span>
      </td>

      {/* TRADUZIONE */}
      <td className="px-4 py-0 hidden md:table-cell">
        <span className="text-white/40 text-sm">{verb.translation}</span>
      </td>

      {/* LIVELLO */}
      <td className="px-4 py-0 hidden lg:table-cell">
        <span className="font-mono text-white/25 text-xs">{verb.level}</span>
      </td>

      {/* PATTERN */}
      <td className="px-4 py-0">
        <PatternBadge pattern={verb.pattern} />
      </td>

      {/* AZIONE */}
      <td className="px-4 py-0">
        <SRSButton
          verbId={verb.id}
          inQueue={inQueue}
          onAdd={() => onAddToQueue(verb.id)}
        />
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────

export default function Verbs() {
  const [search, setSearch]       = useState('')
  const [pattern, setPattern]     = useState<FilterPattern>('tutti')
  const [level, setLevel]         = useState<FilterLevel>('tutti')
  const [inQueue, setInQueue]     = useState<Set<string>>(new Set())
  const [addedAll, setAddedAll]   = useState(false)

  // Load existing SRS items for verbs
  useEffect(() => {
    db.srs_items.where('itemType').equals('verb').toArray().then((items) => {
      setInQueue(new Set(items.map((i) => i.itemId)))
    })
  }, [])

  const addToQueue = useCallback(async (verbId: string) => {
    if (inQueue.has(verbId)) return
    const existing = await db.srs_items.where('itemId').equals(verbId).first()
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
    } else if (existing.id != null) {
      await db.srs_items.update(existing.id, { nextReviewAt: Date.now() })
    }
    setInQueue((prev) => new Set([...prev, verbId]))
  }, [inQueue])

  const addAllFiltered = useCallback(async () => {
    for (const verb of filtered) {
      await addToQueue(verb.id)
    }
    setAddedAll(true)
    setTimeout(() => setAddedAll(false), 2000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToQueue, search, pattern, level])

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return irregularVerbs.filter((v) => {
      const matchesSearch = !q || [v.base, v.past, v.pastParticiple, v.translation].some((s) => s.toLowerCase().includes(q))
      const matchesPattern = pattern === 'tutti' || v.pattern === pattern
      const matchesLevel = level === 'tutti' || v.level === level
      return matchesSearch && matchesPattern && matchesLevel
    })
  }, [search, pattern, level])

  const PATTERNS: FilterPattern[] = ['tutti', 'AAA', 'ABA', 'ABB', 'ABC']
  const LEVELS:   FilterLevel[]   = ['tutti', 'A1', 'A2', 'B1']

  return (
    <div className="px-0 sm:px-0">

      {/* ── STICKY TOP BAR ── */}
      <div
        className="sticky z-20 px-6 py-4 space-y-4"
        style={{
          top: '3.5rem',
          background: 'rgba(0,0,0,0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #3a3a3f',
        }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-white/25 text-xs" style={{ letterSpacing: '0.2em' }}>
              VERBI · A1–B1 · {filtered.length}/{irregularVerbs.length}
            </p>
            <h1 className="heading-display text-2xl sm:text-3xl">VERBI IRREGOLARI</h1>
          </div>
          <button
            onClick={addAllFiltered}
            className={[
              'font-mono text-xs px-4 py-2 rounded-pill border transition-all duration-200 hidden sm:inline-flex items-center gap-2',
              addedAll
                ? 'border-signal-ok text-signal-ok'
                : 'border-border-subtle text-white/40 hover:border-white/50 hover:text-white',
            ].join(' ')}
            style={{ letterSpacing: '0.12em' }}
          >
            {addedAll ? <><Check size={12} /> AGGIUNTI</> : <><Plus size={12} /> AGGIUNGI TUTTI</>}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per infinito, passato, traduzione…"
            className="w-full font-mono text-xs text-text-content placeholder:text-white/20"
            style={{
              background: 'transparent',
              border: '1px solid #3a3a3f',
              borderRadius: '4px',
              padding: '8px 32px 8px 32px',
              outline: 'none',
              letterSpacing: '0.04em',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.3)')}
            onBlur={(e) => (e.target.style.borderColor = '#3a3a3f')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Pattern filters with descriptive label */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-white/35 text-xs tracking-wider shrink-0 mr-1"
              style={{ letterSpacing: '0.14em' }}
            >
              PATTERN FONETICO:
            </span>

            {PATTERNS.map((p) => {
              const meta = p !== 'tutti' ? PATTERN_META[p] : null
              return (
                <button
                  key={p}
                  onClick={() => setPattern(p)}
                  className={[
                    'font-mono text-xs px-3 py-1.5 rounded-pill border transition-all duration-150',
                    pattern === p
                      ? 'bg-white text-black border-white'
                      : 'border-border-subtle text-white/40 hover:border-white/40 hover:text-white/70',
                  ].join(' ')}
                  style={{ letterSpacing: '0.12em' }}
                  title={meta ? `${meta.desc} — es. ${meta.example}` : undefined}
                >
                  {p === 'tutti' ? 'TUTTI' : (
                    <span>
                      {p}
                      <span className="hidden sm:inline text-white/40 font-normal ml-1.5">({meta?.example.split(' · ')[0]})</span>
                    </span>
                  )}
                </button>
              )
            })}

            {/* Divider */}
            <span className="border-l border-border-subtle mx-1 h-4" />

            {/* Level filters */}
            <span
              className="font-mono text-white/35 text-xs tracking-wider shrink-0 mr-1 hidden sm:inline"
              style={{ letterSpacing: '0.14em' }}
            >
              LIVELLO:
            </span>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={[
                  'font-mono text-xs px-3 py-1.5 rounded-pill border transition-all duration-150',
                  level === l
                    ? 'bg-white text-black border-white'
                    : 'border-border-subtle text-white/40 hover:border-white/40 hover:text-white/70',
                ].join(' ')}
                style={{ letterSpacing: '0.12em' }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Contextual Micro-guide inline hint */}
          <div className="font-mono text-xs text-white/40 flex flex-wrap items-center gap-2 pt-1 border-t border-border-subtle/40">
            <span className="text-signal-ok text-[11px] font-semibold tracking-wider">
              GUIDA COGNITIVA:
            </span>
            {pattern === 'tutti' ? (
              <span>
                Studio per rima e pattern fonetico (AAA, ABA, ABB, ABC) per eliminare l'interferenza mnemonica delle liste alfabetiche.
              </span>
            ) : (
              <span>
                <strong className="text-white font-semibold">{pattern}:</strong> {PATTERN_META[pattern].desc} &nbsp;·&nbsp; Modello paradigmatico: <em>{PATTERN_META[pattern].example}</em>.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Sticky headers */}
          <thead>
            <tr style={{ background: '#000', borderBottom: '1px solid #3a3a3f' }}>
              {[
                { label: 'INFINITIVE',       cls: 'w-32 pl-4' },
                { label: 'PAST SIMPLE',       cls: 'w-32 pl-4' },
                { label: 'PAST PARTICIPLE',   cls: 'w-36 pl-4' },
                { label: 'TRADUZIONE',        cls: 'w-40 pl-4 hidden md:table-cell' },
                { label: 'LV.',              cls: 'w-12 pl-4 hidden lg:table-cell' },
                { label: 'PAT.',             cls: 'w-16 pl-4' },
                { label: 'AZIONE',           cls: 'pl-4 pr-6' },
              ].map(({ label, cls }) => (
                <th
                  key={label}
                  className={`py-3 text-left font-mono text-white/25 text-xs ${cls}`}
                  style={{ letterSpacing: '0.14em' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="font-mono text-white/20 text-sm">Nessun verbo trovato per questa ricerca.</p>
                </td>
              </tr>
            ) : (
              filtered.map((verb) => (
                <VerbRow
                  key={verb.id}
                  verb={verb}
                  inQueue={inQueue.has(verb.id)}
                  onAddToQueue={addToQueue}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  )
}
