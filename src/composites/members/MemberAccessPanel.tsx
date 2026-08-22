'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { Section } from '@/components/structures/Section'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { PERMISSION_SECTIONS } from '@/declarations/access/permissions'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import type { PermissionName } from '@/utils/constants/permissions'

export interface MemberAccessPanelProps {
  overrides: MemberOverride[]
  isSaving: boolean
  onSave: (next: MemberOverride[]) => Promise<boolean>
}

/**
 * Per-account permission overrides, on top of what the role and the functions already grant
 * @param {MemberOverride[]} overrides - Stored overrides
 * @param {boolean} isSaving - Mutation in flight
 * @param {(next: MemberOverride[]) => Promise<boolean>} onSave - Save handler
 * @return {JSX.Element}
 */

export const MemberAccessPanel = ({ overrides, isSaving, onSave }: MemberAccessPanelProps) => {
  const [draft, setDraft] = useState<MemberOverride[]>(overrides)

  const stateOf = (permission: PermissionName) =>
    draft.find((entry) => entry.permission === permission)

  // Each click walks inherited, then allowed, then denied
  const cycle = (permission: PermissionName) =>
    setDraft((current) => {
      const existing = current.find((entry) => entry.permission === permission)

      if (!existing) return [...current, { permission, allowed: true }]
      if (existing.allowed) {
        return current.map((entry) =>
          entry.permission === permission ? { permission, allowed: false } : entry
        )
      }

      return current.filter((entry) => entry.permission !== permission)
    })

  return (
    <Section
      title={MEMBER_COPY.accessTitle}
      description={MEMBER_COPY.accessLead}
      action={
        <Button
          variant="primary"
          icon="confirm"
          disabled={isSaving}
          onClick={() => void onSave(draft)}
        >
          {isSaving ? ACTION_COPY.saving : MEMBER_COPY.accessSave}
        </Button>
      }
      padded
    >
      <div className="flex flex-col gap-5">
        {PERMISSION_SECTIONS.map((section) => (
          <div key={section.group} className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase">
              {section.label}
            </p>
            {section.permissions.map((permission) => {
              const override = stateOf(permission.name)

              return (
                <Checkbox
                  key={permission.name}
                  checked={override?.allowed === true}
                  onChange={() => cycle(permission.name)}
                  label={permission.displayName}
                  hint={
                    override === undefined
                      ? MEMBER_COPY.accessInherited
                      : override.allowed
                        ? permission.description
                        : `${ACTION_COPY.no} · ${permission.description}`
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
    </Section>
  )
}
