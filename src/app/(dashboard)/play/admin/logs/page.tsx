import type { Metadata } from 'next'

import { PlayAdminLogs } from '@/composites/play/admin/PlayAdminLogs'
import { PlayAdminTabs } from '@/composites/play/admin/PlayAdminTabs'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { readPlayAdminBoard, readPlayAdminLogStats } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_BOARD_ADMIN_COPY.titleLogs }

/**
 * Play administration: the journal
 * @return {Promise<JSX.Element>} - Journal page
 */

export default async function PlayAdminLogsPage() {
  await requirePermission(Permissions.PlayManage)
  const [board, stats] = await Promise.all([readPlayAdminBoard(), readPlayAdminLogStats()])

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayAdminTabs page="adminLogs" />
      <PlayPageTitle aside={null} body={<PlayAdminLogs stats={stats} players={board.players} />}>
        {PLAY_BOARD_ADMIN_COPY.titleLogs}
      </PlayPageTitle>
    </div>
  )
}
