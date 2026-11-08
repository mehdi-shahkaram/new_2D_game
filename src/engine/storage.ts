import type { SaveData, Settings } from './types'

// ذخیره‌سازی در localStorage: اسلات‌ها، متن‌های دیده‌شده، پایان‌های کشف‌شده، تنظیمات

const NS = 'arin-vn'
export const SAVE_VERSION = 1
export const SLOT_COUNT = 6
export type SlotId = number | 'auto' | 'quick'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${NS}:${key}`)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value))
  } catch {
    // حافظه پر است یا در حالت خصوصی — بی‌صدا رد می‌شویم
  }
}

export function loadSlot(id: SlotId): SaveData | null {
  const s = read<SaveData | null>(`slot:${id}`, null)
  return s && s.version === SAVE_VERSION ? s : null
}
export const saveSlot = (id: SlotId, data: SaveData) => write(`slot:${id}`, data)
export const deleteSlot = (id: SlotId) => localStorage.removeItem(`${NS}:slot:${id}`)

// متن‌های دیده‌شده (برای «پرش» که فقط از متن خوانده‌شده رد شود)
let seenCache: Set<string> | null = null
export function seen(): Set<string> {
  if (!seenCache) seenCache = new Set(read<string[]>('seen', []))
  return seenCache
}
let seenTimer: number | undefined
export function markSeen(key: string) {
  const s = seen()
  if (s.has(key)) return
  s.add(key)
  clearTimeout(seenTimer)
  seenTimer = window.setTimeout(() => write('seen', [...s]), 400)
}

export const endingsFound = () => read<string[]>('endings', [])
export function addEnding(id: string) {
  const e = endingsFound()
  if (!e.includes(id)) write('endings', [...e, id])
}

export const DEFAULT_SETTINGS: Settings = { textSpeed: 45, autoDelay: 1400, skipUnseen: false }
export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>('settings', {}) })
export const saveSettings = (s: Settings) => write('settings', s)
