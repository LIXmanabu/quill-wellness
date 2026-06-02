import { useState, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────
//  Today streak — consecutive days the user completed their Today task.
//  Deliberately gentle (no shame): the streak stays "alive" if today isn't
//  done yet, and missing a day simply starts a new one. Stored as a plain
//  list of completed day-keys under `quill.streak`, separate from the
//  Pro multi-habit tracker (`quill.habits`).
// ─────────────────────────────────────────────────────────────────────────
const KEY = 'quill.streak'

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
function parse(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function load() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
function save(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch {}
}

function compute(dates) {
  const set = new Set(dates)
  // Current streak — anchor at today if done, otherwise yesterday, so an
  // un-ticked "today" doesn't read as a broken streak before the day's over.
  let current = 0
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0)
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (set.has(dayKey(cursor))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }
  // Longest run ever.
  const sorted = [...set].map(parse).sort((a, b) => a - b)
  let longest = 0, run = 0, prev = null
  for (const d of sorted) {
    run = prev && d - prev === 86400000 ? run + 1 : 1
    if (run > longest) longest = run
    prev = d
  }
  return { current, longest, total: set.size }
}

export function useDailyStreak() {
  const [dates, setDates] = useState(load)
  const todayDone = dates.includes(dayKey())

  const markDone = useCallback(() => {
    setDates((prev) => {
      const k = dayKey()
      if (prev.includes(k)) return prev
      const next = [...prev, k]
      save(next)
      return next
    })
  }, [])

  const toggleToday = useCallback(() => {
    setDates((prev) => {
      const k = dayKey()
      const next = prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
      save(next)
      return next
    })
  }, [])

  // Did the user complete `n` days back from today? (n=0 → today)
  const doneNDaysAgo = useCallback((n) => {
    const d = new Date(); d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - n)
    return dates.includes(dayKey(d))
  }, [dates])

  return { ...compute(dates), todayDone, markDone, toggleToday, doneNDaysAgo }
}
