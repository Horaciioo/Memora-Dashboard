import type { Metadata } from 'next'

import { PlayFeedBox } from '@/composites/play/dock/PlayFeedBox'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { listNotices, listPlayHistory, readPlayPresence } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_BOX, PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_MOBILE_COPY.tabFeed }

/**
 * Feed page: the game being played, last games and invitations
 * @return {Promise<JSX.Element>} - Feed page
 */

export default async function PlayFeedPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const [invites, presence, { entries }] = await Promise.all([
    listNotices(session.id),
    readPlayPresence(session.id),
    listPlayHistory(session.id, { game: null, cursor: null }),
  ])

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.notices} />
      <div className={PLAY_BOX.stack}>
        <PlayPageTitle>{PLAY_MOBILE_COPY.tabFeed}</PlayPageTitle>
        <PlayFeedBox presence={presence} invites={invites} history={entries} />
      </div>
    </div>
  )
}
