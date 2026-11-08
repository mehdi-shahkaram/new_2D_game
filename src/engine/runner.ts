import type { ChoiceOption, GameState, Node, Pos, Script } from './types'

// موتور اسکریپت: دستورهای غیرمسدودکننده (bg, show, set, jump, ...) را اجرا می‌کند
// تا به یک گره‌ی مسدودکننده برسد (say, choice, chapter, end) که منتظر بازیکن می‌ماند.

const BLOCKING = new Set<Node['t']>(['say', 'choice', 'chapter', 'end'])
const MAX_STEPS = 10_000

export class Runner {
  private byLabel = new Map<string, number>()
  private script: Script

  constructor(script: Script) {
    this.script = script
    script.forEach((s, i) => {
      if (this.byLabel.has(s.label)) throw new Error(`برچسب تکراری: ${s.label}`)
      this.byLabel.set(s.label, i)
    })
    // اعتبارسنجی: هر پرش باید به برچسبی موجود برود
    for (const s of script) {
      for (const n of s.nodes) {
        const targets =
          n.t === 'jump' ? [n.to] : n.t === 'if' ? [n.then, n.else] : n.t === 'choice' ? n.options.map((o) => o.goto) : []
        for (const t of targets) {
          if (t && !this.byLabel.has(t)) throw new Error(`پرش به برچسب ناموجود «${t}» در «${s.label}»`)
        }
      }
    }
  }

  node(pos: Pos): Node | undefined {
    const i = this.byLabel.get(pos.label)
    return i === undefined ? undefined : this.script[i].nodes[pos.index]
  }

  sceneName(label: string): string {
    const i = this.byLabel.get(label)
    return i === undefined ? '' : this.script[i].scene
  }

  /** گزینه‌هایی که شرطشان برقرار است */
  visibleOptions(state: GameState): ChoiceOption[] {
    const n = this.node(state.pos)
    if (n?.t !== 'choice') return []
    return n.options.filter((o) => !o.if || o.if(state.flags))
  }

  start(initial: GameState): GameState {
    return this.runFrom(initial, { label: this.script[0].label, index: 0 })
  }

  advance(state: GameState): GameState {
    const n = this.node(state.pos)
    if (!n || n.t === 'choice' || n.t === 'end') return state
    const next = n.t === 'say' ? pushLog(state, { who: n.who, text: n.text }) : state
    return this.runFrom(next, { label: state.pos.label, index: state.pos.index + 1 })
  }

  choose(state: GameState, option: ChoiceOption): GameState {
    const next: GameState = {
      ...state,
      flags: { ...state.flags, ...option.set },
      backlog: [...state.backlog, { who: '__choice', text: option.text }].slice(-200),
    }
    return this.runFrom(next, { label: option.goto, index: 0 })
  }

  private runFrom(state: GameState, pos: Pos): GameState {
    let s: GameState = { ...state, pos }
    for (let guard = 0; guard < MAX_STEPS; guard++) {
      const sectionIdx = this.byLabel.get(s.pos.label)
      if (sectionIdx === undefined) throw new Error(`برچسب ناموجود: ${s.pos.label}`)
      const nodes = this.script[sectionIdx].nodes
      if (s.pos.index >= nodes.length) {
        // سقوط به برچسب بعدی
        const nextSection = this.script[sectionIdx + 1]
        if (!nextSection) throw new Error(`پایانِ اسکریپت بدون end در ${s.pos.label}`)
        s = { ...s, pos: { label: nextSection.label, index: 0 } }
        continue
      }
      const n = nodes[s.pos.index]
      if (BLOCKING.has(n.t)) return s
      s = this.apply(s, n)
    }
    throw new Error('حلقه‌ی بی‌پایان در اسکریپت')
  }

  private apply(s: GameState, n: Node): GameState {
    const nextPos = { label: s.pos.label, index: s.pos.index + 1 }
    switch (n.t) {
      case 'bg':
        // تغییر صحنه شخصیت‌ها را پاک می‌کند
        return { ...s, bg: n.id, chars: [], pos: nextPos }
      case 'show': {
        const rest = s.chars.filter((c) => c.id !== n.char)
        return { ...s, chars: [...rest, { id: n.char, pos: n.pos ?? 'center', mood: n.mood }], pos: nextPos }
      }
      case 'hide':
        return { ...s, chars: n.char ? s.chars.filter((c) => c.id !== n.char) : [], pos: nextPos }
      case 'set':
        return { ...s, flags: { ...s.flags, ...n.flags }, pos: nextPos }
      case 'jump':
        return { ...s, pos: { label: n.to, index: 0 } }
      case 'if': {
        const target = n.cond(s.flags) ? n.then : n.else
        return { ...s, pos: target ? { label: target, index: 0 } : nextPos }
      }
      case 'fx':
        return { ...s, fx: { kind: n.kind, n: (s.fx?.n ?? 0) + 1 }, pos: nextPos }
      default:
        return { ...s, pos: nextPos }
    }
  }
}

function pushLog(s: GameState, e: { who?: string; text: string }): GameState {
  return { ...s, backlog: [...s.backlog, e].slice(-200) }
}

export const posKey = (p: Pos) => `${p.label}:${p.index}`

export function emptyState(): GameState {
  return { pos: { label: '', index: 0 }, flags: {}, bg: 'black', chars: [], backlog: [], fx: null }
}
