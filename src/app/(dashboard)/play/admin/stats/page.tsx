import type { Metadata } from 'next'

import { PlayAdminStatsView } from '@/composites/play/admin/PlayAdminStatsView'
import { PlayAdminTabs } from '@/composites/play/admin/PlayAdminTabs'
import { readPlayAdminBoard, readPlayAdminStats } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_BOARD_ADMIN_COPY.titleStats }

/**
 * Play administration: the figures
 * @return {Promise<JSX.Element>} - Figures page
 */

export default async function PlayAdminStatsPage() {
  await requirePermission(Permissions.PlayManage)
  const [board, stats] = await Promise.all([readPlayAdminBoard(), readPlayAdminStats()])

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayAdminTabs page="adminStats" />
      <PlayAdminStatsView stats={stats} totals={board.totals} />
    </div>
  )
}
