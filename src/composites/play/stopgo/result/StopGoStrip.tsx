import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_RESULT } from '@/declarations/ui/variants/games/play/stopgo'

export interface StopGoStripProps {
  target: number
  cars: { id: string; km: number; color: StopGoCarColor }[]
}

// Drawing box and road band
const WIDTH = 600
const HEIGHT = 56
const PAD = 24
const ROAD_Y = 14
const ROAD_H = 28
const CAR_SCALE = 0.3

/**
 * Small straight road with every car stopped at its final distance
 * @param {StopGoStripProps} props - Distance and cars
 * @return {JSX.Element}
 */

export const StopGoStrip = ({ target, cars }: StopGoStripProps) => (
  <svg
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    className={STOPGO_RESULT.strip}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <pattern id="stopgo-strip-checker" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="white" />
        <rect width="4" height="4" fill="black" />
        <rect x="4" y="4" width="4" height="4" fill="black" />
      </pattern>
    </defs>
    <rect
      x={PAD}
      y={ROAD_Y}
      width={WIDTH - 2 * PAD}
      height={ROAD_H}
      rx="5"
      style={{ fill: 'var(--stopgo-asphalt)' }}
    />
    <line
      x1={PAD}
      x2={WIDTH - PAD}
      y1={ROAD_Y + ROAD_H / 2}
      y2={ROAD_Y + ROAD_H / 2}
      stroke="white"
      strokeOpacity="0.4"
      strokeDasharray="10 10"
    />
    <rect
      x={WIDTH - PAD - 8}
      y={ROAD_Y}
      width="8"
      height={ROAD_H}
      fill="url(#stopgo-strip-checker)"
    />
    {cars.map(({ id, km, color }, lane) => {
      const share = Math.min(1, km / target)
      const x = PAD + 6 + share * (WIDTH - 2 * PAD - 22)
      const y = ROAD_Y + ((lane + 0.5) * ROAD_H) / cars.length

      return (
        <g key={id} transform={`translate(${x} ${y}) rotate(90) scale(${CAR_SCALE})`}>
          <StopGoCarShape color={color} />
        </g>
      )
    })}
  </svg>
)
