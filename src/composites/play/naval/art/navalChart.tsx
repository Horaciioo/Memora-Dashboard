import { NAVAL_BANNER } from '@/declarations/play/naval/banner'

interface Rose {
  x: number
  y: number
  r: number
}

interface Ship {
  x: number
  y: number
  length: number
  angle: number
}

/**
 * Night chart ground: sea, cell grid, edge letters and soundings
 * @param {object} props - Size, scale and soundings flag
 * @return {JSX.Element}
 */

export const NavalSea = ({
  width,
  height,
  scale = 1,
  soundings = false,
}: {
  width: number
  height: number
  scale?: number
  soundings?: boolean
}) => {
  const cell = NAVAL_BANNER.cell * scale

  return (
    <>
      <rect width={width} height={height} style={{ fill: 'var(--play-naval-night)' }} />
      <g style={{ stroke: 'var(--naval-brass-faint)' }} strokeWidth="1" strokeDasharray="2 6">
        {Array.from({ length: Math.ceil(width / cell) }, (_, index) => (
          <path key={`v${index}`} d={`M${index * cell} 0V${height}`} />
        ))}
        {Array.from({ length: Math.ceil(height / cell) }, (_, index) => (
          <path key={`h${index}`} d={`M0 ${index * cell}H${width}`} />
        ))}
      </g>
      <g
        style={{ fill: 'var(--naval-brass)', fontFamily: 'var(--font-mono)' }}
        opacity="0.5"
        fontSize={13 * scale}
        textAnchor="middle"
      >
        {Array.from({ length: Math.ceil(width / cell) }, (_, index) => (
          <text key={`c${index}`} x={index * cell + cell / 2} y={height - 10 * scale}>
            {NAVAL_BANNER.columns[index % NAVAL_BANNER.columns.length]}
          </text>
        ))}
      </g>
      {soundings && (
        <g
          style={{ fill: 'var(--naval-brass)', fontFamily: 'var(--font-mono)' }}
          opacity="0.35"
          fontSize="14"
          fontStyle="italic"
        >
          {NAVAL_BANNER.soundings.map((sounding) => (
            <text key={`${sounding.x}-${sounding.y}`} x={sounding.x} y={sounding.y}>
              {sounding.depth}
            </text>
          ))}
        </g>
      )}
    </>
  )
}

/**
 * Engraved compass rose with its rhumb lines across the chart
 * @param {object} props - Rose and line reach
 * @return {JSX.Element}
 */

export const NavalRose = ({ rose, reach }: { rose: Rose; reach: number }) => {
  const { x, y, r } = rose
  const long = (angle: number, size: number, width: number) => {
    const tip = (Math.PI / 180) * angle
    const side = tip + Math.PI / 2
    const point = (radius: number, a: number) =>
      `${x + Math.cos(a) * radius} ${y + Math.sin(a) * radius}`

    return `M${point(size, tip)}L${point(width, side)}L${x} ${y}Z M${point(size, tip)}L${point(width, side + Math.PI)}L${x} ${y}Z`
  }

  return (
    <g>
      <g style={{ stroke: 'var(--naval-brass)' }} strokeWidth="0.8" opacity="0.22">
        {Array.from({ length: NAVAL_BANNER.rhumbs }, (_, index) => {
          const angle = (index / NAVAL_BANNER.rhumbs) * Math.PI * 2

          return (
            <path
              key={index}
              d={`M${x} ${y}L${x + Math.cos(angle) * reach * 2} ${y + Math.sin(angle) * reach * 2}`}
            />
          )
        })}
      </g>
      <g fill="none" style={{ stroke: 'var(--naval-brass)' }}>
        <circle cx={x} cy={y} r={r} strokeWidth="1.5" opacity="0.7" />
        <circle
          cx={x}
          cy={y}
          r={r * 0.93}
          strokeWidth="0.8"
          opacity="0.5"
          strokeDasharray={`1 ${r * 0.035}`}
        />
        <circle cx={x} cy={y} r={r * 0.62} strokeWidth="0.8" opacity="0.4" />
      </g>
      <g style={{ fill: 'var(--naval-brass)' }}>
        {[45, 135, 225, 315].map((angle) => (
          <path key={angle} d={long(angle - 90, r * 0.55, r * 0.07)} opacity="0.35" />
        ))}
        {[0, 90, 180, 270].map((angle) => (
          <path key={angle} d={long(angle - 90, r * 0.9, r * 0.1)} opacity="0.75" />
        ))}
      </g>
      <text
        x={x}
        y={y - r - r * 0.06}
        textAnchor="middle"
        fontSize={r * 0.16}
        fontWeight="700"
        style={{ fill: 'var(--naval-brass)' }}
      >
        N
      </text>
    </g>
  )
}

/**
 * Ship engraved as a hull with its cells, seen from above
 * @param {object} props - Ship and scale
 * @return {JSX.Element}
 */

export const NavalHull = ({ ship, scale = 1 }: { ship: Ship; scale?: number }) => {
  const half = (ship.length * 22) / 2

  return (
    <g
      transform={`translate(${ship.x} ${ship.y}) rotate(${ship.angle}) scale(${scale})`}
      fill="none"
      style={{ stroke: 'var(--naval-sonar)' }}
      strokeWidth="1.6"
    >
      <path d={`M${-half} -9H${half - 10}L${half + 6} 0L${half - 10} 9H${-half}Z`} />
      {Array.from({ length: ship.length - 1 }, (_, index) => (
        <path key={index} d={`M${-half + (index + 1) * 22} -9V9`} opacity="0.5" />
      ))}
    </g>
  )
}
