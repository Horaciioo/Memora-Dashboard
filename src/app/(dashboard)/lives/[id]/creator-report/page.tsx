import type { Metadata } from 'next'

import { PageHeader } from '@/components/structures/page/PageHeader'
import { CreatorBilan } from '@/composites/lives/CreatorBilan'
import { readLiveReport } from '@/core/services/lives/LiveReportService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
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

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LIVE_REPORT_COPY.creatorTitle} />

      <CreatorBilan
        report={report}
        insights={insights}
        baseline={baseline}
        start={start}
        end={end}
        stem={`${live.youtuber.name}-${live.id}`}
        creator={{
          name: live.youtuber.name,
          avatar: live.youtuber.avatar,
          banner: live.youtuber.banner ?? null,
        }}
      />
    </div>
  )
}
