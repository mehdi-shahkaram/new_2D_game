import { useState, type ReactNode } from 'react'
import { SLOT_COUNT, deleteSlot, endingsFound, loadSlot, type SlotId } from '../engine/storage'
import type { LogEntry, SaveData, Settings } from '../engine/types'
import { CHARACTERS, ENDINGS } from '../story/script'
import { toFa } from './fa'

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="بستن">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

function slotLabel(id: SlotId) {
  if (id === 'auto') return 'ذخیره‌ی خودکار'
  if (id === 'quick') return 'ذخیره‌ی سریع'
  return `خانه‌ی ${toFa(id)}`
}

function formatDate(t: number) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(t)
}

export function SaveLoadMenu({
  mode,
  onClose,
  onSave,
  onLoad,
}: {
  mode: 'save' | 'load'
  onClose: () => void
  onSave: (id: SlotId) => void
  onLoad: (data: SaveData) => void
}) {
  const [, force] = useState(0)
  const ids: SlotId[] = mode === 'load' ? ['auto', 'quick', ...range(SLOT_COUNT)] : range(SLOT_COUNT)
  return (
    <Modal title={mode === 'save' ? 'ذخیره' : 'بارگذاری'} onClose={onClose} wide>
      <div className="slots">
        {ids.map((id) => {
          const s = loadSlot(id)
          const disabled = mode === 'load' && !s
          return (
            <div key={String(id)} className={`slot ${s ? '' : 'empty'}`}>
              <button
                className="slot-main"
                disabled={disabled}
                onClick={() => {
                  if (mode === 'save') {
                    onSave(id)
                    force((n) => n + 1)
                  } else if (s) onLoad(s)
                }}
              >
                <span className="slot-id">{slotLabel(id)}</span>
                {s ? (
                  <>
                    <span className="slot-scene">{s.scene}</span>
                    <span className="slot-snippet">{s.snippet}</span>
                    <span className="slot-date">{formatDate(s.savedAt)}</span>
                  </>
                ) : (
                  <span className="slot-snippet">{mode === 'save' ? 'خالی — برای ذخیره کلیک کنید' : 'خالی'}</span>
                )}
              </button>
              {s && typeof id === 'number' && (
                <button
                  className="icon-btn slot-del"
                  aria-label="پاک کردن"
                  onClick={() => {
                    deleteSlot(id)
                    force((n) => n + 1)
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

export function HistoryMenu({ log, onClose }: { log: LogEntry[]; onClose: () => void }) {
  return (
    <Modal title="تاریخچه‌ی گفت‌وگو" onClose={onClose} wide>
      <div
        className="history"
        ref={(el) => {
          if (el) el.scrollTop = el.scrollHeight
        }}
      >
        {log.length === 0 && <p className="muted">هنوز چیزی گفته نشده.</p>}
        {log.map((e, i) =>
          e.who === '__choice' ? (
            <p key={i} className="h-choice">
              ◂ انتخابِ شما: {e.text}
            </p>
          ) : (
            <p key={i} className="h-line">
              {e.who && (
                <b style={{ color: CHARACTERS[e.who]?.color }}>{CHARACTERS[e.who]?.name ?? e.who}: </b>
              )}
              {e.text}
            </p>
          ),
        )}
      </div>
    </Modal>
  )
}

export function SettingsMenu({ settings, onChange, onClose }: { settings: Settings; onChange: (s: Settings) => void; onClose: () => void }) {
  const speedLabel = settings.textSpeed === 0 ? 'فوری' : toFa(settings.textSpeed)
  return (
    <Modal title="تنظیمات" onClose={onClose}>
      <label className="setting">
        <span>سرعتِ متن: {speedLabel}</span>
        <input
          type="range"
          min={0}
          max={120}
          step={5}
          value={settings.textSpeed === 0 ? 120 : settings.textSpeed}
          onChange={(e) => {
            const v = Number(e.target.value)
            onChange({ ...settings, textSpeed: v >= 120 ? 0 : Math.max(10, v) })
          }}
        />
        <small>کُند ← → فوری</small>
      </label>
      <label className="setting">
        <span>مکثِ حالت خودکار: {toFa((settings.autoDelay / 1000).toFixed(1))} ثانیه</span>
        <input
          type="range"
          min={400}
          max={4000}
          step={100}
          value={settings.autoDelay}
          onChange={(e) => onChange({ ...settings, autoDelay: Number(e.target.value) })}
        />
      </label>
      <label className="setting check">
        <input type="checkbox" checked={settings.skipUnseen} onChange={(e) => onChange({ ...settings, skipUnseen: e.target.checked })} />
        <span>پرش از متن‌های خوانده‌نشده هم انجام شود</span>
      </label>
      <div className="keys">
        <h3>کلیدها</h3>
        <p>
          <kbd>Space</kbd> یا <kbd>Enter</kbd> یا کلیک: ادامه · <kbd>Ctrl</kbd> (نگه دارید): پرش · <kbd>A</kbd>: خودکار ·{' '}
          <kbd>H</kbd> یا چرخِ ماوس به بالا: تاریخچه · <kbd>Q</kbd>: ذخیره‌ی سریع · <kbd>Esc</kbd>: منو
        </p>
      </div>
    </Modal>
  )
}

export function EndingsMenu({ onClose }: { onClose: () => void }) {
  const found = endingsFound()
  const all = Object.entries(ENDINGS)
  return (
    <Modal title={`پایان‌ها — ${toFa(found.length)} از ${toFa(all.length)}`} onClose={onClose}>
      <ul className="endings">
        {all.map(([id, e]) => (
          <li key={id} className={found.includes(id) ? 'got' : 'locked'}>
            <b>{found.includes(id) ? e.title : '؟ ؟ ؟'}</b>
            <span>{e.hint}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export function PauseMenu({
  onClose,
  onSave,
  onLoad,
  onHistory,
  onSettings,
  onTitle,
}: {
  onClose: () => void
  onSave: () => void
  onLoad: () => void
  onHistory: () => void
  onSettings: () => void
  onTitle: () => void
}) {
  return (
    <Modal title="مکث" onClose={onClose}>
      <div className="menu-list">
        <button className="btn" onClick={onClose}>
          ادامه‌ی داستان
        </button>
        <button className="btn" onClick={onSave}>
          ذخیره
        </button>
        <button className="btn" onClick={onLoad}>
          بارگذاری
        </button>
        <button className="btn" onClick={onHistory}>
          تاریخچه
        </button>
        <button className="btn" onClick={onSettings}>
          تنظیمات
        </button>
        <button className="btn ghost" onClick={onTitle}>
          بازگشت به منوی اصلی
        </button>
      </div>
    </Modal>
  )
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1)
}
