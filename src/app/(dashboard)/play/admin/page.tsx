import type { Metadata } from 'next'

import { PlayAdminBoardView } from '@/composites/play/admin/PlayAdminBoard'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { readPlayAdminBoard } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_BOARD_ADMIN_COPY.title }

/**
 * Play administration: XP of everyone, every player's progression
 * @return {Promise<JSX.Element>} - Admin page
 */

export default async function PlayAdminPage() {
  const { access } = await requirePermission(Permissions.PlayManage)
  const board = await readPlayAdminBoard()

  return (
    <div className={PLAY_CAREER.page}>
      <PlayPageTitle body={<PlayAdminBoardView board={board} canEveryone={access.isAdmin} />}>
        {PLAY_BOARD_ADMIN_COPY.title}
      </PlayPageTitle>
    </div>
  )
}
