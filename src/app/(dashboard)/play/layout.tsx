import type { ReactNode } from 'react'

import { PlayShell } from '@/composites/play/hub/PlayShell'
import { listInvites, readPlayPresence, readPlayProfile } from '@/core/services/play'
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
  const [profile, invites, presence] = await Promise.all([
    readPlayProfile(session.id),
    listInvites(session.id),
    readPlayPresence(session.id),
  ])

  return (
    <PlayShell
      dock={{
        profile,
        invites,
        presence,
        player: { name: session.displayName, avatarUrl: session.avatarUrl },
      }}
    >
      {children}
    </PlayShell>
  )
}
