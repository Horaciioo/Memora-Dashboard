import { memo } from 'react'

import { edgeAt, signsOf } from '@/core/lib/play/stopgo'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo'
import { STOPGO_BOARD_COPY } from '@/declarations/play/stopgo/track'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

export interface StopGoSignsProps {
  plan: StopGoTrackPlan
  // Maps drawn
  maps: number[]
}

/**
 * Kilometre signs beside the road, the last one is the finish
 * @param {StopGoSignsProps} props - Track and maps
 * @return {JSX.Element}
 */

export const StopGoSigns = memo(({ plan, maps }: StopGoSignsProps) => (
  <g textAnchor="middle" fontWeight="900">
    {signsOf(plan.target)
      .filter(({ km }) =>
        maps.includes(Math.min(plan.maps.length - 1, Math.floor(km / STOPGO_SETTINGS.mapKm)))
      )
      .map(({ km, isFinish }) => {
        const { x, y } = edgeAt(plan, km)

        return (
          <g key={km} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <rect
              x="-3"
              y="-4"
              width="6"
              height="40"
              fill="black"
              opacity="0.25"
              transform="translate(8 6)"
            />
            <rect
              x="-3"
              y="-4"
              width="6"
              height="40"
              style={{ fill: 'var(--stopgo-asphalt-deep)' }}
            />
            <rect
              x="-34"
              y="-34"
              width={68}
              height="34"
              rx="6"
              style={{ fill: isFinish ? 'var(--play-stopgo)' : 'var(--stopgo-kerb-white)' }}
            />
            <text
              y="-11"
              fontSize={isFinish ? 13 : 20}
              style={{ fill: isFinish ? 'var(--stopgo-kerb-white)' : 'var(--stopgo-asphalt-deep)' }}
            >
              {isFinish ? STOPGO_BOARD_COPY.finish : km}
            </text>
          </g>
        )
      })}
  </g>
))

StopGoSigns.displayName = 'StopGoSigns'
