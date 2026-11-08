import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Runner, emptyState, posKey } from './engine/runner'
import {
  SAVE_VERSION,
  addEnding,
  deleteSlot,
  endingsFound,
  loadSettings,
  loadSlot,
  markSeen,
  saveSettings,
  saveSlot,
  seen,
  type SlotId,
} from './engine/storage'
import type { ChoiceOption, GameState, SaveData, Settings } from './engine/types'
import { CHARACTERS, ENDINGS, SCRIPT, SUBTITLE, TITLE } from './story/script'
import { toFa } from './ui/fa'
import { EndingsMenu, HistoryMenu, PauseMenu, SaveLoadMenu, SettingsMenu } from './ui/Menus'
import { Background, Characters } from './ui/Stage'
import { TextBox } from './ui/TextBox'

const runner = new Runner(SCRIPT)

type Screen = 'title' | 'game'
type ModalKind = null | 'pause' | 'save' | 'load' | 'history' | 'settings' | 'endings'

export default function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [state, setState] = useState<GameState>(emptyState)
  const [modal, setModal] = useState<ModalKind>(null)
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [lineDone, setLineDone] = useState(false)
  const [auto, setAuto] = useState(false)
  const [skip, setSkip] = useState(false)
  const [ctrlHeld, setCtrlHeld] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [fxClass, setFxClass] = useState('')
  const [hideUI, setHideUI] = useState(false)
  const lastFx = useRef(0)

  const node = screen === 'game' ? runner.node(state.pos) : undefined
  const key = posKey(state.pos)
  const skipping = skip || ctrlHeld

  const setSettings = (s: Settings) => {
    setSettingsState(s)
    saveSettings(s)
  }

  const flash = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600)
  }, [])

  // ── ورود به بازی ──
  const enter = (s: GameState) => {
    lastFx.current = s.fx?.n ?? 0
    setState(s)
    setLineDone(false)
    setAuto(false)
    setSkip(false)
    setModal(null)
    setHideUI(false)
    setScreen('game')
  }
  const newGame = () => enter(runner.start(emptyState()))
  const loadData = (d: SaveData) => enter(d.state)

  // ── پیشروی ──
  const advance = useCallback(() => {
    setState((s) => {
      const n = runner.node(s.pos)
      if (n?.t === 'say' || n?.t === 'chapter') markSeen(posKey(s.pos))
      return runner.advance(s)
    })
    setLineDone(false)
  }, [])

  const onUserAdvance = useCallback(() => {
    if (hideUI) return setHideUI(false)
    if (!node) return
    if (skip) setSkip(false)
    if (node.t === 'say') {
      if (!lineDone) setLineDone(true)
      else advance()
    } else if (node.t === 'chapter') advance()
  }, [node, lineDone, advance, skip, hideUI])

  const choose = (o: ChoiceOption) => {
    markSeen(key)
    setState((s) => runner.choose(s, o))
    setLineDone(false)
  }

  const onLineDone = useCallback(() => setLineDone(true), [])

  // ── ذخیره ──
  const snapshot = useCallback((s: GameState): SaveData => {
    const n = runner.node(s.pos)
    const snippet =
      n?.t === 'say' ? n.text : n?.t === 'choice' ? 'لحظه‌ی انتخاب' : n?.t === 'chapter' ? `${n.num}: ${n.title}` : ''
    return {
      version: SAVE_VERSION,
      state: s,
      savedAt: Date.now(),
      scene: runner.sceneName(s.pos.label),
      snippet: snippet.length > 70 ? snippet.slice(0, 70) + '…' : snippet,
    }
  }, [])
  const saveTo = (id: SlotId) => {
    saveSlot(id, snapshot(state))
    flash(id === 'quick' ? 'ذخیره‌ی سریع انجام شد' : 'ذخیره شد')
  }

  // ذخیره‌ی خودکار در هر گام؛ در پایان پاک می‌شود تا «ادامه» به صفحه‌ی پایان برنگردد
  useEffect(() => {
    if (!node) return
    if (node.t === 'end') deleteSlot('auto')
    else saveSlot('auto', snapshot(state))
  }, [state, node, snapshot])

  // ── پایان ──
  useEffect(() => {
    if (node?.t === 'end') {
      addEnding(node.ending)
      setAuto(false)
      setSkip(false)
    }
  }, [node])

  // ── افکت‌ها ──
  useEffect(() => {
    const f = state.fx
    if (!f || f.n === lastFx.current) return
    lastFx.current = f.n
    if (skipping) return
    setFxClass('')
    const raf = requestAnimationFrame(() => setFxClass(`fx-${f.kind}`))
    const t = window.setTimeout(() => setFxClass(''), 900)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [state.fx, skipping])

  // ── کارت فصل: پس از چند ثانیه خودش رد می‌شود ──
  useEffect(() => {
    if (node?.t !== 'chapter' || modal) return
    const t = window.setTimeout(advance, skipping ? 150 : 2600)
    return () => clearTimeout(t)
  }, [node, key, modal, advance, skipping])

  // ── حالت خودکار ──
  useEffect(() => {
    if (!auto || skipping || modal || node?.t !== 'say' || !lineDone) return
    const t = window.setTimeout(advance, settings.autoDelay + node.text.length * 25)
    return () => clearTimeout(t)
  }, [auto, skipping, modal, node, lineDone, advance, settings.autoDelay, key])

  // ── حالت پرش: فقط از متن‌های خوانده‌شده رد می‌شود ──
  useEffect(() => {
    if (!skipping || modal || node?.t !== 'say') return
    if (!settings.skipUnseen && !seen().has(key)) {
      if (skip) {
        setSkip(false)
        flash('پرش متوقف شد: متنِ تازه')
      }
      return
    }
    const t = window.setTimeout(advance, 70)
    return () => clearTimeout(t)
  }, [skipping, skip, modal, node, key, advance, settings.skipUnseen, flash])

  useEffect(() => {
    if (node?.t === 'choice') setSkip(false)
  }, [node])

  // ── کیبورد ──
  useEffect(() => {
    if (screen !== 'game') return
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Control') return setCtrlHeld(true)
      if (e.key === 'Escape') return setModal((m) => (m ? null : 'pause'))
      if (modal || e.repeat) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onUserAdvance()
      } else if (e.code === 'KeyA') setAuto((a) => !a)
      else if (e.code === 'KeyH') setModal('history')
      else if (e.code === 'KeyQ') saveTo('quick')
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Control') setCtrlHeld(false)
    }
    const blur = () => setCtrlHeld(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  })

  const options = useMemo(() => (node?.t === 'choice' ? runner.visibleOptions(state) : []), [node, state])
  const speaker = node?.t === 'say' ? node.who : undefined
  const lastLine = [...state.backlog].reverse().find((e) => e.who !== '__choice')

  if (screen === 'title') {
    return (
      <Shell>
        <TitleScreen
          onNew={newGame}
          onContinue={() => {
            const a = loadSlot('auto')
            if (a) loadData(a)
          }}
          onLoad={() => setModal('load')}
          onEndings={() => setModal('endings')}
          onSettings={() => setModal('settings')}
        />
        {modal === 'load' && <SaveLoadMenu mode="load" onClose={() => setModal(null)} onSave={() => {}} onLoad={loadData} />}
        {modal === 'endings' && <EndingsMenu onClose={() => setModal(null)} />}
        {modal === 'settings' && <SettingsMenu settings={settings} onChange={setSettings} onClose={() => setModal(null)} />}
      </Shell>
    )
  }

  return (
    <Shell>
      <div
        className={`stage-inner ${fxClass}`}
        onClick={onUserAdvance}
        onContextMenu={(e) => {
          e.preventDefault()
          setHideUI((h) => !h)
        }}
        onWheel={(e) => {
          if (e.deltaY < 0 && !modal) setModal('history')
        }}
      >
        <Background id={state.bg} />
        <Characters chars={node?.t === 'end' ? [] : state.chars} speaker={speaker} />
        <div className="fx-overlay" />

        {!hideUI && node?.t === 'say' && (
          <TextBox
            key={key}
            who={node.who}
            text={node.text}
            cps={skipping ? 0 : settings.textSpeed}
            done={lineDone}
            onDone={onLineDone}
          />
        )}

        {node?.t === 'choice' && (
          <div className="choices" onClick={(e) => e.stopPropagation()}>
            {lastLine && (
              <p className="choice-context">
                {lastLine.who && <b style={{ color: CHARACTERS[lastLine.who]?.color }}>{CHARACTERS[lastLine.who]?.name}: </b>}
                {lastLine.text.replace(/^\((.*)\)$/s, '$1')}
              </p>
            )}
            {options.map((o, i) => (
              <button
                key={i}
                className={`choice ${o.special ? 'special' : ''}`}
                onClick={() => choose(o)}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {o.special && <span className="spark">✦ </span>}
                {o.text}
              </button>
            ))}
          </div>
        )}

        {node?.t === 'chapter' && (
          <div className="chapter-card" key={key}>
            <span className="chapter-num">{node.num}</span>
            <span className="chapter-title">{node.title}</span>
          </div>
        )}

        {node?.t === 'end' && <EndingScreen id={node.ending} onTitle={() => setScreen('title')} onRestart={newGame} />}

        {!hideUI && node?.t !== 'end' && (
          <nav className="quickmenu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal('history')}>تاریخچه</button>
            <button className={auto ? 'on' : ''} onClick={() => setAuto((a) => !a)}>
              خودکار
            </button>
            <button className={skip ? 'on' : ''} onClick={() => setSkip((s) => !s)}>
              پرش
            </button>
            <button onClick={() => saveTo('quick')}>ذخیره‌ی سریع</button>
            <button onClick={() => setModal('save')}>ذخیره</button>
            <button onClick={() => setModal('load')}>بارگذاری</button>
            <button onClick={() => setModal('settings')}>تنظیمات</button>
            <button onClick={toggleFullscreen} aria-label="تمام‌صفحه" title="تمام‌صفحه">
              ⛶
            </button>
            <button onClick={() => setModal('pause')}>منو</button>
          </nav>
        )}

        {(auto || skipping) && node?.t !== 'end' && <div className="mode-badge">{skipping ? 'پرش ⏩' : 'خودکار ▶'}</div>}
        {toast && <div className="toast">{toast}</div>}
      </div>

      {modal === 'pause' && (
        <PauseMenu
          onClose={() => setModal(null)}
          onSave={() => setModal('save')}
          onLoad={() => setModal('load')}
          onHistory={() => setModal('history')}
          onSettings={() => setModal('settings')}
          onTitle={() => {
            setModal(null)
            setScreen('title')
          }}
        />
      )}
      {modal === 'save' && <SaveLoadMenu mode="save" onClose={() => setModal(null)} onSave={saveTo} onLoad={() => {}} />}
      {modal === 'load' && <SaveLoadMenu mode="load" onClose={() => setModal(null)} onSave={() => {}} onLoad={loadData} />}
      {modal === 'history' && <HistoryMenu log={state.backlog} onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsMenu settings={settings} onChange={setSettings} onClose={() => setModal(null)} />}
    </Shell>
  )
}

/** صحنه‌ی ۱۶:۹ که در هر اندازه‌ی صفحه جا می‌شود */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="viewport">
      <div className="stage">{children}</div>
      <div className="rotate-hint">برای تجربه‌ی بهتر، گوشی را افقی کنید ↻</div>
    </div>
  )
}

function TitleScreen({
  onNew,
  onContinue,
  onLoad,
  onEndings,
  onSettings,
}: {
  onNew: () => void
  onContinue: () => void
  onLoad: () => void
  onEndings: () => void
  onSettings: () => void
}) {
  const hasAuto = !!loadSlot('auto')
  const found = endingsFound().length
  const total = Object.keys(ENDINGS).length
  return (
    <div className="stage-inner title-screen">
      <Background id="dream" />
      <div className="title-vignette" />
      <div className="title-block">
        <h1 className="game-title">{TITLE}</h1>
        <p className="game-subtitle">{SUBTITLE}</p>
        <div className="menu-list">
          {hasAuto && (
            <button className="btn primary" onClick={onContinue}>
              ادامه
            </button>
          )}
          <button className={`btn ${hasAuto ? '' : 'primary'}`} onClick={onNew}>
            {hasAuto ? 'داستانِ تازه' : 'آغازِ داستان'}
          </button>
          <button className="btn" onClick={onLoad}>
            بارگذاری
          </button>
          <button className="btn" onClick={onEndings}>
            پایان‌ها{found > 0 && ` (${toFa(found)} از ${toFa(total)})`}
          </button>
          <button className="btn" onClick={onSettings}>
            تنظیمات
          </button>
        </div>
      </div>
      <p className="title-foot">نسخه‌ی آزمایشی {toFa('0.1')}</p>
    </div>
  )
}

function EndingScreen({ id, onTitle, onRestart }: { id: string; onTitle: () => void; onRestart: () => void }) {
  const e = ENDINGS[id]
  // پایانِ فعلی را هم بشمار؛ ثبتش در effect بعد از رندر انجام می‌شود
  const found = [...new Set([...endingsFound(), id])]
  const total = Object.keys(ENDINGS).length
  return (
    <div className="ending-screen" onClick={(ev) => ev.stopPropagation()}>
      <span className="ending-kicker">پایان</span>
      <h2 className="ending-title">{e?.title}</h2>
      <p className="ending-count">
        پایان‌های کشف‌شده: {toFa(found.length)} از {toFa(total)}
      </p>
      {found.length < total && <p className="ending-hint">پایان‌های دیگری هم هست. شاید انتخاب‌های دیگر، راه را عوض کنند.</p>}
      <div className="menu-list row">
        <button className="btn primary" onClick={onRestart}>
          دوباره از اول
        </button>
        <button className="btn" onClick={onTitle}>
          منوی اصلی
        </button>
      </div>
    </div>
  )
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen?.().catch(() => {})
}
