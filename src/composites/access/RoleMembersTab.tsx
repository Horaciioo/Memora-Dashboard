'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Dialog } from '@/components/structures/Dialog'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { FLOOR_ROLE, ROLE_REGISTRY } from '@/declarations/access/roles'
import { ROUTES } from '@/declarations/navigation'
import { ACCESS_CONSOLE } from '@/declarations/ui/blocks'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { AccessCollection } from '@/core/hooks/data/useAccess'
import type { AccessSelection } from '@/composites/access/AccessConsole'
import type { AccessMemberView } from '@/types/access'

export interface RoleMembersTabProps {
  selection: AccessSelection
  access: AccessCollection
}

/**
 * Members tab — the accounts carrying the selected role or function
 * @param {AccessSelection} selection - Role or function on screen
 * @param {AccessCollection} access - Console state and mutations
 * @return {JSX.Element}
 */

export const RoleMembersTab = ({ selection, access }: RoleMembersTabProps) => {
  const [adding, setAdding] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const roster = access.console.roster

  const holds = (account: AccessMemberView): boolean =>
    selection.kind === 'role'
      ? account.role === selection.role.role
      : account.functionIds.includes(selection.fn.id)

  const members = roster.filter(holds)

  // Neither a leader nor the administration is seated from this tab
  const candidates = roster.filter((account) => account.role === FLOOR_ROLE && !holds(account))

  const confirm = async () => {
    if (picked.length === 0) return

    const target =
      selection.kind === 'role' ? { role: selection.role.role } : { functionId: selection.fn.id }

    await access.addMembers(picked, target)
    setPicked([])
    setAdding(false)
  }

  const addButton = (
    <Button variant="primary" icon="add" disabled={access.isSaving} onClick={() => setAdding(true)}>
      {ACCESS_COPY.memberAdd}
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      {members.length === 0 ? (
        <EmptyState
          figure="members"
          compact
          title={ACCESS_COPY.membersEmpty}
          description={ACCESS_COPY.membersEmptyLead}
          action={addButton}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">{addButton}</div>
          <ul className={ACCESS_CONSOLE.members}>
            {members.map((account) => (
              <li key={account.id} className={ACCESS_CONSOLE.memberRow}>
                <Link href={ROUTES.member(account.id)} className={ACCESS_CONSOLE.member}>
                  <Avatar name={account.displayName} src={account.avatarUrl} size="xs" />
                  <span className={ACCESS_CONSOLE.memberName}>{account.displayName}</span>
                  <span className={ACCESS_CONSOLE.memberRole}>
                    {ROLE_REGISTRY.get(account.role).label}
                  </span>
                </Link>
                <Button
                  variant="icon"
                  icon="close"
                  aria-label={ACCESS_COPY.memberRemove}
                  title={ACCESS_COPY.memberRemove}
                  disabled={access.isSaving}
                  onClick={() =>
                    void access.removeMember(
                      account.id,
                      selection.kind === 'function' ? selection.fn.id : null
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title={ACCESS_COPY.memberAdd}
        description={ACCESS_COPY.memberAddLead}
        size="sm"
        footer={
          <>
            <Button onClick={() => setAdding(false)}>{ACCESS_COPY.cancel}</Button>
            <Button
              variant="primary"
              disabled={access.isSaving || picked.length === 0}
              onClick={() => void confirm()}
            >
              {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
            </Button>
          </>
        }
      >
        {candidates.length === 0 ? (
          <p className={ACCESS_CONSOLE.detailKind}>{ACCESS_COPY.memberAddEmpty}</p>
        ) : (
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {candidates.map((account) => (
              <Checkbox
                key={account.id}
                checked={picked.includes(account.id)}
                label={account.displayName}
                onChange={(on) =>
                  setPicked((current) =>
                    on ? [...current, account.id] : current.filter((id) => id !== account.id)
                  )
                }
              />
            ))}
          </div>
        )}
      </Dialog>
    </div>
  )
}
