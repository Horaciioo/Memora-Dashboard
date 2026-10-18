import { Heatmap } from '@/components/structures/charts/Heatmap'
import { Section } from '@/components/structures/page/Section'
import type { LiveInsights } from '@/core/lib/lives/insights'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { formatClock, formatSpan } from '@/utils/format/modview'

export interface BilanTeamProps {
  report: LiveReport
  insights: LiveInsights
}

/**
 * Moderators of the live: gestures, time, then who acted when
 * @param {LiveReport} report - Report
 * @param {LiveInsights} insights - Insights
 * @return {JSX.Element}
 */

export const BilanTeam = ({ report, insights }: BilanTeamProps) => {
  const busiest = Math.max(1, ...report.moderators.map((row) => row.actions))

  return (
    <>
      <Section
        title={LIVE_REPORT_COPY.moderatorsTitle}
        description={LIVE_REPORT_COPY.moderatorsLead}
        padded
      >
        {report.moderators.length === 0 ? (
          <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.logEmpty}</p>
        ) : (
          <ul className={LIVE_REPORT.rows}>
            {report.moderators.map((row) => (
              <li key={row.key} className={LIVE_REPORT.row}>
                <span className={row.isMember ? LIVE_REPORT.rowName : LIVE_REPORT.rowNameMuted}>
                  {row.name}
                </span>
                <span className={LIVE_REPORT.rowTrack}>
                  <span
                    className={LIVE_REPORT.rowFill}
                    style={{ width: `${(row.actions / busiest) * 100}%` }}
                  />
                </span>
                <span className={LIVE_REPORT.rowValue}>
                  {row.actions}
                  <span className={LIVE_REPORT.rowMeta}>
                    {row.isMember
                      ? `${formatSpan(row.activeSeconds)} ${LIVE_REPORT_COPY.active}, ${formatSpan(row.visibleSeconds)} ${LIVE_REPORT_COPY.visible}`
                      : LIVE_REPORT_COPY.outsideMemora}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {insights.heat.length > 0 && (
        <Section title={BILAN_COPY.heatTitle} description={BILAN_COPY.heatLead} padded>
          <Heatmap
            title={BILAN_COPY.heatTitle}
            unit={BILAN_COPY.gestures}
            hint={BILAN_COPY.heatHint}
            rows={insights.heat}
            columns={insights.slices.map((slice) => formatClock(slice.at))}
          />
        </Section>
      )}
    </>
  )
}
