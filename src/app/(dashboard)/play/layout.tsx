import type { ReactNode } from 'react'

import { PlayShell } from '@/composites/play/hub/PlayShell'
import {
  claimTrophies,
  listLobbies,
  listNotices,
  readPlayFriends,
  readPlayGroup,
  readPlayPresence,
  readPlayProfile,
  readLevelNotice,
  readTrophyNotice,
} from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Memora Play wears its own room, the dock at its foot
 * @param {Object} props - Layout props
 * @param {ReactNode} props.children - Play page
 * @return {Promise<JSX.Element>}
 */

export default async function PlayLayout({ children }: { children: ReactNode }) {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  // Trophies won before they paid, once
  await claimTrophies(session.id)
  const [profile, invites, presence, group, trophyNotice, levelNotice, friends, lobbies] = await Promise.all([
    readPlayProfile(session.id),
    listNotices(session.id),
    readPlayPresence(session.id),
    readPlayGroup(session.id),
    readTrophyNotice(session.id),
    readLevelNotice(session.id),
    readPlayFriends(session.id),
    listLobbies(session.id, null, access.can(Permissions.PlayManage)),
  ])

  return (
    <PlayShell
      trophyNotice={trophyNotice}
      levelNotice={trophyNotice ? null : levelNotice}
      friends={friends}
      tables={[...lobbies.running, ...lobbies.lobbies]}
      dock={{
        profile,
        invites,
        presence,
        groupCalls: group.invitations.length,
        player: { id: session.id, name: session.displayName, avatarUrl: session.avatarUrl },
      }}
    >
      {children}
    </PlayShell>
  )
}
