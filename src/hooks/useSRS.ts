import { useState, useCallback } from 'react'
import { db, type SRSItem } from '../db/database'

// ─────────────────────────────────────────
// Leitner + SM-2 simplified intervals
// ─────────────────────────────────────────

export type Rating = 'again' | 'hard' | 'good' | 'easy'

const BOX_INTERVALS_MS: Record<number, number> = {
  1: 60_000,                    // 1 minute  (immediate retry)
  2: 86_400_000,                // 1 day
  3: 3 * 86_400_000,            // 3 days
  4: 7 * 86_400_000,            // 7 days
  5: 30 * 86_400_000,           // 30 days
}

function computeNextBox(current: number, rating: Rating): number {
  switch (rating) {
    case 'again': return 1
    case 'hard':  return Math.max(1, current - 1)
    case 'good':  return Math.min(5, current + 1)
    case 'easy':  return Math.min(5, current + 2)
  }
}

export function boxIntervalLabel(box: number): string {
  switch (box) {
    case 1: return '1 min'
    case 2: return '1 giorno'
    case 3: return '3 giorni'
    case 4: return '7 giorni'
    case 5: return '30 giorni'
    default: return '—'
  }
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export function useSRS() {
  const [dueCount, setDueCount] = useState(0)
  const [dueItems, setDueItems] = useState<SRSItem[]>([])

  // ── refresh the due-count badge ──────────────────────
  const refreshDueCount = useCallback(async () => {
    const now = Date.now()
    const items = await db.srs_items.where('nextReviewAt').belowOrEqual(now).toArray()
    setDueCount(items.length)
    setDueItems(items)
  }, [])

  // ── return all due items for the review queue ────────
  const getDueItems = useCallback(async (): Promise<SRSItem[]> => {
    const now = Date.now()
    return db.srs_items.where('nextReviewAt').belowOrEqual(now).toArray()
  }, [])

  // ── MAIN: rate an item with AGAIN/HARD/GOOD/EASY ────
  const rateItem = useCallback(async (itemId: string, rating: Rating): Promise<void> => {
    const item = await db.srs_items.where('itemId').equals(itemId).first()
    if (!item || item.id == null) return

    const newBox = computeNextBox(item.box, rating)
    const interval = BOX_INTERVALS_MS[newBox] ?? BOX_INTERVALS_MS[1]
    const isCorrect = rating !== 'again'

    await db.srs_items.update(item.id, {
      box: newBox,
      nextReviewAt: Date.now() + interval,
      timesCorrect: item.timesCorrect + (isCorrect ? 1 : 0),
      timesWrong:   item.timesWrong   + (isCorrect ? 0 : 1),
      lastReviewedAt: Date.now(),
    })
  }, [])

  // ── LEGACY: boolean correct/wrong for Lesson.tsx ────
  const ensureItem = useCallback(async (itemId: string, itemType: 'vocab' | 'verb' = 'vocab') => {
    const existing = await db.srs_items.where('itemId').equals(itemId).first()
    if (!existing) {
      await db.srs_items.add({
        itemId,
        itemType,
        box: 1,
        nextReviewAt: Date.now(),
        timesCorrect: 0,
        timesWrong: 0,
        lastReviewedAt: 0,
      })
    }
  }, [])

  const recordAnswer = useCallback(async (itemId: string, correct: boolean) => {
    await rateItem(itemId, correct ? 'good' : 'again')
    await refreshDueCount()
  }, [rateItem, refreshDueCount])

  return {
    dueCount,
    dueItems,
    refreshDueCount,
    getDueItems,
    rateItem,
    recordAnswer,
    ensureItem,
  }
}
