'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { MetricArea } from '@/composites/recruitment/file/MetricArea'
import { MetricBars } from '@/composites/recruitment/file/MetricBars'
import { MetricDiverging } from '@/composites/recruitment/file/MetricDiverging'
import { MetricRows } from '@/composites/recruitment/file/MetricRows'
import { MetricCard } from '@/composites/recruitment/file/MetricCard'
import type { MeMetrics, MetricDay } from '@/core/lib/recruitment/meMetrics'
import { MY_STATS_COPY, type MetricSentence } from '@/declarations/recruitment/copy'
import { MY_STATS } from '@/declarations/ui/variants'
import { roughDuration } from '@/utils/format/hours'

export interface MyMetricsProps {
  metrics: MeMetrics
  // Holds an observer seat of the session
  isObserver: boolean
}

// Pillar height under the duo, in pixels
const DUO_BASE = 24
const DUO_STEP = 12
const DUO_MAX = 112

const MINUTES_PER_HOUR = 60

// Decimals kept on an average
const AVERAGE_DIGITS = 1

/**
 * Average per active day, nothing when no day is drawn
 * @param {MetricDay[]} days - Days of a chart
 * @return {MetricSentence} - Words to append to a sentence
 */

const averageOf = (days: MetricDay[]): MetricSentence => {
  const total = days.reduce(
    (sum, day) => sum + day.parts.reduce((all, part) => all + part.value, 0),
    0
  )

  return days.length === 0
    ? []
    : MY_STATS_COPY.averageSentence((total / days.length).toFixed(AVERAGE_DIGITS))
}

// Decimals kept on the hours
const HOUR_DIGITS = 1

/**
 * The five metric boxes of the viewer, two to a row
 * @param {MyMetricsProps} props - Figures to draw and the viewer's seat
 * @return {JSX.Element}
 */

export const MyMetrics = ({ metrics, isObserver }: MyMetricsProps) => {
  const { duo } = metrics
  const hours = metrics.hours === null ? MY_STATS_COPY.none : metrics.hours.toFixed(HOUR_DIGITS)

  return (
    <section className="flex flex-col gap-3">
      <h2 className={MY_STATS.title}>{MY_STATS_COPY.title}</h2>
      <div className={MY_STATS.grid}>
        <MetricCard
          title={MY_STATS_COPY.interviews}
          sentence={[
            ...MY_STATS_COPY.interviewsSentence(metrics.interviews),
            ...averageOf(metrics.interviewDays),
          ]}
        >
          <MetricBars days={metrics.interviewDays} label={MY_STATS_COPY.interviews} />
        </MetricCard>

        {isObserver && (
          <MetricCard
            title={MY_STATS_COPY.observations}
            sentence={[
              ...MY_STATS_COPY.observationsSentence(metrics.observations),
              ...averageOf(metrics.observationDays),
            ]}
          >
            <MetricArea days={metrics.observationDays} label={MY_STATS_COPY.observations} />
          </MetricCard>
        )}

        <MetricCard title={MY_STATS_COPY.presence} sentence={MY_STATS_COPY.presenceSentence(hours)}>
          <MetricRows
            days={metrics.hourDays}
            label={MY_STATS_COPY.presence}
            format={(hours) => roughDuration(hours * MINUTES_PER_HOUR)}
          />
        </MetricCard>

        <MetricCard
          title={MY_STATS_COPY.choices}
          sentence={MY_STATS_COPY.choicesSentence(metrics.accepted, metrics.refused)}
        >
          <MetricDiverging
            days={metrics.decisionDays}
            label={MY_STATS_COPY.choices}
            upTone="success"
          />
        </MetricCard>

        <MetricCard
          title={MY_STATS_COPY.duo}
          sentence={duo ? MY_STATS_COPY.duoSentence(duo.members[1]!) : [MY_STATS_COPY.noDuo]}
        >
          {duo && (
            <div className={MY_STATS.duo}>
              <span className={MY_STATS.duoStack}>
                {duo.members.map((member) => (
                  <Avatar
                    key={member.id}
                    name={member.label}
                    src={member.image}
                    size="xs"
                    className="ring-2 ring-[var(--color-surface-raised)]"
                  />
                ))}
              </span>
              <span
                className={MY_STATS.duoColumn}
                style={{ height: `${Math.min(DUO_BASE + duo.sessions * DUO_STEP, DUO_MAX)}px` }}
                aria-hidden="true"
              />
              <span className={MY_STATS.duoSessions}>{MY_STATS_COPY.sessions(duo.sessions)}</span>
            </div>
          )}
        </MetricCard>
      </div>
    </section>
  )
}
