import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'
import { useAnimatedKm } from '@/composites/play/stopgo/board/useAnimatedKm'
import { pointAt } from '@/core/lib/play/stopgo'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_BOARD_COPY } from '@/declarations/play/stopgo/track'
import { initialsOf } from '@/utils/format/initials'

export interface StopGoCarProps {
  plan: StopGoTrackPlan
  lane: number
  km: number
  color: StopGoCarColor
  name: string
  avatarUrl: string | null
  hasLeft: boolean
}

// Car and portrait scale
const SCALE = 1.6
const PORTRAIT = 13

/**
 * Car on its road, glides along the track and wears the portrait of its driver
 * @param {StopGoCarProps} props - Car
 * @return {JSX.Element}
 */

export const StopGoCar = ({ plan, lane, km, color, name, avatarUrl, hasLeft }: StopGoCarProps) => {
  const { x, y, heading } = pointAt(plan, useAnimatedKm(km), lane)
  const clip = `stopgo-portrait-${lane}`

  return (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
      style={hasLeft ? { opacity: 0.45, filter: 'grayscale(1)' } : undefined}
    >
      <title>{hasLeft ? `${name} · ${STOPGO_BOARD_COPY.left}` : name}</title>
      <g transform={`rotate(${heading.toFixed(1)}) scale(${SCALE})`}>
        <StopGoCarShape color={color} />
      </g>
      <clipPath id={clip}>
        <circle r={PORTRAIT} />
      </clipPath>
      <circle r={PORTRAIT + 3} fill="white" />
      {avatarUrl ? (
        <image
          href={avatarUrl}
          x={-PORTRAIT}
          y={-PORTRAIT}
          width={PORTRAIT * 2}
          height={PORTRAIT * 2}
          clipPath={`url(#${clip})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <>
          <circle r={PORTRAIT} style={{ fill: `var(--stopgo-car-${color})` }} />
          <text textAnchor="middle" y="6" fontSize="16" fontWeight="900" fill="white">
            {initialsOf(name)}
          </text>
        </>
      )}
    </g>
  )
}
