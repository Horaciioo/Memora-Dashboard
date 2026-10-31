import { MetricEmpty } from '@/composites/recruitment/file/MetricEmpty'
import { METRIC_TONES, printed, scaleOf } from '@/composites/recruitment/file/metricScale'
import type { MetricDay, MetricTone } from '@/core/lib/recruitment/meMetrics'
import { MY_STATS } from '@/declarations/ui/variants'

export interface MetricDivergingProps {
  days: MetricDay[]
  label: string
  // Drawn above the baseline, the other tone goes below
  upTone: MetricTone
}

/**
 * Value of one tone on a day
 * @param {MetricDay} day - Day of the chart
 * @param {MetricTone} tone - Part wanted
 * @return {number} - Figure, zero when absent
 */

const valueOf = (day: MetricDay, tone: MetricTone): number =>
  day.parts.find((part) => part.tone === tone)?.value ?? 0

/**
 * Metric split around a baseline, one side up and the other down
 * @param {MetricDivergingProps} props - Days, spoken name and the tone drawn up
 * @return {JSX.Element}
 */

export const MetricDiverging = ({ days, label, upTone }: MetricDivergingProps) => {
  if (days.length === 0) return <MetricEmpty />

  const downTone = days.flatMap((day) => day.parts).find((part) => part.tone !== upTone)?.tone
  const tallest = Math.max(
    ...days.map((day) => Math.max(valueOf(day, upTone), downTone ? valueOf(day, downTone) : 0)),
    1
  )
  const { step } = scaleOf(tallest)

  return (
    <div className={MY_STATS.chart} role="img" aria-label={label}>
      <div className={MY_STATS.plot}>
        <div className={MY_STATS.gridline} style={{ bottom: '100%' }}>
          <span className={MY_STATS.tick}>{printed(step)}</span>
        </div>
        <div className={MY_STATS.baseline} style={{ bottom: '50%' }}>
          <span className={MY_STATS.tick}>0</span>
        </div>
        <div className={MY_STATS.gridline} style={{ bottom: 0 }}>
          <span className={MY_STATS.tick}>{printed(step)}</span>
        </div>
        <div className={MY_STATS.columns}>
          {days.map((day) => {
            const up = valueOf(day, upTone)
            const down = downTone ? valueOf(day, downTone) : 0

            return (
              <span key={day.key} className={MY_STATS.column}>
                <span className={MY_STATS.splitHalfUp}>
                  <span
                    className={MY_STATS.splitUp}
                    style={{
                      height: `${(up / step) * 100}%`,
                      backgroundColor: METRIC_TONES[upTone],
                    }}
                    title={printed(up)}
                  />
                </span>
                <span className={MY_STATS.splitHalfDown}>
                  {downTone && (
                    <span
                      className={MY_STATS.splitDown}
                      style={{
                        height: `${(down / step) * 100}%`,
                        backgroundColor: METRIC_TONES[downTone],
                      }}
                      title={printed(down)}
                    />
                  )}
                </span>
              </span>
            )
          })}
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
