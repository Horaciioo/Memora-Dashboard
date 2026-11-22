import type { Metadata } from 'next'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySettings } from '@/composites/play/prefs/PlaySettings'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.settingsTitle }

/**
 * Settings of Play alone: sound, animations, display of each game
 * @return {Promise<JSX.Element>} - Settings page
 */

export default async function PlaySettingsPage() {
  await requirePermission(Permissions.PlayAccess)

  return (
    <div className={PLAY_PAGE.frame}>
      <PlayPageTitle page="settings">{PLAY_HUB_COPY.settingsTitle}</PlayPageTitle>
      <PlaySettings />
    </div>
  )
}
