import { LUDO_BANNER } from '@/declarations/play/ludo/banner'

export interface LudoView {
  x: number
  y: number
  cell: number
}

/**
 * Board cell to screen point, isometric
 * @param {LudoView} view - Board top corner and cell size
 * @param {number} u - Column
 * @param {number} v - Row
 * @return {[number, number]} - Screen point
 */

export const iso = (view: LudoView, u: number, v: number): [number, number] => [
  view.x + (u - v) * view.cell * 0.87,
  view.y + (u + v) * view.cell * 0.5,
]

/**
 * Colour of one board cell, white track or a coloured home
 * @param {number} u - Column
 * @param {number} v - Row
 * @return {string | null} - Token, null outside the cross
 */

const cellColour = (u: number, v: number) => {
  const home = LUDO_BANNER.homes.find(
    (entry) => u >= entry.u && u < entry.u + 6 && v >= entry.v && v < entry.v + 6
  )
  if (home) return home.token
  if (u >= 6 && u <= 8 && v >= 6 && v <= 8) return '--play-gold'
  if (u === 7 && v > 0 && v < 6) return '--play-ludo-blue'
  if (u === 7 && v > 8 && v < 14) return '--play-ludo-green'
  if (v === 7 && u > 0 && u < 6) return '--play-ludo-red'
  if (v === 7 && u > 8 && u < 14) return '--play-ludo-yellow'

  return '--ludo-lacquer'
}

/**
 * Wooden table and the lacquered board with its edge
 * @param {object} props - View, id prefix and table size
 * @return {JSX.Element}
 */

export const LudoTable = ({
  view,
  id,
  width,
  height,
}: {
  view: LudoView
  id: string
  width: number
  height: number
}) => {
  const { size } = LUDO_BANNER
  const corners = [iso(view, 0, 0), iso(view, size, 0), iso(view, size, size), iso(view, 0, size)]
  const depth = view.cell * 0.6
  const poly = (points: [number, number][]) => points.map((point) => point.join(' ')).join(' ')
  const plank = height / 7

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" style={{ stopColor: 'var(--ludo-wood-deep)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--ludo-wood)' }} />
          <stop offset="1" style={{ stopColor: 'var(--ludo-wood-deep)' }} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-wood)`} />
      <g style={{ stroke: 'var(--ludo-wood-lit)' }} fill="none" opacity="0.35">
        {Array.from({ length: 8 }, (_, index) => (
          <path
            key={index}
            d={`M0 ${index * plank}C${width * 0.3} ${index * plank + 8} ${width * 0.6} ${index * plank - 10} ${width} ${index * plank + 4}`}
            strokeWidth="1.5"
          />
        ))}
      </g>
      <polygon
        points={poly(
          [corners[0], corners[1], corners[2], corners[3]].map(([x, y]) => [
            x + depth,
            y + depth * 1.6,
          ])
        )}
        fill="black"
        opacity="0.35"
      />
      <polygon
        points={poly([
          corners[3],
          corners[2],
          [corners[2][0], corners[2][1] + depth],
          [corners[3][0], corners[3][1] + depth],
        ])}
        style={{ fill: 'var(--ludo-board-side)' }}
      />
      <polygon
        points={poly([
          corners[2],
          corners[1],
          [corners[1][0], corners[1][1] + depth],
          [corners[2][0], corners[2][1] + depth],
        ])}
        style={{ fill: 'var(--ludo-board-side)' }}
        opacity="0.75"
      />
      <polygon points={poly(corners)} style={{ fill: 'var(--ludo-lacquer)' }} />
      {Array.from({ length: size * size }, (_, index) => {
        const u = index % size
        const v = Math.floor(index / size)
        const isHomeInside = LUDO_BANNER.homes.some(
          (home) => u > home.u && u < home.u + 5 && v > home.v && v < home.v + 5
        )
        const points = poly([
          iso(view, u, v),
          iso(view, u + 1, v),
          iso(view, u + 1, v + 1),
          iso(view, u, v + 1),
        ])

        return (
          <polygon
            key={index}
            points={points}
            style={{
              fill: isHomeInside ? 'var(--ludo-lacquer)' : `var(${cellColour(u, v)})`,
              stroke: 'var(--play-ludo-line)',
            }}
            strokeWidth="1"
          />
        )
      })}
      <polygon points={poly(corners)} fill="white" opacity="0.08" />
    </g>
  )
}

/**
 * Upright pawn: base, body, head and gloss
 * @param {object} props - Screen point, colour and cell size
 * @return {JSX.Element}
 */

export const LudoPawnArt = ({
  x,
  y,
  token,
  cell,
}: {
  x: number
  y: number
  token: string
  cell: number
}) => {
  const s = cell / 46

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx="18" ry="9" fill="black" opacity="0.25" />
      <path
        d="M-15 0C-15 -10 -8 -30 -6 -44H6C8 -30 15 -10 15 0C8 6 -8 6 -15 0Z"
        style={{ fill: `var(${token})` }}
      />
      <circle cy="-50" r="11" style={{ fill: `var(${token})` }} />
      <circle cx="-4" cy="-54" r="4" fill="white" opacity="0.45" />
      <path
        d="M-15 0C-8 6 8 6 15 0"
        fill="none"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
    </g>
  )
}

// Pip spots of the faces drawn, in face units
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  3: [
    [-0.5, -0.5],
    [0, 0],
    [0.5, 0.5],
  ],
  5: [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0, 0],
    [-0.5, 0.5],
    [0.5, 0.5],
  ],
}

/**
 * Isometric die showing a face of pips on top
 * @param {object} props - Screen point, size and face
 * @return {JSX.Element}
 */

export const LudoDieArt = ({ size, face = 5 }: { size: number; face?: number }) => {
  const a = size * 0.87
  const b = size * 0.5
  const pips = PIPS[face] ?? PIPS[1]

  return (
    <g>
      <path d={`M0 ${-b}L${a} 0L0 ${b}L${-a} 0Z`} style={{ fill: 'var(--ludo-lacquer)' }} />
      <path
        d={`M${-a} 0L0 ${b}V${b + size}L${-a} ${size}Z`}
        style={{ fill: 'var(--ludo-board-side)' }}
      />
      <path
        d={`M${a} 0L0 ${b}V${b + size}L${a} ${size}Z`}
        style={{ fill: 'var(--ludo-board-side)' }}
        opacity="0.7"
      />
      {pips.map(([u, v]) => (
        <ellipse
          key={`${u}-${v}`}
          cx={(u - v) * a * 0.5}
          cy={(u + v) * b * 0.5}
          rx={size * 0.11}
          ry={size * 0.065}
          style={{ fill: 'var(--play-ludo-deep)' }}
        />
      ))}
    </g>
  )
}
