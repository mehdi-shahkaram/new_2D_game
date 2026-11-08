import { useId, type ReactNode } from 'react'

// ابزارهای ساخت تصویرِ رویه‌ای (procedural): کوه، ستاره، درخت، قلعه
// همه با بذرِ ثابت تا هر بار همان تصویر ساخته شود.

export const W = 1600
export const H = 900

export function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** خط‌الرأسِ کوه که تا پایینِ کادر پر می‌شود */
export function ridge(seed: number, baseY: number, amp: number, opts: { step?: number; jag?: number; smooth?: boolean } = {}) {
  const { step = 40, jag = 0.35, smooth = false } = opts
  const r = rng(seed)
  const p = [r() * 6, r() * 6, r() * 6]
  const f = [0.0021 + r() * 0.001, 0.0053 + r() * 0.002, 0.013 + r() * 0.004]
  const pts: [number, number][] = []
  for (let x = -step; x <= W + step; x += step) {
    const y =
      baseY -
      amp * (0.55 * Math.sin(x * f[0] + p[0]) + 0.3 * Math.sin(x * f[1] + p[1]) + 0.15 * Math.sin(x * f[2] + p[2])) -
      amp * jag * (r() - 0.5)
    pts.push([x, y])
  }
  let d = `M${-step},${H} L${pts[0][0]},${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    if (smooth) {
      const [px, py] = pts[i - 1]
      const [x, y] = pts[i]
      d += ` Q${px.toFixed(1)},${py.toFixed(1)} ${((px + x) / 2).toFixed(1)},${((py + y) / 2).toFixed(1)}`
    } else {
      d += ` L${pts[i][0]},${pts[i][1].toFixed(1)}`
    }
  }
  return d + ` L${W + step},${H} Z`
}

export function Stars({ seed, count, maxY = H * 0.7, color = '#fff' }: { seed: number; count: number; maxY?: number; color?: string }) {
  const r = rng(seed)
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const big = r() > 0.92
        return (
          <circle
            key={i}
            cx={r() * W}
            cy={r() * maxY}
            r={big ? 1.8 + r() * 1.2 : 0.6 + r() * 1}
            fill={color}
            opacity={0.4 + r() * 0.6}
            className={big ? 'twinkle' : undefined}
            style={big ? { animationDelay: `${(r() * 4).toFixed(2)}s` } : undefined}
          />
        )
      })}
    </g>
  )
}

/** لایه‌ی مه که آرام افقی حرکت می‌کند */
export function Fog({ y, h, color, opacity, speed = 60, reverse = false }: { y: number; h: number; color: string; opacity: number; speed?: number; reverse?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <g opacity={opacity}>
    <defs>
      <filter id={`fog-${id}`} x="-20%" y="-100%" width="140%" height="300%">
        <feGaussianBlur stdDeviation={h * 0.35} />
      </filter>
    </defs>
    <g className={reverse ? 'drift-rev' : 'drift'} style={{ animationDuration: `${speed}s` }} filter={`url(#fog-${id})`}>
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${k * W},0)`}>
          <ellipse cx={W * 0.2} cy={y} rx={W * 0.35} ry={h} fill={color} />
          <ellipse cx={W * 0.65} cy={y + h * 0.3} rx={W * 0.4} ry={h * 0.8} fill={color} />
          <ellipse cx={W * 1.0} cy={y - h * 0.2} rx={W * 0.3} ry={h * 0.7} fill={color} />
        </g>
      ))}
    </g>
    </g>
  )
}

/** ذره‌های آتش که بالا می‌روند */
export function Embers({ seed, count, x0, x1, y, color = '#ffb35c' }: { seed: number; count: number; x0: number; x1: number; y: number; color?: string }) {
  const r = rng(seed)
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          className="ember"
          cx={x0 + r() * (x1 - x0)}
          cy={y}
          r={1.5 + r() * 2.5}
          fill={color}
          style={{ animationDelay: `${(r() * 6).toFixed(2)}s`, animationDuration: `${(4 + r() * 4).toFixed(2)}s` }}
        />
      ))}
    </g>
  )
}

export function PineRow({ seed, y, count, minH, maxH, color }: { seed: number; y: number; count: number; minH: number; maxH: number; color: string }) {
  const r = rng(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = (i / count) * (W + 100) - 50 + r() * 30
    const h = minH + r() * (maxH - minH)
    const w = h * (0.28 + r() * 0.1)
    // سه طبقه‌ی مثلثی
    for (let k = 0; k < 3; k++) {
      const top = y - h + k * h * 0.22
      const bw = w * (0.55 + k * 0.25)
      d += `M${x},${top} L${x - bw / 2},${top + h * 0.42} L${x + bw / 2},${top + h * 0.42} Z `
    }
  }
  return (
    <g fill={color}>
      <path d={d} />
      <rect x={-50} y={y - 4} width={W + 100} height={H - y + 4} />
    </g>
  )
}

/** قلعه: چند برج با کنگره و سقف مخروطی و پنجره‌های روشن */
export function Castle({ x, y, s, color, windowColor = '#ffcf7a', lit = true }: { x: number; y: number; s: number; color: string; windowColor?: string; lit?: boolean }) {
  const towers = [
    { dx: -150, w: 50, h: 230, roof: 70 },
    { dx: -80, w: 70, h: 160, roof: 0 },
    { dx: 0, w: 70, h: 340, roof: 110 },
    { dx: 80, w: 60, h: 200, roof: 0 },
    { dx: 145, w: 46, h: 260, roof: 80 },
  ]
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-175} y={-120} width={350} height={120} fill={color} />
      {towers.map((t, i) => (
        <g key={i} fill={color}>
          <rect x={t.dx - t.w / 2} y={-t.h} width={t.w} height={t.h} />
          {t.roof > 0 ? (
            <path d={`M${t.dx - t.w / 2 - 8},${-t.h} L${t.dx},${-t.h - t.roof} L${t.dx + t.w / 2 + 8},${-t.h} Z`} />
          ) : (
            Array.from({ length: 4 }, (_, k) => (
              <rect key={k} x={t.dx - t.w / 2 + k * (t.w / 3.5)} y={-t.h - 12} width={t.w / 7} height={12} />
            ))
          )}
          {lit && i % 2 === 0 && (
            <rect className="flicker" x={t.dx - 5} y={-t.h + 40} width={10} height={18} rx={5} fill={windowColor} />
          )}
        </g>
      ))}
      <path d="M-25,0 L-25,-50 Q0,-80 25,-50 L25,0 Z" fill="#000" opacity={0.5} />
    </g>
  )
}

/** پرتوهای نور مورب */
export function Rays({ x, y, color, count = 5, spread = 600, len = 1100, opacity = 0.08 }: { x: number; y: number; color: string; count?: number; spread?: number; len?: number; opacity?: number }) {
  return (
    <g opacity={opacity} className="breathe">
      {Array.from({ length: count }, (_, i) => {
        const off = (i - (count - 1) / 2) * (spread / count)
        return <path key={i} d={`M${x + off},${y} L${x + off * 2.4 - 60},${y + len} L${x + off * 2.4 + 60},${y + len} Z`} fill={color} />
      })}
    </g>
  )
}

/** اژدهای در حال پرواز (برای صحنه‌ی سپیده) */
export function FlyingDragon({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill={color}>
      <g className="float">
      <path d="M-120,10 C-60,-10 40,-10 100,0 C130,4 150,-10 170,-20 L160,0 C150,15 120,20 100,18 C40,25 -40,25 -120,10 Z" />
      <path d="M-120,10 C-160,12 -200,30 -240,25 C-200,20 -170,5 -130,0 Z" />
      <path className="flap" d="M-30,0 C-40,-60 -90,-120 -150,-140 C-110,-100 -100,-70 -110,-40 C-80,-50 -60,-30 -50,-10 Z" />
      <path className="flap" d="M20,0 C30,-70 60,-130 120,-160 C90,-110 85,-80 95,-50 C70,-55 50,-30 40,-8 Z" />
      {/* دو سوار */}
      <circle cx={-5} cy={-12} r={6} />
      <circle cx={-22} cy={-11} r={5.5} />
      </g>
    </g>
  )
}

/** گروهی با تاریِ گاوسی؛ برای ابر و کهکشان */
export function Soft({ blur, children, opacity = 1 }: { blur: number; children: ReactNode; opacity?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <g opacity={opacity}>
      <defs>
        <filter id={`soft-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      <g filter={`url(#soft-${id})`}>{children}</g>
    </g>
  )
}
