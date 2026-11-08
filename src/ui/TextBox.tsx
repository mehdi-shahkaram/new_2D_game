import { useEffect, useMemo, useState } from 'react'
import { CHARACTERS } from '../story/script'

// نمایش تدریجی متن «کلمه به کلمه».
// حرف‌به‌حرف در فارسی شکل اتصال حروف را خراب می‌کند، پس کل متن از ابتدا چیده می‌شود
// (تا شکستن خط‌ها ثابت بماند) و کلمه‌ها یکی‌یکی آشکار می‌شوند.

function TypeText({ text, cps, done, onDone }: { text: string; cps: number; done: boolean; onDone: () => void }) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text])
  const [shown, setShown] = useState(cps <= 0 ? tokens.length : 0)

  useEffect(() => {
    if (done || shown >= tokens.length) {
      if (!done) onDone()
      return
    }
    const word = tokens[shown]
    const delay = /^\s+$/.test(word) ? 0 : Math.max(30, (word.length / cps) * 1000)
    const t = window.setTimeout(() => setShown((s) => s + 1), delay)
    return () => clearTimeout(t)
  }, [shown, done, tokens, cps, onDone])

  const visible = done ? tokens.length : shown
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} className={i < visible ? 'w on' : 'w'}>
          {tok}
        </span>
      ))}
    </>
  )
}

export function TextBox({
  who,
  text,
  cps,
  done,
  onDone,
}: {
  who?: string
  text: string
  cps: number
  done: boolean
  onDone: () => void
}) {
  const def = who ? CHARACTERS[who] : undefined
  // متنِ داخلِ پرانتز = فکرِ درونی
  const thought = /^\(.*\)$/s.test(text.trim())
  const body = thought ? text.trim().slice(1, -1) : text
  return (
    <div className={`textbox ${!who ? 'narration' : ''} ${thought ? 'thought' : ''}`}>
      {def && (
        <div className="nameplate" style={{ color: def.color, borderColor: def.color }}>
          {def.name}
          {thought && <span className="nameplate-sub"> · در دل</span>}
        </div>
      )}
      <p className="line">
        <TypeText text={body} cps={cps} done={done} onDone={onDone} />
      </p>
      {done && <div className="advance-hint" aria-hidden>◆</div>}
    </div>
  )
}
