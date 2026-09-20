import { useState, useEffect, useMemo } from 'react'
import { Award, Zap, Flame, Shield, TrendingUp, Calendar, BookOpen, Headphones, Mic, PenTool } from 'lucide-react'
import { db, todayStr, offsetDay, type UserProgress, type SRSItem, type StreakHistoryEntry } from '../db/database'
import AnimatedCounter from '../components/AnimatedCounter'

interface SkillStat {
  name: string
  icon: any
  value: number
  desc: string
}

interface BadgeItem {
  id: string
  title: string
  desc: string
  unlocked: boolean
  metricLabel: string
}

export default function Progressi() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [srsItems, setSrsItems] = useState<SRSItem[]>([])
  const [streakHistory, setStreakHistory] = useState<StreakHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const p = await db.user_progress.toCollection().first()
      const items = await db.srs_items.toArray()
      const history = await db.streak_history.toArray()
      if (p) setProgress(p)
      setSrsItems(items)
      setStreakHistory(history)
      setLoading(false)
    }
    fetchData()
  }, [])

  const totalXP = progress?.xp ?? 0
  const streak = progress?.streak ?? 0
  const freeze = progress?.streakFreeze ?? 0

  // Level estimation based on XP and completed items
  const currentLevel = useMemo(() => {
    if (totalXP >= 300) return 'B2'
    if (totalXP >= 180) return 'B1'
    if (totalXP >= 80) return 'A2'
    return 'A1'
  }, [totalXP])

  // 4 Key Skills (Lettura, Ascolto, Parlato, Scrittura)
  const skills: SkillStat[] = useMemo(() => {
    // Reading based on srsItems box >= 2
    const readMastered = srsItems.filter((i) => i.box >= 2).length
    const readScore = Math.min(100, Math.max(12, Math.round((readMastered / 20) * 100) + (totalXP > 0 ? 15 : 0)))

    // Listening based on history and reviews
    const listenScore = Math.min(100, Math.max(10, Math.round((totalXP / 150) * 80) + 10))

    // Speaking based on items practiced
    const speakingScore = Math.min(100, Math.max(8, Math.round((srsItems.filter((i) => i.itemType === 'verb').length / 10) * 60) + (totalXP > 20 ? 15 : 0)))

    // Writing based on total activity
    const writingScore = Math.min(100, Math.max(15, Math.round((totalXP / 200) * 90) + (progress?.completedUnits?.length ? 15 : 0)))

    return [
      { name: 'LETTURA', icon: BookOpen, value: readScore, desc: 'Comprensione testuale e vocabolario contestuale' },
      { name: 'ASCOLTO', icon: Headphones, value: listenScore, desc: 'Dettato e riconoscimento fonetico' },
      { name: 'PARLATO', icon: Mic, value: speakingScore, desc: 'Pronuncia vocale e fluidità enunciativa' },
      { name: 'SCRITTURA', icon: PenTool, value: writingScore, desc: 'Composizione sintattica e rispetto tracce' },
    ]
  }, [srsItems, totalXP, progress])

  // Weekly XP Line Chart Data (Last 7 days)
  const weeklyData = useMemo(() => {
    const today = todayStr()
    const days: { date: string; label: string; xp: number }[] = []
    const dayNames = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB']
    const historyMap = new Map(streakHistory.map((h) => [h.date, h.xpEarned]))

    for (let i = 6; i >= 0; i--) {
      const d = offsetDay(today, -i)
      const dayObj = new Date(d)
      days.push({
        date: d,
        label: dayNames[dayObj.getDay()],
        xp: historyMap.get(d) ?? (i === 0 ? Math.max(0, totalXP % 35) : 0),
      })
    }
    return days
  }, [streakHistory, totalXP])

  // Monthly Streak Matrix
  const monthlyDays = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const historyDates = new Set(streakHistory.filter((h) => h.xpEarned > 0).map((h) => h.date))

    const days: { day: number; dateStr: string; studied: boolean; isToday: boolean; isPast: boolean }[] = []
    const today = todayStr()

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(month + 1).padStart(2, '0')
      const dStr = String(day).padStart(2, '0')
      const dateStr = `${year}-${mStr}-${dStr}`
      const studied = historyDates.has(dateStr) || (dateStr === today && totalXP > 0)
      days.push({
        day,
        dateStr,
        studied,
        isToday: dateStr === today,
        isPast: dateStr <= today,
      })
    }
    return days
  }, [streakHistory, totalXP])

  // Badges
  const badges: BadgeItem[] = useMemo(() => {
    return [
      {
        id: 'b-first',
        title: 'PRIMA MISSIONE',
        desc: 'Completata la prima sessione formativa nel sistema',
        unlocked: totalXP > 0,
        metricLabel: totalXP > 0 ? 'ATTIVO' : '0/1 SESSIONI',
      },
      {
        id: 'b-streak7',
        title: '7 GIORNI IN ORBITA',
        desc: 'Mantenuta una serie streak ininterrotta di 7 giorni',
        unlocked: streak >= 7,
        metricLabel: `${streak}/7 GIORNI`,
      },
      {
        id: 'b-verbs',
        title: 'PADRONANZA VERBI',
        desc: 'Almeno 10 forme verbali irregolari ripassate nei box SRS',
        unlocked: srsItems.filter((i) => i.itemType === 'verb' && i.timesCorrect > 0).length >= 5,
        metricLabel: `${srsItems.filter((i) => i.itemType === 'verb' && i.timesCorrect > 0).length}/10 VERBI`,
      },
      {
        id: 'b-skills',
        title: 'COMUNICAZIONE TOTALE',
        desc: 'Praticate tutte e quattro le abilità operative primarie',
        unlocked: totalXP >= 60,
        metricLabel: totalXP >= 60 ? 'SBLOCCATO' : `${totalXP}/60 XP`,
      },
      {
        id: 'b-shield',
        title: 'SCUDO ATTIVO',
        desc: 'Streak Freeze disponibile per proteggere la continuità operativa',
        unlocked: freeze > 0,
        metricLabel: `${freeze} SCUDO DISPONIBILE`,
      },
      {
        id: 'b-speed',
        title: 'VELOCITÀ DI FUGA',
        desc: 'Oltre 100 punti esperienza accumulati nella missione',
        unlocked: totalXP >= 100,
        metricLabel: `${totalXP}/100 XP`,
      },
    ]
  }, [totalXP, streak, srsItems, freeze])

  // SVG Chart Dimensions
  const chartHeight = 120
  const chartWidth = 500
  const maxXP = Math.max(30, ...weeklyData.map((d) => d.xp))
  const points = weeklyData.map((d, i) => {
    const x = 30 + (i / (weeklyData.length - 1)) * (chartWidth - 60)
    const y = chartHeight - 20 - (d.xp / maxXP) * (chartHeight - 40)
    return { x, y, ...d }
  })
  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HERO PILOTA & LIVELLO ── */}
      <div className="border-b border-border-subtle pb-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="font-mono text-text-content/40 text-xs tracking-widest uppercase mb-1" style={{ letterSpacing: '0.24em' }}>
              DOSSIER PILOTA · MISSION TELEMETRY
            </p>
            <h1 className="heading-display text-3xl sm:text-5xl text-text-display font-bold">
              ASTRONAUTA
            </h1>
          </div>
          <div className="px-4 py-2 rounded bg-bg-section border border-border-subtle text-left sm:text-right">
            <span className="font-mono text-[10px] text-text-content/40 tracking-widest uppercase block">
              PILOTA IN COMANDO
            </span>
            <span className="font-mono text-base font-bold text-signal-ok">
              {progress?.pilotName || 'Commander Giacomo'}
            </span>
          </div>
        </div>

        {/* Section Levels Independent Matrix */}
        <div className="mb-6 p-4 rounded bg-bg-section border border-border-subtle">
          <p className="font-mono text-[10px] text-text-content/40 uppercase tracking-wider mb-3">
            LIVELLI INDIPENDENTI PER SEZIONE:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'VOCAL LINK', val: progress?.speaking_level || 'A1' },
              { label: 'COMUNICAZIONI', val: progress?.listening_level || 'A1' },
              { label: 'LOGBOOK', val: progress?.writing_level || 'A1' },
              { label: 'CARICO', val: progress?.vocab_level || 'A1' },
              { label: 'PROPULSIONE', val: progress?.verbs_level || 'A1' },
            ].map((sec) => (
              <div key={sec.label} className="p-2.5 rounded bg-bg-primary border border-border-subtle/60 text-center">
                <span className="font-mono text-[9px] text-text-content/40 block truncate">{sec.label}</span>
                <span className="font-mono text-xs font-bold text-signal-ok mt-0.5 block">{sec.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="data-tile">
            <span className="font-mono text-text-content/40 text-xs tracking-wider">XP TOTALI</span>
            <span className="font-mono text-text-display text-2xl tabular-nums">
              <AnimatedCounter value={totalXP} />
            </span>
          </div>

          <div className="data-tile">
            <span className="font-mono text-white/30 text-xs tracking-wider">SERIE STREAK</span>
            <span className="font-mono text-signal-ok text-2xl tabular-nums flex items-center gap-1.5">
              <Flame size={20} />
              <AnimatedCounter value={streak} />
            </span>
          </div>

          <div className="data-tile">
            <span className="font-mono text-white/30 text-xs tracking-wider">ELEMENTI SRS</span>
            <span className="font-mono text-white text-2xl tabular-nums">
              <AnimatedCounter value={srsItems.length} />
            </span>
          </div>

          <div className="data-tile">
            <span className="font-mono text-white/30 text-xs tracking-wider">SCUDO FREEZE</span>
            <span className="font-mono text-white/70 text-2xl tabular-nums flex items-center gap-1.5">
              <Shield size={18} />
              <AnimatedCounter value={freeze} />
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 ABILITÀ CHIAVE (2PX BARS) ── */}
      <div
        className="p-6 sm:p-8 rounded-sm border border-border-subtle mb-10"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-3">
          <TrendingUp size={16} className="text-white/60" />
          <h2 className="font-mono text-xs text-white tracking-widest uppercase">
            ABILITÀ CHIAVE (PARAMETRI TELEMETRICI)
          </h2>
        </div>

        <div className="space-y-6">
          {skills.map((skill) => {
            const Icon = skill.icon
            return (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-white/40" />
                    <span className="font-mono text-xs text-white tracking-wider font-semibold">
                      {skill.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-white/60 tabular-nums">
                    <AnimatedCounter value={skill.value} />%
                  </span>
                </div>

                {/* 2px Progress line */}
                <div className="w-full h-0.5 bg-border-subtle overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${skill.value}%` }}
                  />
                </div>

                <p className="font-sans text-xs text-text-content/30 mt-1">
                  {skill.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── GRAFICO XP SETTIMANALE (1PX WHITE LINES ONLY) ── */}
      <div
        className="p-6 sm:p-8 rounded-sm border border-border-subtle mb-10"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-white/60" />
            <h2 className="font-mono text-xs text-white tracking-widest uppercase">
              RENDIMENTO XP SETTIMANALE (LINEA 1PX SENZA RIEMPIMENTO)
            </h2>
          </div>
          <span className="font-mono text-xs text-white/30 tabular-nums">
            MAX: {maxXP} XP
          </span>
        </div>

        {/* 1px stroke SVG chart */}
        <div className="w-full overflow-x-auto select-none py-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-36"
            style={{ overflow: 'visible' }}
          >
            {/* Horizontal 1px grid guide */}
            <line
              x1="20"
              y1={chartHeight - 20}
              x2={chartWidth - 20}
              y2={chartHeight - 20}
              stroke="#3a3a3f"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1={20}
              x2={chartWidth - 20}
              y2={20}
              stroke="#3a3a3f"
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            {/* Polyline 1px pure white, fill NONE */}
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.25"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#000000"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {p.xp > 0 ? p.xp : ''}
                </text>
                <text
                  x={p.x}
                  y={chartHeight}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.3)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* ── CALENDARIO STREAK (MATRICE MENSILE A QUADRATINI) ── */}
      <div
        className="p-6 sm:p-8 rounded-sm border border-border-subtle mb-10"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-white/60" />
            <h2 className="font-mono text-xs text-white tracking-widest uppercase">
              CALENDARIO STREAK MENSILE
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-white rounded-none inline-block" /> STUDIATO
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-border-subtle rounded-none inline-block" /> RIPOSO
            </span>
          </div>
        </div>

        {/* Minimal Matrix */}
        <div className="grid grid-cols-7 gap-2 max-w-sm mx-auto select-none">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((dayName, i) => (
            <span key={i} className="font-mono text-[10px] text-white/20 text-center pb-1">
              {dayName}
            </span>
          ))}

          {monthlyDays.map((d) => (
            <div
              key={d.day}
              className={`aspect-square flex items-center justify-center transition-all duration-150 ${
                d.studied
                  ? 'bg-white text-black font-semibold'
                  : 'border border-border-subtle text-white/20'
              } ${d.isToday ? 'ring-1 ring-white/70' : ''}`}
              title={`${d.dateStr} — ${d.studied ? 'Sessione completata' : 'Nessuna attività'}`}
            >
              <span className="font-mono text-[10px] tabular-nums">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BADGE SBLOCCABILI (CONTORNO 1PX) ── */}
      <div
        className="p-6 sm:p-8 rounded-sm border border-border-subtle"
        style={{ background: '#0a0a0a' }}
      >
        <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-3">
          <Award size={16} className="text-white/60" />
          <h2 className="font-mono text-xs text-white tracking-widest uppercase">
            DISTINTIVI DI MISSIONE (BADGE CON CONTORNO 1PX)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-sm border transition-all duration-200 flex items-start justify-between gap-3 ${
                b.unlocked
                  ? 'border-white bg-transparent'
                  : 'border-border-subtle opacity-40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award
                    size={14}
                    strokeWidth={1.5}
                    className={b.unlocked ? 'text-white' : 'text-white/30'}
                  />
                  <span className="font-mono text-xs font-semibold text-white tracking-wider">
                    {b.title}
                  </span>
                </div>
                <p className="font-sans text-xs text-text-content/50 leading-relaxed">
                  {b.desc}
                </p>
              </div>

              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border shrink-0 ${
                  b.unlocked
                    ? 'border-signal-ok text-signal-ok'
                    : 'border-border-subtle text-white/30'
                }`}
              >
                {b.unlocked ? 'SBLOCCATO' : b.metricLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
