import type { Metadata } from 'next'

import { PlayAdminBoosts } from '@/composites/play/admin/PlayAdminBoosts'
import { PlayAdminTabs } from '@/composites/play/admin/PlayAdminTabs'
import { readPlayConfig } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_CONFIG_COPY.titleBoosts }

/**
 * Play administration: XP boosts
 * @return {Promise<JSX.Element>} - Boosts page
 */

export default async function PlayAdminBoostsPage() {
  await requirePermission(Permissions.PlayManage)

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayAdminTabs page="adminBoosts" />
      <PlayAdminBoosts initial={await readPlayConfig()} />
    </div>
  )
}
