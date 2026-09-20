import { useState, useEffect, useCallback } from 'react'
import {
  db,
  type UserProgress,
  todayStr,
  offsetDay,
  setPilotName as dbSetPilotName,
  setSectionLevel as dbSetSectionLevel,
  markExerciseCompleted as dbMarkExerciseCompleted,
  setFontSizePreference as dbSetFontSizePreference,
} from '../db/database'

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

    // Fetch section levels
    const sLevels = await db.section_levels.toArray()
    const levelMap: Record<string, string> = {}
    sLevels.forEach((sl) => {
      levelMap[sl.section] = sl.level
    })

    // Fetch completed exercise ids
    const comp = await db.completed_exercises.toArray()
    const completedIds = comp.length > 0 ? comp.map((c) => c.id) : p.completed_exercise_ids ?? []

    setProgress({
      ...p,
      pilotName: p.pilotName || localStorage.getItem('emc-pilot-name') || 'Commander Giacomo',
      speaking_level: levelMap['speaking_level'] || p.speaking_level || 'A1',
      listening_level: levelMap['listening_level'] || p.listening_level || 'A1',
      writing_level: levelMap['writing_level'] || p.writing_level || 'A1',
      vocab_level: levelMap['vocab_level'] || p.vocab_level || 'A1',
      verbs_level: levelMap['verbs_level'] || p.verbs_level || 'A1',
      completed_exercise_ids: completedIds,
      todayXP,
      sevenDayTicks,
    })
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

  // ── Pilot name updater ──────────────────────────────
  async function updatePilotName(name: string): Promise<void> {
    await dbSetPilotName(name)
    await load()
  }

  // ── Section level updater ───────────────────────────
  async function updateSectionLevel(section: string, level: string): Promise<void> {
    await dbSetSectionLevel(section, level)
    await load()
  }

  // ── Mark exercise completed ─────────────────────────
  async function markCompleted(exerciseId: string, section = 'general'): Promise<void> {
    await dbMarkExerciseCompleted(exerciseId, section)
    await load()
  }

  // ── Set font size preference ────────────────────────
  async function updateFontSize(size: 'standard' | 'large' | 'extra'): Promise<void> {
    await dbSetFontSizePreference(size)
    await load()
  }

  return {
    progress,
    loading,
    addXP,
    reload: load,
    updatePilotName,
    updateSectionLevel,
    markCompleted,
    updateFontSize,
  }
}
