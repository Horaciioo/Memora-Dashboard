import { Donut } from '@/components/structures/charts/Donut'
import { RankBars } from '@/components/structures/charts/RankBars'
import { Section } from '@/components/structures/page/Section'
import type { LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { REPORT_GROUPS, REPORT_GROUP_META } from '@/declarations/lives/reportGroups'
import { CHART } from '@/declarations/ui/variants'

export interface BilanBreakdownProps {
  insights: LiveInsights
  byKind: LiveReport['byKind']
  // Viewer pseudonyms and reasons stay with the team
  withDetail: boolean
}

/**
 * Where the gestures went: families, origin, reasons, repeat offenders
 * @param {LiveInsights} insights - Insights
 * @param {LiveReport['byKind']} byKind - Gestures per kind
 * @param {boolean} withDetail - Reasons and pseudonyms shown
 * @return {JSX.Element}
 */

export const BilanBreakdown = ({ insights, byKind, withDetail }: BilanBreakdownProps) => {
  const familyTotals = REPORT_GROUPS.map((group) =>
    insights.slices.reduce((sum, slice) => sum + slice.counts[group], 0)
  )

  return (
    <>
      <div className={CHART.deck}>
        <Section title={BILAN_COPY.familiesTitle} padded>
          <Donut
            title={BILAN_COPY.familiesTitle}
            centreLabel={BILAN_COPY.gestures}
            parts={REPORT_GROUPS.map((group, index) => ({
              label: REPORT_GROUP_META[group].label,
              colour: REPORT_GROUP_META[group].colour,
              value: familyTotals[index]!,
            }))}
          />
        </Section>
        <Section title={BILAN_COPY.originTitle} padded>
          <Donut
            title={BILAN_COPY.originTitle}
            centreLabel={BILAN_COPY.originCentre}
            parts={[
              {
                label: BILAN_COPY.originMemora,
                colour: 'var(--color-brand-600)',
                value: insights.origins.memora,
              },
              {
                label: BILAN_COPY.originPlatform,
                colour: 'var(--color-twitch)',
                value: insights.origins.platform,
              },
            ]}
          />
        </Section>
      </div>

      <Section title={BILAN_COPY.kindsTitle} padded>
        <RankBars
          empty={BILAN_COPY.reasonsEmpty}
          rows={byKind.map((entry) => ({
            label: MODERATION_KINDS[entry.kind].label,
            value: entry.count,
          }))}
        />
      </Section>

      {withDetail && (
        <div className={CHART.deck}>
          <Section title={BILAN_COPY.reasonsTitle} padded>
            <RankBars
              empty={BILAN_COPY.reasonsEmpty}
              rows={insights.reasons.map((reason) => ({
                label: reason.label,
                value: reason.count,
              }))}
            />
          </Section>
          <Section title={BILAN_COPY.repeatTitle} description={BILAN_COPY.repeatLead} padded>
            <RankBars
              empty={BILAN_COPY.repeatEmpty}
              rows={insights.repeatTargets.map((target) => ({
                label: target.login,
                value: target.count,
                colour: 'var(--color-danger)',
              }))}
            />
          </Section>
        </div>
      )}
    </>
  )
}
