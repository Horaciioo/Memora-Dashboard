import type { Metadata } from 'next'

import { PlayGroupPanel } from '@/composites/play/group/PlayGroupPanel'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { listInvitablePeople, readPlayGroup } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_GROUP_COPY.title }

/**
 * Group of the player: members, invitations, proposed games
 * @return {Promise<JSX.Element>} - Group page
 */

export default async function PlayGroupPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const [state, candidates] = await Promise.all([
    readPlayGroup(session.id),
    listInvitablePeople(session.id),
  ])

  return (
    <div className={PLAY_PAGE.reading}>
      <PlaySignal topic={PLAY_TOPICS.groups} />
      <PlayPageTitle page="group" body={<PlayGroupPanel state={state} candidates={candidates} />}>
        {PLAY_GROUP_COPY.title}
      </PlayPageTitle>
    </div>
  )
}
