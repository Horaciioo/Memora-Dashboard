import type { ReactNode } from 'react'

import { PlayShell } from '@/composites/play/hub/PlayShell'
import { listNotices, readPlayGroup, readPlayPresence, readPlayProfile } from '@/core/services/play'
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
  const [profile, invites, presence, group] = await Promise.all([
    readPlayProfile(session.id),
    listNotices(session.id),
    readPlayPresence(session.id),
    readPlayGroup(session.id),
  ])

  return (
    <PlayShell
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
