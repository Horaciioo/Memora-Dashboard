'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { PermissionBoard } from '@/components/structures/PermissionBoard'
import { countChanges, fromDraft, toDraft } from '@/core/lib/permissions'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { PermissionDraft } from '@/core/lib/permissions'
import type { AccessCollection } from '@/core/hooks/data/useAccess'
import type { AccessSelection } from '@/composites/access/AccessConsole'

export interface RolePermissionsTabProps {
  selection: AccessSelection
  access: AccessCollection
  sealed: boolean
  onSealed: () => void
}

/**
 * Permissions tab — the page-by-page switch board of the selected role or function
 * @param {AccessSelection} selection - Role or function on screen
 * @param {AccessCollection} access - Console state and mutations
 * @param {boolean} sealed - The second factor still has to be opened before writing
 * @param {() => void} onSealed - Asks for the code rather than attempting the write
 * @return {JSX.Element}
 */

export const RolePermissionsTab = ({
  selection,
  access,
  sealed,
  onSealed,
}: RolePermissionsTabProps) => {
  const holder = selection.kind === 'role' ? selection.role : selection.fn
  const saved = toDraft(holder.permissions)
  const locked = selection.kind === 'role' && selection.role.locked

  const [draft, setDraft] = useState<PermissionDraft>(saved)
  const [resetting, setResetting] = useState(false)
  const pending = countChanges(draft, saved)

  const save = () => {
    // Only an administrator writes permissions without opening the second factor first
    if (sealed) {
      onSealed()

      return
    }

    const overwrites = fromDraft(draft)

    if (selection.kind === 'role') void access.saveRole(selection.role.role, overwrites)
    else void access.saveFunction(selection.fn.id, overwrites)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {selection.kind === 'role' && !locked && access.console.youtuberId === null && (
          <Button icon="spark" disabled={access.isSaving} onClick={() => setResetting(true)}>
            {ACCESS_COPY.preset}
          </Button>
        )}
        <Button
          variant="primary"
          icon="confirm"
          disabled={access.isSaving || locked || pending === 0}
          onClick={save}
        >
          {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
        </Button>
      </div>

      <PermissionBoard
        value={draft}
        baseline={holder.baseline}
        pending={pending}
        readOnly={locked}
        onChange={setDraft}
      />

      {selection.kind === 'role' && (
        <ConfirmDialog
          open={resetting}
          title={ACCESS_COPY.presetTitle}
          description={ACCESS_COPY.presetDescription}
          confirmLabel={ACCESS_COPY.preset}
          tone="brand"
          pending={access.isSaving}
          onCancel={() => setResetting(false)}
          onConfirm={async () => {
            const next = await access.applyPreset(selection.role.role)
            setResetting(false)
            if (next) {
              const fresh = next.roles.find((entry) => entry.role === selection.role.role)
              if (fresh) setDraft(toDraft(fresh.permissions))
            }
          }}
        />
      )}
    </div>
  )
}
