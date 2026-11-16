import type { Metadata } from 'next'

import { PlayLiveTables } from '@/composites/play/hub/lobby/PlayLiveTables'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { listLobbies, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_BOX, PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.liveTitle }

/**
 * Live page: tables open or being played
 * @return {Promise<JSX.Element>} - Live page
 */

export default async function PlayLivePage() {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const [profile, tables] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id, null, access.can(Permissions.PlayManage)),
  ])

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <div className={PLAY_BOX.stack}>
        <PlayPageTitle
          body={
            <PlayLiveTables
              isFlat
              title={PLAY_HUB_COPY.liveTitle}
              empty={PLAY_HUB_COPY.liveEmpty}
              tables={[...tables.running, ...tables.lobbies]}
              mineId={tables.currentId}
              isLocked={Boolean(profile.ban)}
              hasGame
            />
          }
        >
          {PLAY_HUB_COPY.liveTitle}
        </PlayPageTitle>
      </div>
    </div>
  )
}
