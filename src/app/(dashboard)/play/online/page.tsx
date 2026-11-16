import type { Metadata } from 'next'

import { PlayOnlineBox } from '@/composites/play/hub/PlayOnlineBox'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { listLobbies } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_BOX, PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_MOBILE_COPY.online }

/**
 * Online page: players present in Play
 * @return {Promise<JSX.Element>} - Online page
 */

export default async function PlayOnlinePage() {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const tables = await listLobbies(session.id, null, access.can(Permissions.PlayManage))

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <div className={PLAY_BOX.stack}>
        <PlayPageTitle
          body={<PlayOnlineBox isFlat tables={[...tables.running, ...tables.lobbies]} />}
        >
          {PLAY_MOBILE_COPY.online}
        </PlayPageTitle>
      </div>
    </div>
  )
}
