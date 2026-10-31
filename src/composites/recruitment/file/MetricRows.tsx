import { MetricEmpty } from '@/composites/recruitment/file/MetricEmpty'
import {
  METRIC_TONES,
  leadTone,
  printed,
  scaleOf,
  totalsOf,
} from '@/composites/recruitment/file/metricScale'
import type { MetricDay } from '@/core/lib/recruitment/meMetrics'
import { MY_STATS } from '@/declarations/ui/variants'

export interface MetricRowsProps {
  days: MetricDay[]
  label: string
  // Says a value with its unit
  format?: (value: number) => string
}

/**
 * Metric as one capsule per day laid flat, the length is the value
 * @param {MetricRowsProps} props - Days, spoken name and the way a value is said
 * @return {JSX.Element}
 */

export const MetricRows = ({ days, label, format = printed }: MetricRowsProps) => {
  if (days.length === 0) return <MetricEmpty />

  const totals = totalsOf(days)
  const { top } = scaleOf(Math.max(...totals, 1))
  const colour = METRIC_TONES[leadTone(days)]

  return (
    <ol className={MY_STATS.rows} aria-label={label}>
      {days.map((day, index) => (
        <li key={day.key} className={MY_STATS.row}>
          <span className={MY_STATS.rowLabel}>{day.label}</span>
          <span className={MY_STATS.rowTrack}>
            <span
              className={MY_STATS.rowFill}
              style={{ width: `${(totals[index]! / top) * 100}%`, backgroundColor: colour }}
            />
          </span>
          <span className={MY_STATS.rowValue}>{format(totals[index]!)}</span>
        </li>
      ))}
    </ol>
  )
}
