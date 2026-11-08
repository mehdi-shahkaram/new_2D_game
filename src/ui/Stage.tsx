import { useEffect, useRef, useState } from 'react'
import { CHARACTER_ART } from '../art/characters'
import { H, W } from '../art/procedural'
import { SCENES } from '../art/scenes'
import type { StageChar } from '../engine/types'

// تصویر اختیاری: اگر فایل وجود داشت آن را نشان بده، وگرنه نسخه‌ی SVG
const imgCache = new Map<string, boolean>()
function useOptionalImage(src: string) {
  const [ok, setOk] = useState(() => imgCache.get(src) ?? false)
  useEffect(() => {
    if (imgCache.has(src)) {
      setOk(imgCache.get(src)!)
      return
    }
    let alive = true
    const img = new Image()
    img.onload = () => {
      imgCache.set(src, true)
      if (alive) setOk(true)
    }
    img.onerror = () => {
      imgCache.set(src, false)
      if (alive) setOk(false)
    }
    img.src = src
    return () => {
      alive = false
    }
  }, [src])
  return ok
}

function SceneLayer({ id }: { id: string }) {
  const hasImg = useOptionalImage(`./images/bg/${id}.webp`)
  const Scene = SCENES[id] ?? SCENES.black
  if (hasImg && id !== 'black') return <img className="bg-img" src={`./images/bg/${id}.webp`} alt="" draggable={false} />
  return (
    <svg className="bg-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Scene />
    </svg>
  )
}

/** پس‌زمینه با محوشدن نرم بین صحنه‌ها */
export function Background({ id }: { id: string }) {
  const [layers, setLayers] = useState<{ id: string; key: number }[]>([{ id, key: 0 }])
  const counter = useRef(0)
  useEffect(() => {
    setLayers((prev) => {
      if (prev[prev.length - 1].id === id) return prev
      counter.current += 1
      return [...prev.slice(-1), { id, key: counter.current }]
    })
    const t = window.setTimeout(() => setLayers((prev) => prev.slice(-1)), 1100)
    return () => clearTimeout(t)
  }, [id])
  return (
    <div className="bg">
      {layers.map((l, i) => (
        <div key={l.key} className={`bg-layer ${i > 0 ? 'bg-enter' : ''}`}>
          <SceneLayer id={l.id} />
        </div>
      ))}
    </div>
  )
}

function CharacterSprite({ c, speaking }: { c: StageChar; speaking: boolean }) {
  const hasImg = useOptionalImage(`./images/char/${c.id}.webp`)
  const Art = CHARACTER_ART[c.id]
  return (
    <div className={`char char-${c.pos} char-id-${c.id} ${speaking ? 'speaking' : ''}`}>
      {hasImg ? <img src={`./images/char/${c.id}.webp`} alt="" draggable={false} /> : Art ? <Art mood={c.mood} /> : null}
    </div>
  )
}

export function Characters({ chars, speaker }: { chars: StageChar[]; speaker?: string }) {
  return (
    <div className="chars">
      {chars.map((c) => (
        <CharacterSprite key={c.id} c={c} speaking={!speaker || speaker === c.id} />
      ))}
    </div>
  )
}
