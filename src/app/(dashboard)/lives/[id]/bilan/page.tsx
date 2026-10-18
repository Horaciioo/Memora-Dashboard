import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { LiveReportView } from '@/composites/lives/LiveReportView'
import { readLiveReport } from '@/core/services/lives/LiveReportService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
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
  const { session, scope } = await requirePermission(Permissions.LiveLogRead)
  const detail = await readLiveReport(id, await scope(), session.id, session.permissions)
  const { live } = detail
  const start = live.startedAt ?? live.plannedStartAt

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={LIVE_REPORT_COPY.teamEyebrow
          .replace('{name}', live.youtuber.name)
          .replace('{day}', formatDay(start))}
        title={LIVE_REPORT_COPY.title}
      />
      <LiveReportView
        report={detail.report}
        insights={detail.insights}
        baseline={detail.baseline}
        stem={`${live.youtuber.name}-${live.id}`}
        log={detail.log}
        start={start}
        end={detail.period.end}
        available={detail.available}
      />
    </div>
  )
}
