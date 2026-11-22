import type { Metadata } from 'next'

import { PlayAdminSettings } from '@/composites/play/admin/PlayAdminSettings'
import { PlayAdminTabs } from '@/composites/play/admin/PlayAdminTabs'
import { readPlayConfig } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_CONFIG_COPY.titleSettings }

/**
 * Play administration: room settings
 * @return {Promise<JSX.Element>} - Settings page
 */

export default async function PlayAdminSettingsPage() {
  await requirePermission(Permissions.PlayManage)

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayAdminTabs page="adminSettings" />
      <PlayAdminSettings initial={await readPlayConfig()} />
    </div>
  )
}
