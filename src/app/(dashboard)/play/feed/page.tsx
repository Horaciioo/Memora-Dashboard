import type { Metadata } from 'next'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayHistory } from '@/composites/play/mobile/PlayHistory'
import { listPlayHistory } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_MOBILE_COPY, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_MOBILE_COPY.tabFeed }

/**
 * Histories page: the last games the player finished
 * @return {Promise<JSX.Element>} - Histories page
 */

export default async function PlayFeedPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const { entries } = await listPlayHistory(session.id, {
    game: null,
    cursor: null,
    size: PLAY_SETTINGS.feedRecent,
  })

  return (
    <div className={PLAY_PAGE.reading}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle page="feed" body={<PlayHistory entries={entries} />}>
        {PLAY_MOBILE_COPY.tabFeed}
      </PlayPageTitle>
    </div>
  )
}
