import type { Metadata } from 'next'

import { PlayAdminGames } from '@/composites/play/admin/PlayAdminGames'
import { PlayAdminTabs } from '@/composites/play/admin/PlayAdminTabs'
import { readAdminGames, readPlayConfig } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_CONFIG_COPY.titleGames }

/**
 * Play administration: games open or closed, featured games
 * @return {Promise<JSX.Element>} - Games page
 */

export default async function PlayAdminGamesPage() {
  await requirePermission(Permissions.PlayManage)
  const [config, games] = await Promise.all([readPlayConfig(), readAdminGames()])

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayAdminTabs page="adminGames" />
      <PlayAdminGames initial={config} games={games} />
    </div>
  )
}
