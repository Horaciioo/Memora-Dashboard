import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PlayAdminPlayers } from '@/composites/play/admin/PlayAdminPlayers'
import { PlayAdminTabs } from '@/composites/play/admin/PlayAdminTabs'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { readPlayAdminBoard } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_BOARD_ADMIN_COPY.title }

interface PlayAdminPageProps {
  searchParams: Promise<{ player?: string }>
}

/**
 * Play administration: the players
 * @param {PlayAdminPageProps} props - Player opened from an old link
 * @return {Promise<JSX.Element>} - Players page
 */

export default async function PlayAdminPage({ searchParams }: PlayAdminPageProps) {
  const { access } = await requirePermission(Permissions.PlayManage)
  const { player } = await searchParams

  // Links made before the file had its own page
  if (player) redirect(ROUTES.playAdminPlayer(player))

  const board = await readPlayAdminBoard()

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayAdminTabs page="adminPlayers" />
      <PlayPageTitle
        aside={null}
        body={<PlayAdminPlayers board={board} canBulk={access.isAdmin} />}
      >
        {PLAY_BOARD_ADMIN_COPY.title}
      </PlayPageTitle>
    </div>
  )
}
