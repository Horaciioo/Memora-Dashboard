import { BOMB_PRINT } from '@/declarations/play/bomb/art'

/**
 * Halftone patterns and masks of a screen-print sheet
 * @param {object} props - Id prefix
 * @return {JSX.Element}
 */

export const BombPrintDefs = ({ id }: { id: string }) => (
  <>
    <pattern id={`${id}-dots`} width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="6" r="2.6" style={{ fill: 'var(--play-bomb)' }} />
    </pattern>
    <pattern
      id={`${id}-shine`}
      width="9"
      height="9"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <circle cx="4.5" cy="4.5" r="2.2" style={{ fill: 'var(--play-bomb-cream)' }} />
    </pattern>
    <radialGradient id={`${id}-fade`}>
      <stop offset="0" stopColor="white" />
      <stop offset="1" stopColor="white" stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${id}-spot`} cx="0.32" cy="0.3" r="0.45">
      <stop offset="0" stopColor="white" />
      <stop offset="1" stopColor="white" stopOpacity="0" />
    </radialGradient>
    <mask id={`${id}-halo`} maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill={`url(#${id}-fade)`} />
    </mask>
    <mask id={`${id}-gleam`} maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill={`url(#${id}-spot)`} />
    </mask>
  </>
)

/**
 * Sunburst of the poster, alternating ink wedges
 * @param {object} props - Centre, reach and wedge count
 * @return {JSX.Element}
 */

export const BombRays = ({
  x,
  y,
  reach,
  count,
}: {
  x: number
  y: number
  reach: number
  count: number
}) => {
  const step = (Math.PI * 2) / count

  return (
    <g style={{ fill: 'var(--play-bomb)' }} opacity={BOMB_PRINT.rayOpacity}>
      {Array.from({ length: count / 2 }, (_, index) => {
        const from = index * 2 * step
        const to = from + step
        const point = (angle: number) =>
          `${x + Math.cos(angle) * reach} ${y + Math.sin(angle) * reach}`

        return <path key={index} d={`M${x} ${y}L${point(from)}L${point(to)}Z`} />
      })}
    </g>
  )
}

/**
 * The bomb in two inks, the orange plate printed off register
 * @param {object} props - Centre, radius and id prefix
 * @return {JSX.Element}
 */

export const BombBody = ({ x, y, r, id }: { x: number; y: number; r: number; id: string }) => {
  const shift = r * BOMB_PRINT.register

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r * 1.9}
        fill={`url(#${id}-dots)`}
        mask={`url(#${id}-halo)`}
        opacity="0.55"
      />
      <g transform={`rotate(32 ${x} ${y})`}>
        <rect
          x={x - r * 0.24 + shift}
          y={y - r * 1.2 + shift}
          width={r * 0.48}
          height={r * 0.34}
          rx={r * 0.07}
          style={{ fill: 'var(--play-bomb)' }}
        />
        <rect
          x={x - r * 0.24}
          y={y - r * 1.2}
          width={r * 0.48}
          height={r * 0.34}
          rx={r * 0.07}
          style={{ fill: 'var(--play-bomb-stock)', stroke: 'var(--play-bomb-cream)' }}
          strokeWidth={r * 0.025}
        />
        <path
          d={`M${x - r * 0.16} ${y - r * 1.08}h${r * 0.32}`}
          style={{ stroke: 'var(--play-bomb-cream)' }}
          strokeWidth={r * 0.035}
          strokeLinecap="round"
        />
      </g>
      <circle cx={x + shift} cy={y + shift} r={r} style={{ fill: 'var(--play-bomb)' }} />
      <circle cx={x} cy={y} r={r} style={{ fill: 'var(--play-bomb-stock)' }} />
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-shine)`} mask={`url(#${id}-gleam)`} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        style={{ stroke: 'var(--play-bomb-cream)' }}
        strokeWidth={r * 0.025}
      />
    </g>
  )
}

/**
 * Syllable stamped in two inks, outline over an offset fill
 * @param {object} props - Place, angle, size and text
 * @return {JSX.Element}
 */

export const BombStamp = ({
  x,
  y,
  angle,
  size,
  text,
}: {
  x: number
  y: number
  angle: number
  size: number
  text: string
}) => (
  <g
    transform={`translate(${x} ${y}) rotate(${angle})`}
    fontSize={size}
    fontWeight="900"
    textAnchor="middle"
    letterSpacing={size * 0.04}
  >
    <text x={size * 0.05} y={size * 0.05} style={{ fill: 'var(--play-bomb)' }} opacity="0.55">
      {text}
    </text>
    <text
      fill="none"
      style={{ stroke: 'var(--play-bomb-cream)' }}
      strokeWidth={size * 0.02}
      opacity="0.7"
    >
      {text}
    </text>
  </g>
)
