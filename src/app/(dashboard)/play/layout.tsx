import type { ReactNode } from 'react'

import { PlayShell } from '@/composites/play/hub/PlayShell'
import {
  claimTrophies,
  listNotices,
  readPlayGroup,
  readPlayPresence,
  readPlayProfile,
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
  const { session } = await requirePermission(Permissions.PlayAccess)
  // Trophies won before they paid, once
  await claimTrophies(session.id)
  const [profile, invites, presence, group, trophyNotice] = await Promise.all([
    readPlayProfile(session.id),
    listNotices(session.id),
    readPlayPresence(session.id),
    readPlayGroup(session.id),
    readTrophyNotice(session.id),
  ])

  return (
    <PlayShell
      trophyNotice={trophyNotice}
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
