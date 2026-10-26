import type { Metadata } from 'next'

import { PlayCallouts } from '@/composites/play/hub/PlayCallouts'
import { PlayGameGrid } from '@/composites/play/hub/PlayGameGrid'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { API_ROUTES } from '@/core/lib/api/routes'
import { readCatalog, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_CROSS } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

/**
 * Play home: the games as tall posters
 * @return {Promise<JSX.Element>} - Play page
 */

export default async function PlayPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const profile = await readPlayProfile(session.id)
  const { games } = readCatalog()

  return (
    <>
      <PlaySignal url={API_ROUTES.playSessionsStream} />
      <PlayCallouts isBanned={Boolean(profile.ban)} />

      <section className={PLAY_CROSS.stage} aria-label={PLAY_HUB_COPY.sectionGames}>
        <PlayGameGrid games={games} />
      </section>
    </>
  )
}
