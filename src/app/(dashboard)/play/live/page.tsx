import type { Metadata } from 'next'

import { PlayLiveTables } from '@/composites/play/hub/lobby/PlayLiveTables'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { listLobbies, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_MOBILE_COPY.tabLive }

/**
 * Live page: tables open or being played
 * @return {Promise<JSX.Element>} - Live page
 */

export default async function PlayLivePage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const [profile, tables] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id),
  ])

  return (
    <div className={PLAY_PAGE.reading}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle
        page="live"
        body={
          <PlayLiveTables
            isFlat
            title={PLAY_MOBILE_COPY.tabLive}
            empty={PLAY_HUB_COPY.liveEmpty}
            tables={[...tables.running, ...tables.lobbies]}
            mineId={tables.currentId}
            isLocked={Boolean(profile.ban)}
            hasGame
          />
        }
      >
        {PLAY_MOBILE_COPY.tabLive}
      </PlayPageTitle>
    </div>
  )
}
