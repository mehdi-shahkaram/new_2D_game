import { Background, Characters } from './ui/Stage'
import type { CharPos } from './engine/types'

// فقط در حالت توسعه: #bg=forest&char=wanderer:left:mood برای دیدنِ سریعِ یک صحنه
export function DevPreview({ hash }: { hash: string }) {
  const p = new URLSearchParams(hash.slice(1))
  const chars = (p.get('char') ?? '')
    .split(',')
    .filter(Boolean)
    .map((c) => {
      const [id, pos, mood] = c.split(':')
      return { id, pos: (pos || 'center') as CharPos, mood }
    })
  return (
    <div className="viewport">
      <div className="stage">
        <div className="stage-inner">
          <Background id={p.get('bg') ?? 'black'} />
          <Characters chars={chars} />
        </div>
      </div>
    </div>
  )
}
