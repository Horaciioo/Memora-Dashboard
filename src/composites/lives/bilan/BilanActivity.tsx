import { AreaChart } from '@/components/structures/charts/AreaChart'
import { StackedBars } from '@/components/structures/charts/StackedBars'
import { Section } from '@/components/structures/page/Section'
import { LevelFrise } from '@/composites/lives/bilan/LevelFrise'
import type { LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { REPORT_GROUPS, REPORT_GROUP_META } from '@/declarations/lives/reportGroups'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { formatClock } from '@/utils/format/modview'

export interface BilanActivityProps {
  insights: LiveInsights
  levels: LiveReport['levels']
  start: string
  end: string
}

/**
 * Timeline, running total and audience of the live
 * @param {LiveInsights} insights - Insights
 * @param {LiveReport['levels']} levels - Levels in force
 * @param {string} start - Live start
 * @param {string} end - Live end
 * @return {JSX.Element}
 */

export const BilanActivity = ({ insights, levels, start, end }: BilanActivityProps) => {
  const axis: [string, string] = [formatClock(start), formatClock(end)]
  const sampled = insights.slices.filter((slice) => slice.viewers !== null)

  return (
    <>
      <Section
        title={BILAN_COPY.activityTitle}
        description={BILAN_COPY.activityLead.replace('{minutes}', String(insights.bucketMinutes))}
        padded
      >
        <StackedBars
          title={BILAN_COPY.activityTitle}
          unit={BILAN_COPY.gestures}
          axis={axis}
          columns={insights.slices.map((slice) => ({
            id: slice.at,
            label: formatClock(slice.at),
            segments: REPORT_GROUPS.map((group) => ({
              value: slice.counts[group],
              colour: REPORT_GROUP_META[group].colour,
              label: REPORT_GROUP_META[group].label,
            })),
          }))}
        />
        <LevelFrise levels={levels} start={start} end={end} />
        {insights.viewers && (
          <p className={LIVE_REPORT.peak}>
            {BILAN_COPY.viewersPeakAt.replace('{time}', formatClock(insights.viewers.peakAt))}
          </p>
        )}
      </Section>

      <Section title={BILAN_COPY.cumulativeTitle} description={BILAN_COPY.cumulativeLead} padded>
        <AreaChart
          title={BILAN_COPY.cumulativeTitle}
          unit={BILAN_COPY.gestures}
          colour="var(--color-brand-600)"
          axis={axis}
          points={insights.slices.map((slice, index) => ({
            label: formatClock(slice.at),
            value: insights.cumulative[index] ?? 0,
          }))}
        />
      </Section>

      <Section title={BILAN_COPY.viewersTitle} description={BILAN_COPY.viewersLead} padded>
        {sampled.length < 2 ? (
          <p className={LIVE_REPORT.empty}>{BILAN_COPY.viewersEmpty}</p>
        ) : (
          <AreaChart
            title={BILAN_COPY.viewersTitle}
            unit={BILAN_COPY.viewersUnit}
            colour="var(--color-sky-500)"
            axis={[formatClock(sampled[0]!.at), formatClock(sampled.at(-1)!.at)]}
            points={sampled.map((slice) => ({
              label: formatClock(slice.at),
              value: slice.viewers ?? 0,
            }))}
          />
        )}
      </Section>
    </>
  )
}
