import { memo } from 'react'

import { StopGoRoadStrip } from '@/composites/play/stopgo/art/StopGoRoadStrip'
import { lanePath, pointAt } from '@/core/lib/play/stopgo'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'
import { STOPGO_TRACK } from '@/declarations/play/stopgo/track'

export interface StopGoTrackProps {
  plan: StopGoTrackPlan
  // Maps drawn, side by side
  maps: number[]
  // Colour of each road
  colors: StopGoCarColor[]
}

// Painted arrows per map
const ARROW_STEP = 25

/**
 * Painted arrow on a road, in the colour of its player
 * @param {object} props - Place
 * @return {JSX.Element}
 */

const Arrow = ({
  x,
  y,
  heading,
  color,
}: {
  x: number
  y: number
  heading: number
  color: StopGoCarColor
}) => (
  <path
    d="M0 -16L13 8L0 2L-13 8z"
    transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading.toFixed(1)})`}
    style={{ fill: `var(--stopgo-car-${color})`, opacity: 0.55 }}
  />
)

/**
 * Line across every road at one distance
 * @param {object} props - Track and distance
 * @return {JSX.Element}
 */

const Gate = ({ plan, km, fill }: { plan: StopGoTrackPlan; km: number; fill: string }) => {
  const { x, y } = pointAt(plan, km, (plan.lanes - 1) / 2)
  const half = plan.maxOffset + STOPGO_TRACK.roadWidth / 2

  return <rect x={x - half} y={y - 14} width={half * 2} height="28" style={{ fill }} />
}

/**
 * Roads of the maps drawn, start line and finish line
 * @param {StopGoTrackProps} props - Track
 * @return {JSX.Element}
 */

export const StopGoTrack = memo(({ plan, maps, colors }: StopGoTrackProps) => (
  <g>
    {colors.map((color, lane) => (
      <g key={lane}>
        <StopGoRoadStrip
          path={lanePath(plan, maps[0], maps[maps.length - 1], lane)}
          width={STOPGO_TRACK.roadWidth}
        />
        {maps.flatMap((map) =>
          Array.from({ length: STOPGO_SETTINGS.mapKm / ARROW_STEP }, (_, step) => {
            const km = map * STOPGO_SETTINGS.mapKm + (step + 0.5) * ARROW_STEP
            const { x, y, heading } = pointAt(plan, km, lane)

            return <Arrow key={`${map}-${step}`} x={x} y={y} heading={heading} color={color} />
          })
        )}
      </g>
    ))}
    {maps.includes(0) && <Gate plan={plan} km={0} fill="var(--stopgo-kerb-white)" />}
    {maps.includes(plan.maps.length - 1) && (
      <Gate plan={plan} km={plan.target} fill="url(#stopgo-checker)" />
    )}
  </g>
))

StopGoTrack.displayName = 'StopGoTrack'
