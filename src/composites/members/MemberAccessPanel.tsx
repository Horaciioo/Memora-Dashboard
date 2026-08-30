'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { PermissionPicker } from '@/components/structures/PermissionPicker'
import { Section } from '@/components/structures/Section'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { PermissionDraft } from '@/components/structures/PermissionPicker'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import type { PermissionName } from '@/utils/constants/permissions'

export interface MemberAccessPanelProps {
  overrides: MemberOverride[]
  inherited: PermissionName[]
  isSaving: boolean
  onSave: (next: MemberOverride[]) => Promise<boolean>
}

/**
 * Turn stored overrides into a picker draft
 * @param {MemberOverride[]} overrides - Stored overrides
 * @return {PermissionDraft} - Draft
 */

const toDraft = (overrides: MemberOverride[]): PermissionDraft =>
  Object.fromEntries(
    overrides.map((entry) => [entry.permission, entry.allowed ? 'allowed' : 'denied'])
  )

/**
 * Read the overrides back out of a draft, inheritance leaving no row behind
 * @param {PermissionDraft} draft - Current draft
 * @return {MemberOverride[]} - Overrides to persist
 */

const fromDraft = (draft: PermissionDraft): MemberOverride[] =>
  (Object.keys(draft) as PermissionName[])
    .filter((permission) => draft[permission] !== 'inherited')
    .map((permission) => ({ permission, allowed: draft[permission] === 'allowed' }))

/**
 * Per-account permission overrides, on top of what the role and the functions already grant
 * @param {MemberOverride[]} overrides - Stored overrides
 * @param {PermissionName[]} inherited - Permissions the role and functions already grant
 * @param {boolean} isSaving - Mutation in flight
 * @param {(next: MemberOverride[]) => Promise<boolean>} onSave - Save handler
 * @return {JSX.Element}
 */

export const MemberAccessPanel = ({
  overrides,
  inherited,
  isSaving,
  onSave,
}: MemberAccessPanelProps) => {
  const [draft, setDraft] = useState<PermissionDraft>(() => toDraft(overrides))
  const pending = fromDraft(draft).length

  return (
    <Section
      title={MEMBER_COPY.accessTitle}
      description={MEMBER_COPY.accessLead}
      action={
        <>
          <MaturityTag maturity="beta" />
          <Button
            variant="primary"
            icon="confirm"
            disabled={isSaving}
            onClick={() => void onSave(fromDraft(draft))}
          >
            {isSaving ? ACTION_COPY.saving : MEMBER_COPY.accessSave}
          </Button>
        </>
      }
      padded
    >
      <PermissionPicker
        mode="tristate"
        value={draft}
        baseline={inherited}
        pending={pending}
        onChange={setDraft}
      />
    </Section>
  )
}
