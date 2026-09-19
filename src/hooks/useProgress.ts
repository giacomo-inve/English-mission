import { useState, useEffect, useCallback } from 'react'
import { db, type UserProgress, todayStr, offsetDay } from '../db/database'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface ProgressState extends UserProgress {
  todayXP: number          // XP earned today (resets daily)
  sevenDayTicks: boolean[] // [0] = 6 days ago, [6] = today
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const p = await db.user_progress.toCollection().first()
    if (!p) { setLoading(false); return }

    const today = todayStr()

    // Build the last-7-days window (oldest → newest)
    const days: string[] = []
    for (let i = 6; i >= 0; i--) {
      days.push(offsetDay(today, -i))
    }

    // Fetch streak_history entries for those 7 days
    const entries = await db.streak_history.where('date').anyOf(days).toArray()
    const entryMap = new Map(entries.map((e) => [e.date, e]))

    // A tick is "filled" if xpEarned >= dailyGoal on that day
    const sevenDayTicks = days.map((d) => {
      const entry = entryMap.get(d)
      return !!entry && entry.xpEarned >= entry.dailyGoal
    })

    // Today's XP
    const todayEntry = entryMap.get(today)
    const todayXP = todayEntry?.xpEarned ?? 0

    setProgress({ ...p, todayXP, sevenDayTicks })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Add XP and update streak ─────────────────────────
  async function addXP(amount: number): Promise<void> {
    const p = await db.user_progress.toCollection().first()
    if (!p || p.id == null) return

    const today = todayStr()
    const yesterday = offsetDay(today, -1)

    // Compute new streak value
    let newStreak = p.streak
    if (p.lastActiveDate === today) {
      // Same day — no streak change
    } else if (p.lastActiveDate === yesterday) {
      // Consecutive — extend
      newStreak = p.streak + 1
    } else if (!p.lastActiveDate) {
      // First session ever
      newStreak = 1
    } else {
      // Gap — streak already bridged by freeze in initDB, or reset
      newStreak = 1
    }

    const newTotalXP = p.xp + amount

    // Update user_progress
    await db.user_progress.update(p.id, {
      xp: newTotalXP,
      streak: newStreak,
      lastActiveDate: today,
    })

    // Accumulate today's XP in streak_history
    const existing = await db.streak_history.get(today)
    await db.streak_history.put({
      date: today,
      xpEarned: (existing?.xpEarned ?? 0) + amount,
      dailyGoal: p.dailyGoal,
    })

    await load()
  }

  return { progress, loading, addXP, reload: load }
}
