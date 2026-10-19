import { Section } from '@/components/structures/page/Section'
import { compareToBaseline } from '@/core/lib/lives/insights'
import type { BaselineRow, LiveBaseline, LiveInsights } from '@/core/lib/lives/insights'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { CHART, LIVE_REPORT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatSpan } from '@/utils/format/modview'

export interface BilanVersusProps {
  insights: LiveInsights
  baseline: LiveBaseline | null
  actions: number
  durationSeconds: number
}

// Labels of the compared figures
const ROW_LABELS: Record<BaselineRow['id'], string> = {
  actions: BILAN_COPY.versusActions,
  perHour: BILAN_COPY.versusPerHour,
  duration: BILAN_COPY.versusDuration,
  viewers: BILAN_COPY.versusViewers,
  peak: BILAN_COPY.versusPeak,
}

// Figure said the way it reads
const say = (id: BaselineRow['id'], value: number): string =>
  id === 'duration' ? formatSpan(value) : String(Math.round(value * 10) / 10)

/**
 * Share of a change as a signed percentage
 * @param {number | null} change - Ratio
 * @return {string} - Spoken change
 */

const sayChange = (change: number | null): string => {
  if (change === null) return BILAN_COPY.none
  const percent = Math.round(change * 100)

  return `${percent > 0 ? '+' : ''}${percent} %`
}

/**
 * This live against the creator's previous ones
 * @param {LiveInsights} insights - Insights
 * @param {LiveBaseline | null} baseline - Average before
 * @param {number} actions - Gestures of this live
 * @param {number} durationSeconds - Length of this live
 * @return {JSX.Element}
 */

export const BilanVersus = ({ insights, baseline, actions, durationSeconds }: BilanVersusProps) => (
  <Section
    title={BILAN_COPY.versusTitle}
    description={
      baseline ? BILAN_COPY.versusLead.replace('{count}', String(baseline.lives)) : undefined
    }
    padded
  >
    {!baseline ? (
      <p className={LIVE_REPORT.empty}>{BILAN_COPY.versusEmpty}</p>
    ) : (
      <div className={CHART.versus}>
        {compareToBaseline({ actions, durationSeconds }, insights, baseline).map((row) => {
          const scale = Math.max(row.current, row.baseline, 1) * 1.1
          const tone =
            row.change === null || Math.abs(row.change) < 0.05
              ? CHART.versusFlat
              : row.change > 0
                ? CHART.versusUp
                : CHART.versusDown

          return (
            <div key={row.id} className={CHART.versusRow}>
              <span className={CHART.versusLabel}>
                {ROW_LABELS[row.id]}
                <span className={CHART.versusNote}>
                  {BILAN_COPY.versusAverage.replace('{value}', say(row.id, row.baseline))}
                </span>
              </span>
              <span className={CHART.versusTrack}>
                <span
                  className={CHART.versusFill}
                  style={{ width: `${(row.current / scale) * 100}%` }}
                />
                <span
                  className={CHART.versusMark}
                  style={{ left: `${(row.baseline / scale) * 100}%` }}
                />
              </span>
              <span className={CHART.versusValue}>{say(row.id, row.current)}</span>
              <span className={cn(CHART.versusDelta, tone)}>{sayChange(row.change)}</span>
            </div>
          )
        })}
      </div>
    )}
  </Section>
)
