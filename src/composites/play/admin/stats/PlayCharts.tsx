'use client'

import { PLAY_HEALTH } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayChartProps {
  values: number[]
  // Index under the pointer, none at rest
  active: number | null
  onActive: (index: number | null) => void
  // Name of each point, read by assistive technology
  labels: string[]
}

// Viewbox of the line
const WIDTH = 100
const HEIGHT = 40

/**
 * Column chart, the pointer lights one column and dims the others
 * @param {PlayChartProps} props - Values and scrubbing
 * @return {JSX.Element}
 */

export const PlayBars = ({ values, active, onActive, labels }: PlayChartProps) => {
  const top = Math.max(1, ...values)

  return (
    <div className={PLAY_HEALTH.chart} onPointerLeave={() => onActive(null)}>
      <div className={PLAY_HEALTH.bars} role="img" aria-label={labels.join(', ')}>
        {values.map((value, index) => (
          <span
            key={index}
            className={PLAY_HEALTH.barSlot}
            onPointerEnter={() => onActive(index)}
            onPointerDown={() => onActive(index)}
          >
            <span
              className={cn(
                PLAY_HEALTH.bar,
                active !== null && active !== index && PLAY_HEALTH.barDim
              )}
              style={{ height: `${(value / top) * 100}%`, opacity: value === 0 ? 0.25 : undefined }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Area line chart, a dot follows the pointer
 * @param {PlayChartProps} props - Values and scrubbing
 * @return {JSX.Element}
 */

export const PlayLine = ({ values, active, onActive, labels }: PlayChartProps) => {
  const top = Math.max(1, ...values)
  const step = values.length > 1 ? WIDTH / (values.length - 1) : WIDTH
  const points = values.map((value, index) => [
    index * step,
    HEIGHT - (value / top) * (HEIGHT - 4) - 2,
  ])
  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`
  const dot = active === null ? null : points[active]

  return (
    <div className={PLAY_HEALTH.chart} onPointerLeave={() => onActive(null)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className={PLAY_HEALTH.svg}
        role="img"
        aria-label={labels.join(', ')}
      >
        <path d={area} fill="var(--tone)" opacity="0.18" />
        <path
          d={line}
          fill="none"
          stroke="var(--tone)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className={PLAY_HEALTH.slots}>
        {values.map((_, index) => (
          <span
            key={index}
            className={PLAY_HEALTH.slot}
            onPointerEnter={() => onActive(index)}
            onPointerDown={() => onActive(index)}
          />
        ))}
      </div>
      {dot && (
        <span
          className={PLAY_HEALTH.dot}
          style={{ left: `${dot[0]}%`, top: `${(dot[1] / HEIGHT) * 100}%` }}
        />
      )}
    </div>
  )
}
