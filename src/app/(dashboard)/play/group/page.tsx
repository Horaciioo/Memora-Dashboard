import type { Metadata } from 'next'

import { PlayGroupPanel } from '@/composites/play/group/PlayGroupPanel'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/PlaySignal'
import { readPlayGroup } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_GROUP_COPY.title }

/**
 * Group of the player: members, invitations, proposed games
 * @return {Promise<JSX.Element>} - Group page
 */

export default async function PlayGroupPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const state = await readPlayGroup(session.id)

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.groups} />
      <PlayPageTitle>{PLAY_GROUP_COPY.title}</PlayPageTitle>
      <PlayGroupPanel state={state} />
    </div>
  )
}
