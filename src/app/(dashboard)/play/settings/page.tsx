import type { Metadata } from 'next'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { NavalAutoZoomToggle } from '@/composites/play/naval/NavalAutoZoomToggle'
import { PlayMotionToggle } from '@/composites/play/prefs/PlayMotionToggle'
import { PlayPrefsList } from '@/composites/play/prefs/PlayPrefsList'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.settingsTitle }

/**
 * Settings of Play alone: sound, animations, display of each game
 * @return {Promise<JSX.Element>} - Settings page
 */

export default async function PlaySettingsPage() {
  await requirePermission(Permissions.PlayAccess)

  return (
    <div className={PLAY_CAREER.page}>
      <PlayPageTitle>{PLAY_HUB_COPY.settingsTitle}</PlayPageTitle>
      <div className={PLAY_CAREER.grid}>
        <PlayPageTitle heading="h2" className={PLAY_CAREER.cell} body={<PlayVolume />}>
          {PLAY_HUB_COPY.settingsSound}
        </PlayPageTitle>
        <PlayPageTitle heading="h2" className={PLAY_CAREER.cell} body={<PlayMotionToggle />}>
          {PLAY_HUB_COPY.settingsMotion}
        </PlayPageTitle>
        <PlayPageTitle
          heading="h2"
          className={PLAY_CAREER.cellWide}
          body={
            <>
              <PlayPrefsList />
              <NavalAutoZoomToggle />
            </>
          }
        >
          {PLAY_HUB_COPY.settingsGames}
        </PlayPageTitle>
      </div>
    </div>
  )
}
