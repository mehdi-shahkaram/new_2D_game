import type { ReactNode } from 'react'

// شخصیت‌ها به شکل سایه‌نما (silhouette) با نورِ لبه‌ای به رنگِ هر شخصیت.
// تا وقتی تصویرِ واقعی در public/images/char نباشد، همین‌ها نمایش داده می‌شوند.

const INK = '#0b0912'

function Rim({ id, color, children, strength = 1 }: { id: string; color: string; children: ReactNode; strength?: number }) {
  return (
    <>
      <defs>
        <filter id={`rim-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={2} result="d" />
          <feGaussianBlur in="d" stdDeviation={7} result="b" />
          <feFlood floodColor={color} floodOpacity={strength} />
          <feComposite in2="b" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`edge-${id}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={0.35} />
          <stop offset="0.25" stopColor={INK} stopOpacity={1} />
        </linearGradient>
      </defs>
      <g filter={`url(#rim-${id})`} fill={`url(#edge-${id})`}>
        {children}
      </g>
    </>
  )
}

function Nilufar({ mood }: { mood?: string }) {
  const color = mood === 'happy' ? '#ffd2e6' : '#d7b8ff'
  return (
    <svg viewBox="0 0 400 600" className={mood === 'dream' ? 'char-svg dreamy' : 'char-svg'}>
      <Rim id={`nilufar-${mood ?? 'n'}`} color={color}>
        {/* موی بلند پشت سر */}
        <path d="M200,72 C138,72 124,140 132,205 C138,290 116,380 104,470 C150,452 250,452 296,470 C284,380 262,290 268,205 C276,140 262,72 200,72 Z" />
        {/* تنه و شانه‌ها با پیراهن */}
        <path d="M200,232 C156,236 118,252 102,298 C86,360 92,480 78,600 L322,600 C308,480 314,360 298,298 C282,252 244,236 200,232 Z" />
        <rect x={182} y={190} width={36} height={56} />
        <ellipse cx={200} cy={152} rx={48} ry={58} />
        {/* موی جلو */}
        <path d="M152,150 C150,100 182,84 210,86 C240,88 258,112 250,150 C236,124 214,112 190,116 C172,120 160,134 152,150 Z" />
      </Rim>
      {/* گلِ نیلوفر در مو */}
      <g transform="translate(244,118)" className="breathe">
        <circle r={16} fill={color} opacity={0.25} />
        <path d="M0,-9 C5,-3 5,3 0,7 C-5,3 -5,-3 0,-9 Z M-9,1 C-3,-2 1,2 0,7 C-6,7 -9,4 -9,1 Z M9,1 C3,-2 -1,2 0,7 C6,7 9,4 9,1 Z" fill={color} />
      </g>
    </svg>
  )
}

function Bahram() {
  return (
    <svg viewBox="0 0 400 600" className="char-svg">
      <Rim id="bahram" color="#ffbf6b">
        {/* چکش روی شانه */}
        <path d="M296,430 L344,170 L358,173 L310,433 Z" />
        <rect x={318} y={132} width={70} height={44} rx={6} transform="rotate(10 353 154)" />
        {/* تنه‌ی پهن */}
        <path d="M200,236 C128,238 70,258 50,320 C36,380 40,500 36,600 L364,600 C360,500 364,380 350,320 C330,258 272,238 200,236 Z" />
        <rect x={176} y={196} width={48} height={56} />
        <ellipse cx={200} cy={150} rx={50} ry={56} />
        {/* ریش */}
        <path d="M152,160 C148,226 172,284 200,298 C228,284 252,226 248,160 C236,190 220,200 200,200 C180,200 164,190 152,160 Z" />
      </Rim>
      {/* بندهای پیش‌بند */}
      <path d="M150,330 L170,600 M250,330 L230,600" stroke="#3a2412" strokeWidth={8} opacity={0.8} />
    </svg>
  )
}

function Wanderer() {
  return (
    <svg viewBox="0 0 400 600" className="char-svg">
      <Rim id="wanderer" color="#a8d8a0">
        {/* عصا */}
        <path d="M78,600 L92,110 L104,110 L92,600 Z" />
        <circle cx={98} cy={104} r={14} />
        {/* ردای کلاه‌دار */}
        <path d="M205,70 C136,72 118,150 124,228 C84,282 64,360 58,600 L344,600 C338,360 318,282 284,228 C290,150 274,70 205,70 Z" />
        <path d="M92,330 C120,300 150,300 170,320 L160,350 C140,340 118,345 100,360 Z" />
      </Rim>
      {/* چهره‌ی تاریک زیر کلاه و ریشِ سپید */}
      <ellipse cx={204} cy={176} rx={40} ry={50} fill="#050408" />
      <path d="M180,196 C182,240 195,268 204,272 C214,268 226,240 228,196 C218,212 190,212 180,196 Z" fill="#d8d4c8" opacity={0.7} />
      <circle cx={190} cy={170} r={3} fill="#a8d8a0" opacity={0.7} />
      <circle cx={218} cy={170} r={3} fill="#a8d8a0" opacity={0.7} />
    </svg>
  )
}

function Dragon({ mood }: { mood?: string }) {
  const eye = mood === 'friend' ? '#ffd36b' : mood === 'hurt' ? '#c0502a' : '#ff6a2a'
  const dim = mood === 'hurt' ? 0.6 : 1
  return (
    <svg viewBox="0 0 800 600" className={`char-svg dragon ${mood === 'hurt' ? 'dragon-hurt' : ''}`}>
      <Rim id={`dragon-${mood ?? 'n'}`} color="#ff5a3a" strength={0.7}>
        {/* شاخ‌ها */}
        <path d="M290,170 C240,120 200,60 120,20 C190,40 250,80 330,150 Z" />
        <path d="M510,170 C560,120 600,60 680,20 C610,40 550,80 470,150 Z" />
        {/* بال‌ها در پس‌زمینه */}
        <path d="M250,300 C150,250 60,180 0,80 C40,220 60,320 120,420 C160,380 200,360 260,370 Z" />
        <path d="M550,300 C650,250 740,180 800,80 C760,220 740,320 680,420 C640,380 600,360 540,370 Z" />
        {/* سر */}
        <path d="M262,182 C302,120 498,120 538,182 C580,240 562,330 522,380 C502,440 470,520 400,545 C330,520 298,440 278,380 C238,330 220,240 262,182 Z" />
        {/* تیغه‌های گونه */}
        <path d="M252,262 L160,250 L250,302 Z M548,262 L640,250 L550,302 Z M262,320 L190,340 L272,352 Z M538,320 L610,340 L528,352 Z" />
        {/* گردن */}
        <path d="M320,480 L300,600 L500,600 L480,480 Z" />
      </Rim>
      {/* ابروها */}
      <path d="M290,238 L372,252 M510,238 L428,252" stroke="#000" strokeWidth={10} strokeLinecap="round" />
      {/* چشم‌ها */}
      <g className="blink" style={{ opacity: dim }}>
        {[330, 470].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={272} rx={60} ry={30} fill={eye} opacity={0.25} />
            <path d={`M${cx - 34},274 C${cx - 18},250 ${cx + 18},250 ${cx + 34},274 C${cx + 14},288 ${cx - 14},288 ${cx - 34},274 Z`} fill={eye} />
            <ellipse cx={cx} cy={272} rx={mood === 'friend' ? 7 : 4} ry={14} fill="#0a0204" />
          </g>
        ))}
      </g>
      {/* سوراخ‌های بینی */}
      <g className="flicker-slow" style={{ opacity: dim }}>
        <ellipse cx={378} cy={500} rx={9} ry={5} fill={eye} />
        <ellipse cx={422} cy={500} rx={9} ry={5} fill={eye} />
      </g>
    </svg>
  )
}

export const CHARACTER_ART: Record<string, (p: { mood?: string }) => ReactNode> = {
  nilufar: Nilufar,
  bahram: Bahram,
  wanderer: Wanderer,
  dragon: Dragon,
}
