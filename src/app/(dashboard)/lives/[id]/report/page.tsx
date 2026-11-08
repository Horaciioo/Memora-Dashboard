import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { LiveReportView } from '@/composites/lives/LiveReportView'
import { readLiveReport } from '@/core/services/lives/LiveReportService'
import { markReportRead } from '@/core/services/system/NotificationService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT, PAGE_STYLES } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_REPORT_COPY.title }

/**
 * Report of one live for the team
 * @param {Object} props - Route props
 * @param {Promise<{ id: string }>} props.params - Live identifier
 * @return {Promise<JSX.Element>} - Report page
 */

export default async function LiveReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access, scope } = await requirePermission(Permissions.LiveLogRead)
  const detail = await readLiveReport(id, await scope(), session.id, session.permissions)
  const { live } = detail
  // Opening the report ticks the task off
  await markReportRead(session.id, live.id)
  const start = live.startedAt ?? live.plannedStartAt

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LIVE_REPORT_COPY.title} />
      <h2 className={LIVE_REPORT.heading}>
        {LIVE_REPORT_COPY.teamHeading
          .replace('{name}', live.youtuber.name)
          .replace('{day}', formatDay(start))}
      </h2>
      <LiveReportView
        report={detail.report}
        insights={detail.insights}
        baseline={detail.baseline}
        stem={`${live.youtuber.name}-${live.id}`}
        liveId={live.id}
        canEdit={access.isResponsable}
        log={detail.log}
        team={detail.team}
        notes={detail.notes}
        start={start}
        end={detail.period.end}
        available={detail.available}
        creator={{
          name: live.youtuber.name,
          avatar: live.youtuber.avatar,
          banner: live.youtuber.banner ?? null,
        }}
        showCreator={access.isAdmin && access.can(Permissions.LiveCreatorReport)}
      />
    </div>
  )
}
