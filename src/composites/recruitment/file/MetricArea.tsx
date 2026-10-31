import { MetricEmpty } from '@/composites/recruitment/file/MetricEmpty'
import {
  GRID_LINES,
  METRIC_TONES,
  leadTone,
  printed,
  scaleOf,
  totalsOf,
} from '@/composites/recruitment/file/metricScale'
import type { MetricDay } from '@/core/lib/recruitment/meMetrics'
import { MY_STATS } from '@/declarations/ui/variants'

export interface MetricAreaProps {
  days: MetricDay[]
  label: string
}

const FULL = 100

/**
 * Curve through the points, flat at each one so it never overshoots
 * @param {{ x: number, y: number }[]} points - Points in the 0-100 box
 * @return {string} - Path data
 */

const curve = (points: { x: number; y: number }[]): string =>
  points
    .map((point, index) => {
      if (index === 0) return `M${point.x} ${point.y}`
      const last = points[index - 1]!
      const mid = (last.x + point.x) / 2

      return `C${mid} ${last.y} ${mid} ${point.y} ${point.x} ${point.y}`
    })
    .join(' ')

/**
 * Metric as a soft area under a line, one dot per day
 * @param {MetricAreaProps} props - Days and spoken name
 * @return {JSX.Element}
 */

export const MetricArea = ({ days, label }: MetricAreaProps) => {
  if (days.length === 0) return <MetricEmpty />

  const totals = totalsOf(days)
  const { step, top } = scaleOf(Math.max(...totals, 1))
  const colour = METRIC_TONES[leadTone(days)]
  const points = totals.map((total, index) => ({
    x: ((index + 0.5) / days.length) * FULL,
    y: FULL - (total / top) * FULL,
  }))
  const line = curve(points)
  const first = points[0]!
  const last = points[points.length - 1]!

  return (
    <div className={MY_STATS.chart} role="img" aria-label={label}>
      <div className={MY_STATS.plot}>
        {Array.from({ length: GRID_LINES + 1 }, (_, line) => (
          <div
            key={line}
            className={MY_STATS.gridline}
            style={{ bottom: `${(line / GRID_LINES) * 100}%` }}
          >
            <span className={MY_STATS.tick}>{printed(line * step)}</span>
          </div>
        ))}
        <svg
          viewBox={`0 0 ${FULL} ${FULL}`}
          preserveAspectRatio="none"
          className={MY_STATS.areaSvg}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`area-${label}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={colour} stopOpacity="0.4" />
              <stop offset="1" stopColor={colour} stopOpacity="0" />
            </linearGradient>
          </defs>
          {points.length > 1 && (
            <path
              d={`${line} L${last.x} ${FULL} L${first.x} ${FULL} Z`}
              fill={`url(#area-${label})`}
            />
          )}
          <path
            d={line}
            fill="none"
            stroke={colour}
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className={MY_STATS.columns}>
          {days.map((day, index) => (
            <span key={day.key} className={MY_STATS.column}>
              <span
                className={MY_STATS.areaDot}
                style={{ bottom: `${(totals[index]! / top) * 100}%`, borderColor: colour }}
              >
                <span className={MY_STATS.barValue}>{printed(totals[index]!)}</span>
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className={MY_STATS.axis}>
        {days.map((day) => (
          <span key={day.key} className={MY_STATS.barLabel}>
            {day.label}
          </span>
        ))}
      </div>
    </div>
  )
}
