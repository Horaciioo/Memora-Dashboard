import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/structures/PageHeader'
import { LiveReportView } from '@/composites/lives/LiveReportView'
import { readLiveReport } from '@/core/services/lives/LiveReportService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { BUTTON_STYLES, LIVE_REPORT, PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_REPORT_COPY.title }

/**
 * Report of one live for the team, with its full log
 * @param {Object} props - Route props
 * @param {Promise<{ id: string }>} props.params - Live identifier
 * @return {Promise<JSX.Element>} - Report page
 */

export default async function LiveReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access, scope } = await requirePermission(Permissions.LiveLogRead)
  const detail = await readLiveReport(id, await scope(), session.id, session.permissions)
  const { live } = detail
  const start = live.startedAt ?? live.plannedStartAt

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={`${live.youtuber.name} · ${formatDay(start)}`}
        title={LIVE_REPORT_COPY.title}
      />
      <div className={LIVE_REPORT.toolbar}>
        {access.can(Permissions.LiveCreatorReport) && (
          <Link
            href={ROUTES.liveCreatorReport(id)}
            className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
          >
            {LIVE_REPORT_COPY.openCreator}
          </Link>
        )}
      </div>
      <LiveReportView
        report={detail.report}
        log={detail.log}
        start={start}
        end={live.endedAt ?? new Date().toISOString()}
        available={detail.available}
      />
    </div>
  )
}
