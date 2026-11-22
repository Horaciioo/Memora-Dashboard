import { contourPath } from '@/composites/play/concordat/art/contours'
import { CONCORDAT_BANNER } from '@/declarations/play/concordat/banner'

interface Frame {
  massifs: readonly { x: number; y: number; r: number; seed: number }[]
  factions: readonly { x: number; y: number; reach: number; token: string }[]
}

/**
 * Engraved plate: grid, edge labels and the contour lines of each massif
 * @param {object} props - Id prefix, size and frame
 * @return {JSX.Element}
 */

export const ConcordatPlate = ({
  id,
  width,
  height,
  frame,
  scale = 1,
}: {
  id: string
  width: number
  height: number
  frame: Frame
  scale?: number
}) => {
  const { grid, rings, columns } = CONCORDAT_BANNER
  const step = grid * scale

  return (
    <>
      <defs>
        {frame.factions.map((faction, index) => (
          <pattern
            key={faction.token}
            id={`${id}-hatch-${index}`}
            width={9 * scale}
            height={9 * scale}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${35 + index * 50})`}
          >
            <path
              d={`M0 0V${9 * scale}`}
              style={{ stroke: `var(${faction.token})` }}
              strokeWidth={2.4 * scale}
            />
          </pattern>
        ))}
        <clipPath id={`${id}-land`}>
          {frame.massifs.map((massif) => (
            <path key={massif.seed} d={contourPath(massif.x, massif.y, massif.r, massif.seed)} />
          ))}
        </clipPath>
      </defs>
      <rect width={width} height={height} style={{ fill: 'var(--concordat-plate)' }} />
      <g style={{ stroke: 'var(--concordat-hairline)' }} strokeWidth="1">
        {Array.from({ length: Math.ceil(width / step) }, (_, index) => (
          <path key={`v${index}`} d={`M${index * step} 0V${height}`} />
        ))}
        {Array.from({ length: Math.ceil(height / step) }, (_, index) => (
          <path key={`h${index}`} d={`M0 ${index * step}H${width}`} />
        ))}
      </g>
      <g
        style={{ fill: 'var(--concordat-khaki-faint)', fontFamily: 'var(--font-mono)' }}
        fontSize={12 * scale}
      >
        {Array.from({ length: Math.ceil(width / step) }, (_, index) => (
          <text key={`c${index}`} x={index * step + 6 * scale} y={16 * scale}>
            {columns[index % columns.length]}
          </text>
        ))}
        {Array.from({ length: Math.ceil(height / step) }, (_, index) => (
          <text key={`r${index}`} x={6 * scale} y={index * step + 30 * scale}>
            {index + 1}
          </text>
        ))}
      </g>
      {frame.massifs.map((massif) => (
        <g key={massif.seed} fill="none" style={{ stroke: 'var(--concordat-khaki)' }}>
          {Array.from({ length: rings }, (_, ring) => (
            <path
              key={ring}
              d={contourPath(massif.x, massif.y, massif.r * (1 - ring / rings), massif.seed)}
              strokeWidth={(ring % 4 === 0 ? 1.6 : 0.8) * scale}
              opacity={ring % 4 === 0 ? 0.55 : 0.3}
            />
          ))}
        </g>
      ))}
    </>
  )
}

/**
 * Capital: a brass star in a ring
 * @param {object} props - Place, faction colour and size
 * @return {JSX.Element}
 */

export const ConcordatCapital = ({
  x,
  y,
  token,
  scale = 1,
}: {
  x: number
  y: number
  token: string
  scale?: number
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle
      r="15"
      style={{ fill: 'var(--concordat-plate)', stroke: `var(${token})` }}
      strokeWidth="3"
    />
    <path
      d="M0 -8L2.4 -2.5L8 -2.5L3.5 1L5 7L0 3.6L-5 7L-3.5 1L-8 -2.5L-2.4 -2.5Z"
      style={{ fill: 'var(--concordat-brass)' }}
    />
  </g>
)
