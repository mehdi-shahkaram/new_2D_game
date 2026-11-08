// مدل داده‌ی اسکریپت: محتوا (متن و انتخاب) این‌جا تعریف می‌شود، نحوه‌ی نمایش در لایه‌ی UI

export type Flags = Record<string, string | number | boolean>
export type Cond = (f: Flags) => boolean

export type CharPos = 'right' | 'center' | 'left'
export type FxKind = 'shake' | 'flash' | 'fire'

export interface ChoiceOption {
  text: string
  goto: string
  set?: Flags
  if?: Cond
  /** گزینه‌ی ویژه که فقط با یک تصمیم قبلی باز شده — با رنگ طلایی نشان داده می‌شود */
  special?: boolean
}

export type Node =
  | { t: 'say'; who?: string; text: string }
  | { t: 'choice'; options: ChoiceOption[] }
  | { t: 'bg'; id: string }
  | { t: 'show'; char: string; pos?: CharPos; mood?: string }
  | { t: 'hide'; char?: string }
  | { t: 'set'; flags: Flags }
  | { t: 'jump'; to: string }
  | { t: 'if'; cond: Cond; then: string; else?: string }
  | { t: 'fx'; kind: FxKind }
  | { t: 'chapter'; num: string; title: string }
  | { t: 'end'; ending: string }

/** اسکریپت: فهرست مرتب برچسب‌ها؛ اگر برچسبی بدون jump تمام شود، به برچسب بعدی می‌رود */
export type Script = { label: string; scene: string; nodes: Node[] }[]

export interface Pos {
  label: string
  index: number
}

export interface StageChar {
  id: string
  pos: CharPos
  mood?: string
}

export interface LogEntry {
  who?: string
  text: string
}

export interface GameState {
  pos: Pos
  flags: Flags
  bg: string
  chars: StageChar[]
  backlog: LogEntry[]
  /** شمارنده‌ای که با هر افکت زیاد می‌شود تا UI بفهمد باید دوباره پخش کند */
  fx: { kind: FxKind; n: number } | null
}

export interface SaveData {
  version: number
  state: GameState
  savedAt: number
  scene: string
  snippet: string
}

export interface Settings {
  /** حروف در ثانیه؛ ۰ یعنی نمایش فوری */
  textSpeed: number
  /** مکث حالت خودکار پس از کامل شدن متن (میلی‌ثانیه) */
  autoDelay: number
  skipUnseen: boolean
}

export interface CharacterDef {
  name: string
  color: string
}

export interface EndingDef {
  title: string
  hint: string
}
