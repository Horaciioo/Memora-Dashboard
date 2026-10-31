'use client'

import { useState } from 'react'

import { FloatingLayer } from '@/components/structures/overlays/FloatingLayer'
import { VERDICT_OUTCOMES } from '@/declarations/reference/fixed'
import { MY_STATS_COPY } from '@/declarations/recruitment/copy'
import { accentColour } from '@/declarations/ui/theme'
import { MY_DAY, MY_STATS, TIP } from '@/declarations/ui/variants'
import type { RecruitmentOutcomeView } from '@/types/recruitment'

export interface MyDecisionsProps {
  outcomes: RecruitmentOutcomeView[]
  verdicts: Record<string, number>
}

// Ring geometry, one ring per decision from the outside in, each starting a little further
const OUTER_RADIUS = 16.2
const RING_STEP = 3.6
const RING_WIDTH = 2.4
const FULL = 100
const START_STAGGER = 16

// Graphic fill of each verdict accent
const RING_COLOURS: Record<string, string> = {
  success: 'var(--color-ring-success)',
  caution: 'var(--color-ring-caution)',
  danger: 'var(--color-ring-danger)',
}

/**
 * Concentric rings of the decisions given
 * @param {MyDecisionsProps} props - Outcomes and their counts
 * @return {JSX.Element}
 */

export const MyDecisions = ({ outcomes, verdicts }: MyDecisionsProps) => {
  const parts = outcomes
    .filter((outcome) => VERDICT_OUTCOMES.includes(outcome.name))
    .map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      value: verdicts[outcome.id] ?? 0,
      colour: RING_COLOURS[outcome.accent ?? ''] ?? accentColour(outcome.accent),
    }))
  const total = parts.reduce((sum, part) => sum + part.value, 0)

  // Ring under the pointer
  const [hover, setHover] = useState<{ text: string; colour: string; x: number; y: number } | null>(
    null
  )

  return (
    <div className={MY_DAY.ringsColumn}>
      <span className={MY_DAY.ringsSpacer} aria-hidden="true">
        {'\u00a0'}
      </span>
      <div className={MY_DAY.ringsBody}>
        <svg
          viewBox="0 0 36 36"
          className={MY_STATS.ringsSvg}
          role="img"
          aria-label={MY_STATS_COPY.verdicts}
        >
          {parts.map((part, index) => {
            const radius = OUTER_RADIUS - index * RING_STEP

            return (
              <g
                key={part.id}
                transform={`rotate(${index * START_STAGGER} 18 18)`}
                onMouseMove={(event) =>
                  setHover({
                    text: `${part.value} ${part.label}`,
                    colour: part.colour,
                    x: event.clientX,
                    y: event.clientY,
                  })
                }
                onMouseLeave={() => setHover(null)}
              >
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke={part.colour}
                  strokeOpacity="0.18"
                  strokeWidth={RING_WIDTH}
                />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke={part.colour}
                  strokeWidth={RING_WIDTH}
                  strokeLinecap={part.value > 0 ? 'round' : 'butt'}
                  pathLength={FULL}
                  strokeDasharray={`${total > 0 ? (part.value / total) * FULL : 0} ${FULL}`}
                />
              </g>
            )
          })}
        </svg>
      </div>
      {hover && (
        <FloatingLayer>
          <span
            role="tooltip"
            className={TIP.floating}
            style={{
              left: hover.x,
              top: hover.y - 12,
              backgroundColor: hover.colour,
              color: 'var(--color-ink)',
            }}
          >
            {hover.text}
          </span>
        </FloatingLayer>
      )}
    </div>
  )
}
