import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PlayGroupRoom } from '@/composites/play/group/PlayGroupRoom'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { listGroupCandidates, readGroupOverview, readPlayGroup } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_GROUP_COPY.title }

/**
 * One group as a full page: chat, games, members
 * @param {Object} props - Route
 * @param {Promise<{ groupId: string }>} props.params - Group id
 * @return {Promise<JSX.Element>} - Group room
 */

export default async function PlayGroupRoomPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const { session } = await requirePermission(Permissions.PlayAccess)
  const [state, candidates, overview] = await Promise.all([
    readPlayGroup(session.id),
    listGroupCandidates(session.id),
    readGroupOverview(session.id, groupId).catch(() => null),
  ])
  const group = state.groups.find((entry) => entry.id === groupId)

  // Left or dissolved
  if (!group || !overview) redirect(ROUTES.playGroup)

  return (
    <div className={PLAY_PAGE.frame}>
      <PlaySignal topic={PLAY_TOPICS.groups} />
      <PlayGroupRoom
        group={group}
        viewerId={session.id}
        overview={overview}
        candidates={candidates[groupId] ?? []}
      />
    </div>
  )
}
