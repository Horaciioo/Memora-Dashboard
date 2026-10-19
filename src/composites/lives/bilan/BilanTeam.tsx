import { Section } from '@/components/structures/page/Section'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { formatSpan } from '@/utils/format/modview'

export interface BilanTeamProps {
  report: LiveReport
}

/**
 * Moderators of the live: gestures and time
 * @param {LiveReport} report - Report
 * @return {JSX.Element}
 */

export const BilanTeam = ({ report }: BilanTeamProps) => {
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
            {report.moderators.map((row) => {
              // The sentence is cut at its figures so each one gets its colour
              const [before, afterActive] = LIVE_REPORT_COPY.modSentence.split('{active}')
              const [between, afterVisible] = afterActive.split('{visible}')
              const [middle, end] = afterVisible.split('{actions}')

              return (
                <li key={row.key} className={LIVE_REPORT.row}>
                  <span className={row.isMember ? LIVE_REPORT.rowName : LIVE_REPORT.rowNameMuted}>
                    {row.name}
                  </span>
                  <p className={LIVE_REPORT.rowSentence}>
                    {row.isMember ? (
                      <>
                        {before}
                        <strong className={LIVE_REPORT.sentenceActive}>
                          {formatSpan(row.activeSeconds)}
                        </strong>
                        {between}
                        <strong className={LIVE_REPORT.sentenceScreen}>
                          {formatSpan(row.visibleSeconds)}
                        </strong>
                        {middle}
                        <strong className={LIVE_REPORT.sentenceActions}>
                          {row.actions === 1
                            ? LIVE_REPORT_COPY.modActionsOne
                            : LIVE_REPORT_COPY.modActionsMany.replace(
                                '{count}',
                                String(row.actions)
                              )}
                        </strong>
                        {end}
                      </>
                    ) : (
                      <>
                        {LIVE_REPORT_COPY.outsideMemora}
                        {', '}
                        <strong className={LIVE_REPORT.sentenceActions}>
                          {LIVE_REPORT_COPY.modActionsMany.replace('{count}', String(row.actions))}
                        </strong>
                      </>
                    )}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </>
  )
}
