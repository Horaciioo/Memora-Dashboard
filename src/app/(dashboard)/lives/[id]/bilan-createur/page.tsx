import type { Metadata } from 'next'

import { PageHeader } from '@/components/structures/page/PageHeader'
import { CreatorBilan } from '@/composites/lives/CreatorBilan'
import { readLiveReport } from '@/core/services/lives/LiveReportService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT, PAGE_STYLES } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/dates'
import { formatClock, formatSpan } from '@/utils/format/modview'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_REPORT_COPY.creatorTitle }

/**
 * Report of one live for its creator
 * @param {Object} props - Route props
 * @param {Promise<{ id: string }>} props.params - Live identifier
 * @return {Promise<JSX.Element>} - Creator report page
 */

export default async function LiveCreatorReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { session, scope } = await requirePermission(Permissions.LiveCreatorReport)
  const { live, report, insights, baseline, period } = await readLiveReport(
    id,
    await scope(),
    session.id,
    session.permissions
  )
  const start = live.startedAt ?? live.plannedStartAt
  const end = period.end
  const team = report.moderators.filter((row) => row.isMember).length

  // Opening sentence
  const when = (
    team === 0
      ? LIVE_REPORT_COPY.creatorWhenNone
      : team === 1
        ? LIVE_REPORT_COPY.creatorWhenOne
        : LIVE_REPORT_COPY.creatorWhen
  )
    .replace('{day}', formatDay(start))
    .replace('{start}', formatClock(start))
    .replace('{end}', formatClock(end))
    .replace('{count}', String(team))

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={LIVE_REPORT_COPY.creatorEyebrow
          .replace('{name}', live.youtuber.name)
          .replace('{day}', formatDay(start))}
        title={LIVE_REPORT_COPY.creatorTitle}
      />

      <article className={LIVE_REPORT.letter}>
        <p className={LIVE_REPORT.sentence}>{LIVE_REPORT_COPY.creatorLead}</p>
        <p className={LIVE_REPORT.sentence}>{when}</p>
        <p className={LIVE_REPORT.sentence}>
          {report.actions === 0
            ? LIVE_REPORT_COPY.creatorQuiet
            : LIVE_REPORT_COPY.creatorActions
                .replace('{actions}', String(report.actions))
                .replace('{targets}', String(report.distinctTargets))}
        </p>
        {report.teamActiveSeconds > 0 && (
          <p className={LIVE_REPORT.sentence}>
            {LIVE_REPORT_COPY.creatorTime.replace('{time}', formatSpan(report.teamActiveSeconds))}
          </p>
        )}
        {report.peak && (
          <p className={LIVE_REPORT.sentence}>
            {LIVE_REPORT_COPY.creatorPeak
              .replace('{time}', formatClock(report.peak.at))
              .replace('{count}', String(report.peak.count))
              .replace('{minutes}', String(LIVE_SETTINGS.reportBucketMinutes))}
          </p>
        )}
      </article>

      <CreatorBilan
        report={report}
        insights={insights}
        baseline={baseline}
        start={start}
        end={end}
        stem={`${live.youtuber.name}-${live.id}`}
      />
    </div>
  )
}
