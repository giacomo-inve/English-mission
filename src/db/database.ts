import Dexie, { type Table } from 'dexie'
import { vocabulary, irregularVerbs } from './seed'

// ─────────────────────────────────────────
// Schema interfaces
// ─────────────────────────────────────────

export interface UserProgress {
  id?: number
  pilotName?: string
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
  fontSize?: 'standard' | 'large' | 'extra'
  has_seen_onboarding?: boolean
  speaking_level?: string
  listening_level?: string
  writing_level?: string
  vocab_level?: string
  verbs_level?: string
  completed_exercise_ids?: string[]
}

export interface SectionLevelEntry {
  section: string // 'speaking_level' | 'listening_level' | 'writing_level' | 'vocab_level' | 'verbs_level'
  level: string   // 'A1' | 'A2' | 'B1' | 'B2'
  updatedAt: number
}

export interface CompletedExerciseEntry {
  id: string
  section: string
  completedAt: number
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
  section_levels!: Table<SectionLevelEntry>
  completed_exercises!: Table<CompletedExerciseEntry>

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

    // v3 — section_levels store, completed_exercises store, bypass levels
    this.version(3).stores({
      user_progress: '++id',
      srs_items: '++id, itemId, itemType, box, nextReviewAt, lastReviewedAt',
      streak_history: 'date',
      section_levels: 'section',
      completed_exercises: 'id, section',
    })
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
      pilotName: 'Commander Giacomo',
      streak: 0,
      xp: 0,
      dailyGoal: 20,
      lastActiveDate: '',
      streakFreeze: 1,
      unlockedLevels: ['A1', 'A2', 'B1', 'B2'],
      completedUnits: ['u-a1-1'],
      dailyGoalMinutes: 10,
      voiceSpeed: 1.0,
      theme: 'dark',
      fontSize: 'standard',
      speaking_level: 'A1',
      listening_level: 'A1',
      writing_level: 'A1',
      vocab_level: 'A1',
      verbs_level: 'A1',
      completed_exercise_ids: [],
    })
  }

  // 2. Migrate old rows: ensure fields exist
  await db.user_progress.toCollection().modify((p) => {
    const record = p as unknown as Record<string, unknown>
    if (record.pilotName === undefined) p.pilotName = 'Commander Giacomo'
    const unlocked = record.unlockedLevels as string[] | undefined
    if (!unlocked || unlocked.length < 4) {
      p.unlockedLevels = ['A1', 'A2', 'B1', 'B2']
    }
    if (record.completedUnits === undefined) p.completedUnits = ['u-a1-1']
    if (record.dailyGoalMinutes === undefined) p.dailyGoalMinutes = 10
    if (record.voiceSpeed === undefined) p.voiceSpeed = 1.0
    if (record.theme === undefined) p.theme = 'dark'
    if (record.fontSize === undefined) p.fontSize = 'standard'
    if (record.has_seen_onboarding === undefined) p.has_seen_onboarding = false
    if (record.speaking_level === undefined) p.speaking_level = 'A1'
    if (record.listening_level === undefined) p.listening_level = 'A1'
    if (record.writing_level === undefined) p.writing_level = 'A1'
    if (record.vocab_level === undefined) p.vocab_level = 'A1'
    if (record.verbs_level === undefined) p.verbs_level = 'A1'
    if (record.completed_exercise_ids === undefined) p.completed_exercise_ids = []
  })

  // 3. Populate default section_levels if empty
  const defaultSections = ['speaking_level', 'listening_level', 'writing_level', 'vocab_level', 'verbs_level']
  for (const sec of defaultSections) {
    const existing = await db.section_levels.get(sec)
    if (!existing) {
      await db.section_levels.put({ section: sec, level: 'A1', updatedAt: Date.now() })
    }
  }

  // 4. Streak-freeze check on app load
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

  // 5. Seed SRS items for every vocab / verb
  await initSRSItems()
}

// ─────────────────────────────────────────
// Level & Unit helpers
// ─────────────────────────────────────────

export async function unlockLevel(level: string): Promise<void> {
  const p = await db.user_progress.toCollection().first()
  if (!p || p.id == null) return
  const current = new Set(p.unlockedLevels ?? ['A1', 'A2', 'B1', 'B2'])
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
// Section Levels Helpers
// ─────────────────────────────────────────

export async function getSectionLevel(section: string, fallback = 'A1'): Promise<string> {
  const key = section.endsWith('_level') ? section : `${section}_level`
  const item = await db.section_levels.get(key)
  if (item) return item.level

  const p = await db.user_progress.toCollection().first()
  if (p) {
    const fromP = (p as unknown as Record<string, unknown>)[key]
    if (typeof fromP === 'string') return fromP
  }
  return fallback
}

export async function setSectionLevel(section: string, level: string): Promise<void> {
  const key = section.endsWith('_level') ? section : `${section}_level`
  await db.section_levels.put({ section: key, level, updatedAt: Date.now() })

  const p = await db.user_progress.toCollection().first()
  if (p && p.id != null) {
    await db.user_progress.update(p.id, { [key]: level })
  }
}

// ─────────────────────────────────────────
// Completed Exercises Helpers
// ─────────────────────────────────────────

export async function markExerciseCompleted(id: string, section = 'general'): Promise<void> {
  await db.completed_exercises.put({
    id,
    section,
    completedAt: Date.now(),
  })

  const p = await db.user_progress.toCollection().first()
  if (p && p.id != null) {
    const list = new Set(p.completed_exercise_ids ?? [])
    list.add(id)
    await db.user_progress.update(p.id, {
      completed_exercise_ids: Array.from(list),
    })
  }
}

export async function getCompletedExerciseIds(): Promise<string[]> {
  const all = await db.completed_exercises.toArray()
  if (all.length > 0) return all.map((e) => e.id)

  const p = await db.user_progress.toCollection().first()
  return p?.completed_exercise_ids ?? []
}

export async function isExerciseCompleted(id: string): Promise<boolean> {
  const found = await db.completed_exercises.get(id)
  if (found) return true

  const p = await db.user_progress.toCollection().first()
  return !!p?.completed_exercise_ids?.includes(id)
}

// ─────────────────────────────────────────
// Pilot Name & Font Preferences
// ─────────────────────────────────────────

export async function getPilotName(): Promise<string> {
  const p = await db.user_progress.toCollection().first()
  return p?.pilotName || localStorage.getItem('emc-pilot-name') || 'Commander Giacomo'
}

export async function setPilotName(name: string): Promise<void> {
  localStorage.setItem('emc-pilot-name', name)
  const p = await db.user_progress.toCollection().first()
  if (p && p.id != null) {
    await db.user_progress.update(p.id, { pilotName: name })
  }
}

export async function setFontSizePreference(size: 'standard' | 'large' | 'extra'): Promise<void> {
  localStorage.setItem('emc-font-size', size)
  document.documentElement.setAttribute('data-font-size', size)
  const p = await db.user_progress.toCollection().first()
  if (p && p.id != null) {
    await db.user_progress.update(p.id, { fontSize: size })
  }
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
