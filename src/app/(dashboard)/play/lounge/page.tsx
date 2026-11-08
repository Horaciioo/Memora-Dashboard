import type { Metadata } from 'next'

import { PlayLiveTables } from '@/composites/play/hub/lobby/PlayLiveTables'
import { PlayOnlineBox } from '@/composites/play/hub/PlayOnlineBox'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { listLobbies, readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_MOBILE_COPY.tabLounge }

/**
 * Lounge page: who is playing and who is online
 * @return {Promise<JSX.Element>} - Lounge page
 */

export default async function PlayLoungePage() {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const [profile, tables] = await Promise.all([
    readPlayProfile(session.id),
    listLobbies(session.id, null, access.can(Permissions.PlayManage)),
  ])
  const everyTable = [...tables.running, ...tables.lobbies]

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle>{PLAY_MOBILE_COPY.tabLounge}</PlayPageTitle>
      <div className="mx-auto grid w-full max-w-5xl items-start gap-6 lg:grid-cols-2">
        <PlayLiveTables
          title={PLAY_HUB_COPY.liveTitle}
          empty={PLAY_HUB_COPY.liveEmpty}
          tables={everyTable}
          mineId={tables.currentId}
          isLocked={Boolean(profile.ban)}
          hasGame
        />
        <PlayOnlineBox tables={everyTable} />
      </div>
    </div>
  )
}
