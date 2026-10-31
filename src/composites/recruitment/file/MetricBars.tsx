import { MetricEmpty } from '@/composites/recruitment/file/MetricEmpty'
import { MY_STATS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import {
  GRID_LINES,
  METRIC_TONES as TONES,
  printed,
  scaleOf,
  totalsOf,
} from '@/composites/recruitment/file/metricScale'
import type { MetricDay } from '@/core/lib/recruitment/meMetrics'

export interface MetricBarsProps {
  days: MetricDay[]
  label: string
}

/**
 * Columns of a metric, one per day, with the value of the touched day
 * @param {MetricBarsProps} props - Days and spoken name
 * @return {JSX.Element}
 */

export const MetricBars = ({ days, label }: MetricBarsProps) => {
  const totals = totalsOf(days)
  const { step, top } = scaleOf(Math.max(...totals, 1))

  if (days.length === 0) return <MetricEmpty />

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
        <div className={MY_STATS.columns}>
          {days.map((day, index) => (
            <span key={day.key} className={MY_STATS.column}>
              <span
                className={MY_STATS.barPlace}
                style={{ height: `${(totals[index]! / top) * 100}%` }}
              >
                <span
                  className={cn(
                    MY_STATS.barValue,
                    index === days.length - 1 && MY_STATS.barValueLatest
                  )}
                >
                  {printed(totals[index]!)}
                </span>
                <span className={MY_STATS.barStack}>
                  {day.parts
                    .filter((part) => part.value > 0)
                    .map((part) => (
                      <span
                        key={part.tone}
                        className={MY_STATS.bar}
                        style={{ flexGrow: part.value, backgroundColor: TONES[part.tone] }}
                      />
                    ))}
                </span>
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
