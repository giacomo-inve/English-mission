import Dexie, { type Table } from 'dexie'
import { vocabulary, irregularVerbs } from './seed'

// ─────────────────────────────────────────
// Schema interfaces
// ─────────────────────────────────────────

export interface UserProgress {
  id?: number
  streak: number
  xp: number             // cumulative total XP (all time)
  dailyGoal: number      // XP target per day
  lastActiveDate: string // YYYY-MM-DD
  streakFreeze: number   // shield count
  unlockedLevels?: string[] // ['A1', 'A2', 'B1', 'B2']
  completedUnits?: string[] // unit IDs
  dailyGoalMinutes?: number // 5, 10, 20
  voiceSpeed?: number       // 0.75, 1.0, 1.25
  theme?: 'dark' | 'light'
  has_seen_onboarding?: boolean
}

export interface SRSItem {
  id?: number
  itemId: string
  itemType: 'vocab' | 'verb'
  box: number              // 1–5 (Leitner box)
  nextReviewAt: number     // UTC timestamp ms
  timesCorrect: number
  timesWrong: number
  lastReviewedAt: number   // UTC timestamp ms
}

export interface StreakHistoryEntry {
  date: string          // YYYY-MM-DD — primary key
  xpEarned: number      // XP accumulated on this day
  dailyGoal: number     // goal snapshot on that day
}

// ─────────────────────────────────────────
// Database class
// ─────────────────────────────────────────

class EnglishDB extends Dexie {
  user_progress!: Table<UserProgress>
  srs_items!: Table<SRSItem>
  streak_history!: Table<StreakHistoryEntry>

  constructor() {
    super('EnglishMissionControlDB')

    // v1 — original schema
    this.version(1).stores({
      user_progress: '++id',
      srs_items: '++id, itemId, box, nextReviewAt',
    })

    // v2 — add itemType, lastReviewedAt, streak_history, streakFreeze
    this.version(2)
      .stores({
        user_progress: '++id',
        srs_items: '++id, itemId, itemType, box, nextReviewAt, lastReviewedAt',
        streak_history: 'date',
      })
      .upgrade((tx) =>
        tx
          .table('srs_items')
          .toCollection()
          .modify((item: Record<string, unknown>) => {
            if (item.itemType === undefined) item.itemType = 'vocab'
            if (item.lastReviewedAt === undefined) item.lastReviewedAt = 0
          }),
      )
  }
}

export const db = new EnglishDB()

// ─────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function offsetDay(dateStr: string, delta: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

// ─────────────────────────────────────────
// DB initialisation
// ─────────────────────────────────────────

export async function initDB(): Promise<void> {
  // 1. Ensure a UserProgress row exists
  const count = await db.user_progress.count()
  if (count === 0) {
    await db.user_progress.add({
      streak: 0,
      xp: 0,
      dailyGoal: 20,
      lastActiveDate: '',
      streakFreeze: 1,
      unlockedLevels: ['A1'],
      completedUnits: ['u-a1-1'],
      dailyGoalMinutes: 10,
      voiceSpeed: 1.0,
      theme: 'dark',
    })
  }

  // 2. Migrate old rows: ensure fields exist
  await db.user_progress.toCollection().modify((p) => {
    const record = p as unknown as Record<string, unknown>
    if (record.streakFreeze === undefined) p.streakFreeze = 1
    if (record.unlockedLevels === undefined) p.unlockedLevels = ['A1']
    if (record.completedUnits === undefined) p.completedUnits = ['u-a1-1']
    if (record.dailyGoalMinutes === undefined) p.dailyGoalMinutes = 10
    if (record.voiceSpeed === undefined) p.voiceSpeed = 1.0
    if (record.theme === undefined) p.theme = 'dark'
    if (record.has_seen_onboarding === undefined) p.has_seen_onboarding = false
  })

  // 3. Streak-freeze check on app load
  const progress = await db.user_progress.toCollection().first()
  if (progress?.id != null && progress.streak > 0 && progress.lastActiveDate) {
    const today = todayStr()
    const yesterday = offsetDay(today, -1)
    const twoDaysAgo = offsetDay(today, -2)

    // User was last active 2 days ago → missed exactly yesterday
    if (progress.lastActiveDate === twoDaysAgo && progress.streakFreeze > 0) {
      await db.user_progress.update(progress.id, {
        streakFreeze: progress.streakFreeze - 1,
        lastActiveDate: yesterday, // bridge the gap
      })
    }
  }

  // 4. Seed SRS items for every vocab / verb
  await initSRSItems()
}

// ─────────────────────────────────────────
// Level & Unit helpers
// ─────────────────────────────────────────

export async function unlockLevel(level: string): Promise<void> {
  const p = await db.user_progress.toCollection().first()
  if (!p || p.id == null) return
  const current = new Set(p.unlockedLevels ?? ['A1'])
  current.add(level)
  await db.user_progress.update(p.id, {
    unlockedLevels: Array.from(current),
  })
}

export async function completeUnit(unitId: string): Promise<void> {
  const p = await db.user_progress.toCollection().first()
  if (!p || p.id == null) return
  const current = new Set(p.completedUnits ?? [])
  current.add(unitId)
  await db.user_progress.update(p.id, {
    completedUnits: Array.from(current),
  })
}

export async function setOnboardingSeen(seen = true): Promise<void> {
  const p = await db.user_progress.toCollection().first()
  if (!p || p.id == null) return
  await db.user_progress.update(p.id, {
    has_seen_onboarding: seen,
  })
}

// ─────────────────────────────────────────
// SRS item seeding
// ─────────────────────────────────────────

export async function initSRSItems(): Promise<void> {
  const existing = await db.srs_items.toArray()
  const existingIds = new Set(existing.map((e) => e.itemId))

  const toAdd: Omit<SRSItem, 'id'>[] = []

  for (const v of vocabulary) {
    if (!existingIds.has(v.id)) {
      toAdd.push({
        itemId: v.id,
        itemType: 'vocab',
        box: 1,
        nextReviewAt: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
        lastReviewedAt: 0,
      })
    }
  }

  for (const vb of irregularVerbs) {
    if (!existingIds.has(vb.id)) {
      toAdd.push({
        itemId: vb.id,
        itemType: 'verb',
        box: 1,
        nextReviewAt: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
        lastReviewedAt: 0,
      })
    }
  }

  if (toAdd.length > 0) await db.srs_items.bulkAdd(toAdd)
}
