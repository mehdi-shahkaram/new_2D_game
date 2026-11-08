import type { ReactNode } from 'react'
import { Castle, Embers, FlyingDragon, Fog, H, PineRow, Rays, Soft, Stars, W, ridge, rng } from './procedural'

// پس‌زمینه‌های SVG. هر کدام فقط تا وقتی تصویرِ واقعی در public/images/bg نباشد دیده می‌شود.

function Sky({ id, stops }: { id: string; stops: [number, string][] }) {
  return (
    <>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${id})`} />
    </>
  )
}

function Glow({ id, cx, cy, r, color, opacity = 1 }: { id: string; cx: number; cy: number; r: number; color: string; opacity?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#glow-${id})`} />
    </>
  )
}

function Moon({ id, cx, cy, r }: { id: string; cx: number; cy: number; r: number }) {
  return (
    <g>
      <Glow id={`moon-${id}`} cx={cx} cy={cy} r={r * 5} color="#cfd8ff" opacity={0.35} />
      <circle cx={cx} cy={cy} r={r} fill="#f3f0e6" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.18} fill="#dcd6c6" />
      <circle cx={cx + r * 0.35} cy={cy + r * 0.25} r={r * 0.12} fill="#dcd6c6" />
    </g>
  )
}

const Dream = () => (
  <>
    <Sky id="dream" stops={[[0, '#0a0620'], [0.55, '#2a1650'], [1, '#4a2a6e']]} />
    <Stars seed={3} count={160} />
    <Moon id="dream" cx={420} cy={200} r={70} />
    <path d={ridge(11, 700, 90, { smooth: true })} fill="#1d1238" />
    {/* صخره و برج */}
    <path d="M640,900 L700,620 L760,560 L840,560 L900,620 L960,900 Z" fill="#140c28" />
    <rect x={745} y={300} width={110} height={270} fill="#140c28" />
    <path d="M735,300 L800,190 L865,300 Z" fill="#140c28" />
    <Glow id="dream-win" cx={800} cy={380} r={70} color="#ffd98a" opacity={0.6} />
    <path className="flicker" d="M785,400 L785,365 Q800,345 815,365 L815,400 Z" fill="#ffe1a0" />
    <Fog y={760} h={90} color="#8d74c4" opacity={0.25} speed={80} />
    <Fog y={850} h={110} color="#b49ae0" opacity={0.2} speed={55} reverse />
  </>
)

const Village = () => (
  <>
    <Sky id="village" stops={[[0, '#2c3e6e'], [0.45, '#c98a8a'], [0.75, '#f6c38b'], [1, '#f9dca8']]} />
    <Glow id="sun-v" cx={420} cy={640} r={420} color="#ffd59a" opacity={0.7} />
    <circle cx={420} cy={640} r={60} fill="#fff1c9" />
    <path d={ridge(21, 600, 120)} fill="#7d7aa6" opacity={0.7} />
    <path d={ridge(22, 690, 70, { smooth: true })} fill="#5a5578" />
    {/* خانه‌ها */}
    <g fill="#2a2338">
      {[
        [180, 120, 90],
        [330, 150, 110],
        [520, 110, 80],
        [930, 140, 100],
        [1110, 170, 120],
        [1330, 120, 90],
      ].map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={770 - h} width={w} height={h + 40} />
          <path d={`M${x - 15},${770 - h} L${x + w / 2},${770 - h - w * 0.55} L${x + w + 15},${770 - h} Z`} />
          {i % 2 === 0 && <rect className="flicker" x={x + w * 0.35} y={770 - h + 25} width={22} height={26} fill="#ffcf7a" />}
        </g>
      ))}
      <rect x={1150} y={570} width={22} height={60} />
    </g>
    <g className="smoke" fill="#e9d6c8" opacity={0.35}>
      <circle cx={1161} cy={550} r={16} />
      <circle cx={1175} cy={515} r={22} />
      <circle cx={1195} cy={470} r={28} />
    </g>
    <path d={ridge(23, 820, 20, { smooth: true })} fill="#1b1626" />
    <Fog y={780} h={60} color="#ffe3c4" opacity={0.18} speed={90} />
  </>
)

const Forge = () => (
  <>
    <rect width={W} height={H} fill="#1a0f0a" />
    <Glow id="forge" cx={360} cy={620} r={800} color="#ff7a2a" opacity={0.55} />
    {/* دیوار سنگی */}
    <g stroke="#2b1a12" strokeWidth={3} opacity={0.6}>
      {Array.from({ length: 9 }, (_, row) => (
        <g key={row}>
          <line x1={0} y1={row * 80} x2={W} y2={row * 80} />
          {Array.from({ length: 12 }, (_, c) => (
            <line key={c} x1={c * 150 + (row % 2) * 75} y1={row * 80} x2={c * 150 + (row % 2) * 75} y2={row * 80 + 80} />
          ))}
        </g>
      ))}
    </g>
    {/* کوره */}
    <path d="M160,900 L160,520 Q360,400 560,520 L560,900 Z" fill="#120a07" />
    <path className="flicker" d="M240,800 L240,640 Q360,560 480,640 L480,800 Z" fill="#ff8a33" />
    <path className="flicker-slow" d="M280,800 L290,690 Q360,630 430,690 L440,800 Z" fill="#ffd27a" />
    {/* پنجره */}
    <rect x={1180} y={180} width={160} height={200} fill="#5a6fa0" opacity={0.6} />
    <path d="M1260,180 L1260,380 M1180,280 L1340,280" stroke="#1a0f0a" strokeWidth={10} />
    {/* سندان */}
    <path d="M820,760 L1080,760 L1040,720 L860,720 Q790,720 780,690 L1100,690 L1100,720 L1040,720 M900,760 L880,900 L1020,900 L1000,760 Z" fill="#0d0806" />
    {/* ابزارهای آویزان */}
    <g stroke="#0d0806" strokeWidth={10} strokeLinecap="round">
      <line x1={700} y1={100} x2={700} y2={300} />
      <line x1={780} y1={100} x2={780} y2={260} />
      <line x1={860} y1={100} x2={860} y2={330} />
    </g>
    <g fill="#0d0806">
      <rect x={680} y={290} width={40} height={30} />
      <circle cx={780} cy={270} r={18} />
      <path d="M840,330 L880,330 L860,370 Z" />
    </g>
    <Embers seed={5} count={30} x0={240} x1={500} y={640} />
  </>
)

const Forest = () => {
  const r = rng(77)
  return (
    <>
      <Sky id="forest" stops={[[0, '#1b2e2a'], [0.5, '#3f5e4c'], [1, '#9cb38f']]} />
      <Rays x={1100} y={-50} color="#fff4c4" count={6} spread={700} opacity={0.12} />
      <PineRow seed={31} y={620} count={34} minH={180} maxH={320} color="#2f4a3c" />
      <Fog y={600} h={70} color="#c8dcc4" opacity={0.3} speed={70} />
      <PineRow seed={32} y={720} count={22} minH={260} maxH={420} color="#1e3127" />
      {/* درختان بلوطِ نزدیک */}
      {[90, 1480].map((x, i) => (
        <g key={i} fill="#0d1712">
          <rect x={x - 35} y={150} width={70} height={750} />
          {Array.from({ length: 7 }, (_, k) => (
            <circle key={k} cx={x + (r() - 0.5) * 320} cy={80 + r() * 200} r={90 + r() * 70} />
          ))}
        </g>
      ))}
      <path d={ridge(33, 840, 25, { smooth: true })} fill="#0e1a14" />
      <path d="M560,900 Q760,760 820,740 Q900,760 1060,900 Z" fill="#3c4a36" opacity={0.6} />
      <Fog y={830} h={80} color="#dfe9d6" opacity={0.25} speed={50} reverse />
    </>
  )
}

const Pass = () => (
  <>
    <Sky id="pass" stops={[[0, '#2a0f1e'], [0.45, '#8a2a2a'], [0.8, '#e0703a'], [1, '#f2a65a']]} />
    <Glow id="sun-p" cx={800} cy={640} r={500} color="#ffb060" opacity={0.6} />
    <path d={ridge(41, 560, 160, { step: 30, jag: 0.6 })} fill="#4a1a22" />
    <g opacity={0.9}>
      <path d="M1020,900 L1150,420 L1210,380 L1300,420 L1420,900 Z" fill="#2a0e14" />
      <Castle x={1220} y={400} s={0.42} color="#2a0e14" />
    </g>
    <path d={ridge(42, 700, 120, { step: 25, jag: 0.8 })} fill="#1e0a10" />
    <path d="M200,900 L260,640 Q380,560 500,640 L560,900 Z" fill="#0b0407" />
    <Glow id="cave-p" cx={380} cy={760} r={140} color="#ff5a1a" opacity={0.6} />
    <path d="M300,900 L320,760 Q380,700 440,760 L460,900 Z" fill="#0b0407" />
    <Embers seed={9} count={18} x0={300} x1={460} y={760} color="#ff7a3a" />
    <Fog y={640} h={40} color="#ffb7a0" opacity={0.15} speed={60} />
  </>
)

const Lair = () => (
  <>
    <rect width={W} height={H} fill="#0a0406" />
    <Glow id="lair" cx={800} cy={950} r={900} color="#ff4a12" opacity={0.55} />
    <Glow id="lair2" cx={800} cy={420} r={500} color="#ff8a3a" opacity={0.12} />
    {/* دیواره‌های غار */}
    <path d="M0,0 L0,900 L180,900 C230,700 160,520 260,380 C330,260 240,120 320,0 Z" fill="#050203" />
    <path d="M1600,0 L1600,900 L1420,900 C1370,700 1450,520 1340,380 C1270,260 1360,120 1280,0 Z" fill="#050203" />
    <path d="M0,0 L1600,0 L1600,90 C1300,150 1100,60 800,120 C500,60 300,150 0,90 Z" fill="#050203" />
    {/* استالاکتیت */}
    <g fill="#050203">
      {[380, 520, 690, 930, 1080, 1220].map((x, i) => (
        <path key={i} d={`M${x - 30},100 L${x},${180 + (i % 3) * 50} L${x + 30},100 Z`} />
      ))}
    </g>
    <path d={ridge(51, 860, 40, { step: 30, jag: 0.6 })} fill="#120608" />
    <Embers seed={13} count={40} x0={200} x1={1400} y={880} color="#ff8a3a" />
    <Fog y={820} h={70} color="#5a2a2a" opacity={0.35} speed={40} />
  </>
)

const Gate = () => (
  <>
    <Sky id="gate" stops={[[0, '#05070f'], [0.6, '#1a2238'], [1, '#2c3550']]} />
    <Stars seed={61} count={120} maxY={400} />
    <Moon id="gate" cx={1350} cy={150} r={55} />
    {/* دیوار و دروازه */}
    <rect x={0} y={260} width={W} height={640} fill="#141826" />
    <g fill="#141826">
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 84} y={226} width={50} height={40} />
      ))}
    </g>
    <rect x={180} y={120} width={240} height={780} fill="#10131f" />
    <rect x={1180} y={120} width={240} height={780} fill="#10131f" />
    <g fill="#10131f">
      {[180, 1180].map((x) =>
        Array.from({ length: 4 }, (_, k) => <rect key={`${x}-${k}`} x={x + k * 64} y={86} width={44} height={40} />),
      )}
    </g>
    <path d="M560,900 L560,470 Q800,250 1040,470 L1040,900 Z" fill="#07080e" />
    <path d="M600,900 L600,490 Q800,300 1000,490 L1000,900 Z" fill="#1b1a22" />
    <path d="M800,330 L800,900" stroke="#07080e" strokeWidth={8} />
    {/* نوشته‌ی کنده‌شده که می‌درخشد */}
    <g className="breathe" stroke="#9ad1ff" strokeWidth={3} strokeLinecap="round" opacity={0.7}>
      <path d="M650,560 h120 M660,590 h100 M650,620 h110" />
      <path d="M840,560 h110 M850,590 h90 M840,620 h120" />
    </g>
    <Fog y={830} h={110} color="#9fb0d8" opacity={0.25} speed={70} />
    <Fog y={900} h={130} color="#c6d2ee" opacity={0.2} speed={45} reverse />
  </>
)

const Hall = () => {
  const pillars = [180, 470, 1130, 1420]
  return (
    <>
      <rect width={W} height={H} fill="#0e0b12" />
      <Glow id="hall" cx={800} cy={420} r={600} color="#ffb060" opacity={0.18} />
      {/* فرش با پرسپکتیو */}
      <path d="M700,500 L900,500 L1250,900 L350,900 Z" fill="#4a1420" />
      <path d="M0,500 L1600,500 L1600,900 L0,900 Z" fill="#17121c" opacity={0.6} />
      <path d="M700,500 L900,500 L1250,900 L350,900 Z" fill="#5a1828" />
      {/* پلکان مارپیچ در ته تالار */}
      <path d="M720,500 L720,260 Q800,200 880,260 L880,500 Z" fill="#07060a" />
      <g stroke="#2a2030" strokeWidth={6}>
        {[280, 330, 380, 430, 480].map((y, i) => (
          <line key={i} x1={i % 2 ? 740 : 800} y1={y} x2={i % 2 ? 820 : 870} y2={y - 20} />
        ))}
      </g>
      {pillars.map((x, i) => {
        const near = i === 0 || i === 3
        const w = near ? 130 : 80
        return (
          <g key={x}>
            <rect x={x - w / 2} y={0} width={w} height={H} fill={near ? '#08060b' : '#120e18'} />
            <rect x={x - w / 2 - 15} y={near ? 760 : 470} width={w + 30} height={30} fill={near ? '#08060b' : '#120e18'} />
            {!near && (
              <g>
                <Glow id={`torch-${i}`} cx={x} cy={300} r={120} color="#ffa040" opacity={0.6} />
                <rect x={x - 6} y={300} width={12} height={40} fill="#2a1a10" />
                <path className="flicker" d={`M${x - 12},300 Q${x},250 ${x + 12},300 Z`} fill="#ffc060" />
              </g>
            )}
          </g>
        )
      })}
      <Embers seed={71} count={12} x0={400} x1={1200} y={320} color="#ffc070" />
    </>
  )
}

const Tower = () => (
  <>
    <rect width={W} height={H} fill="#100e18" />
    {/* پنجره‌ی بزرگ با ماه */}
    <defs>
      <clipPath id="tower-win">
        <path d="M560,700 L560,300 Q800,40 1040,300 L1040,700 Z" />
      </clipPath>
    </defs>
    <g clipPath="url(#tower-win)">
      <rect x={540} y={0} width={520} height={720} fill="#1c2448" />
      <Stars seed={81} count={60} />
      <Moon id="tower" cx={800} cy={260} r={90} />
      <Fog y={640} h={80} color="#8a9ad0" opacity={0.4} speed={60} />
    </g>
    <path d="M560,700 L560,300 Q800,40 1040,300 L1040,700 Z" fill="none" stroke="#06050a" strokeWidth={30} />
    <path d="M800,90 L800,700 M560,420 L1040,420" stroke="#06050a" strokeWidth={14} />
    <Rays x={800} y={300} color="#cfd8ff" count={4} spread={300} len={700} opacity={0.07} />
    <rect x={500} y={690} width={600} height={40} fill="#07060b" />
    {/* شمع */}
    <Glow id="candle" cx={1300} cy={600} r={260} color="#ffb060" opacity={0.35} />
    <rect x={1288} y={610} width={24} height={90} fill="#e8dcc0" />
    <path className="flicker" d="M1290,610 Q1300,560 1310,610 Z" fill="#ffd27a" />
    <rect x={1180} y={700} width={240} height={200} fill="#0a0810" />
    <path d={ridge(91, 880, 10, { smooth: true })} fill="#07060b" />
  </>
)

const Sunrise = () => (
  <>
    <Sky id="sunrise" stops={[[0, '#3a4e8c'], [0.4, '#e89aa0'], [0.7, '#ffcf8a'], [1, '#fff0c8']]} />
    <Glow id="sun-s" cx={800} cy={720} r={700} color="#fff0b0" opacity={0.8} />
    <circle cx={800} cy={720} r={90} fill="#fffbe8" />
    <Soft blur={14} opacity={0.55}>
      <g fill="#fff">
        <ellipse cx={300} cy={260} rx={180} ry={30} />
        <ellipse cx={1250} cy={200} rx={220} ry={34} />
        <ellipse cx={1100} cy={340} rx={140} ry={22} />
      </g>
    </Soft>
    <FlyingDragon x={620} y={360} s={0.9} color="#2a2236" />
    <path d={ridge(101, 760, 90)} fill="#9a7a9a" opacity={0.6} />
    <Fog y={800} h={90} color="#fff" opacity={0.45} speed={70} />
    <path d={ridge(102, 860, 60, { smooth: true })} fill="#6a5070" opacity={0.7} />
  </>
)

const Valley = () => (
  <>
    <Sky id="valley" stops={[[0, '#6a9ad8'], [0.6, '#cfe2f0'], [1, '#fdf2d8']]} />
    <Glow id="sun-va" cx={1300} cy={220} r={360} color="#fff6d0" opacity={0.8} />
    <circle cx={1300} cy={220} r={55} fill="#fffbe8" />
    <path d={ridge(111, 560, 140)} fill="#8aa0c0" opacity={0.7} />
    {/* قلعه‌ی ویران در دوردست */}
    <g opacity={0.6}>
      <Castle x={460} y={560} s={0.35} color="#6a6a80" lit={false} />
    </g>
    <Fog y={560} h={50} color="#fff" opacity={0.5} speed={90} />
    <path d={ridge(112, 700, 60, { smooth: true })} fill="#6f9a5a" />
    <path d={ridge(113, 800, 40, { smooth: true })} fill="#4c7a40" />
    <path d={ridge(114, 880, 20, { smooth: true })} fill="#335a2c" />
  </>
)

const NightStars = () => (
  <>
    <Sky id="stars" stops={[[0, '#03040c'], [0.7, '#141a38'], [1, '#26244a']]} />
    <Soft blur={50} opacity={0.3}>
      <g transform="rotate(-18 800 400)">
        <ellipse cx={800} cy={380} rx={1000} ry={80} fill="#b8b0ff" />
        <ellipse cx={700} cy={385} rx={500} ry={35} fill="#e6e0ff" />
      </g>
    </Soft>
    <Stars seed={121} count={320} maxY={760} />
    <path d={ridge(122, 760, 60, { smooth: true })} fill="#0a0b18" />
    {/* بقایای برج */}
    <path d="M1150,760 L1160,560 L1190,540 L1210,580 L1240,550 L1250,760 Z" fill="#06070f" />
    {/* دو نفر */}
    <g fill="#06070f">
      <circle cx={760} cy={690} r={11} />
      <path d="M745,700 L775,700 L782,760 L738,760 Z" />
      <circle cx={790} cy={694} r={10} />
      <path d="M776,703 L804,703 L812,760 L772,760 Z" />
    </g>
    <path d={ridge(123, 860, 30, { smooth: true })} fill="#030409" />
  </>
)

export const SCENES: Record<string, () => ReactNode> = {
  black: () => <rect width={W} height={H} fill="#000" />,
  dream: Dream,
  village: Village,
  forge: Forge,
  forest: Forest,
  pass: Pass,
  lair: Lair,
  gate: Gate,
  hall: Hall,
  tower: Tower,
  sunrise: Sunrise,
  valley: Valley,
  stars: NightStars,
}
