import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PlayAdminBoardView } from '@/composites/play/admin/PlayAdminBoard'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { readPlayAdminBoard, readPlayAdminLogStats, readPlayAdminStats } from '@/core/services/play'
import { withTwitchBanners } from '@/core/services/platforms/TwitchBannerService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_BOARD_ADMIN_COPY.title }

interface PlayAdminPageProps {
  searchParams: Promise<{ player?: string }>
}

/**
 * Play administration: players, journal and figures
 * @param {PlayAdminPageProps} props - Player opened from an old link
 * @return {Promise<JSX.Element>} - Admin page
 */

export default async function PlayAdminPage({ searchParams }: PlayAdminPageProps) {
  const { access } = await requirePermission(Permissions.PlayManage)
  const { player } = await searchParams

  // Links made before the file had its own page
  if (player) redirect(ROUTES.playAdminPlayer(player))

  const [board, logStats, stats] = await Promise.all([
    readPlayAdminBoard(),
    readPlayAdminLogStats(),
    readPlayAdminStats(),
  ])

  return (
    <div className={PLAY_ADMIN.page}>
      <PlayPageTitle>{PLAY_BOARD_ADMIN_COPY.title}</PlayPageTitle>
      <PlayAdminBoardView
        board={{ ...board, youtubers: await withTwitchBanners(board.youtubers) }}
        logStats={logStats}
        stats={stats}
        canBulk={access.isAdmin}
      />
    </div>
  )
}
