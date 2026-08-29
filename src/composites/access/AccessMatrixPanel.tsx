'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PermissionPicker } from '@/components/structures/PermissionPicker'
import { Section } from '@/components/structures/Section'
import { FileTabs } from '@/components/structures/FileTabs'
import { useAccess } from '@/core/hooks/data/useAccess'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { FUNCTION_KIND_REGISTRY } from '@/declarations/reference/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'

import type { PermissionDraft } from '@/components/structures/PermissionPicker'
import type { AccessMatrix } from '@/types/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { FunctionKindName } from '@/utils/constants/workflow'
import type { PermissionName } from '@/utils/constants/permissions'

export interface AccessMatrixPanelProps {
  initialMatrix: AccessMatrix
}

/**
 * Turn a stored permission list into a picker draft
 * @param {PermissionName[]} permissions - Granted permissions
 * @return {PermissionDraft} - Draft
 */

const toDraft = (permissions: PermissionName[]): PermissionDraft =>
  Object.fromEntries(permissions.map((permission) => [permission, 'allowed']))

/**
 * Read the granted permissions back out of a draft
 * @param {PermissionDraft} draft - Current draft
 * @return {PermissionName[]} - Granted permissions
 */

const fromDraft = (draft: PermissionDraft): PermissionName[] =>
  (Object.keys(draft) as PermissionName[]).filter((permission) => draft[permission] === 'allowed')

/**
 * Count the entries a draft changed against the saved list
 * @param {PermissionDraft} draft - Current draft
 * @param {PermissionName[]} saved - Saved permissions
 * @return {number} - Change count
 */

const countChanges = (draft: PermissionDraft, saved: PermissionName[]): number => {
  const next = new Set(fromDraft(draft))
  const previous = new Set(saved)

  return [...new Set([...next, ...previous])].filter(
    (permission) => next.has(permission) !== previous.has(permission)
  ).length
}

/**
 * Permission matrix, one editable column per hierarchy level and per moderation function
 * @param {AccessMatrix} initialMatrix - Matrix resolved server-side
 * @return {JSX.Element}
 */

export const AccessMatrixPanel = ({ initialMatrix }: AccessMatrixPanelProps) => {
  const access = useAccess(initialMatrix)
  const [presetRole, setPresetRole] = useState<MemberRoleName | null>(null)

  const [roleDrafts, setRoleDrafts] = useState<Record<string, PermissionDraft>>(() =>
    Object.fromEntries(
      Object.entries(initialMatrix.roles).map(([role, permissions]) => [role, toDraft(permissions)])
    )
  )

  const [functionDrafts, setFunctionDrafts] = useState<Record<string, PermissionDraft>>(() =>
    Object.fromEntries(
      initialMatrix.functions.map((entry) => [entry.id, toDraft(entry.permissions)])
    )
  )

  const roleTab = () => (
    <>
      {ROLE_REGISTRY.keys.map((role) => {
        const meta = ROLE_REGISTRY.get(role)
        const draft = roleDrafts[role] ?? {}
        const saved = access.matrix.roles[role] ?? []
        const pending = countChanges(draft, saved)

        return (
          <Section
            key={role}
            title={meta.label}
            description={meta.summary}
            action={
              <>
                <Button icon="spark" disabled={access.isSaving} onClick={() => setPresetRole(role)}>
                  {ACCESS_COPY.preset}
                </Button>
                <Button
                  variant="primary"
                  icon="confirm"
                  disabled={access.isSaving || pending === 0}
                  onClick={() => void access.saveRole(role, fromDraft(draft))}
                >
                  {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
                </Button>
              </>
            }
            padded
          >
            <PermissionPicker
              mode="binary"
              value={draft}
              pending={pending}
              onChange={(next) => setRoleDrafts((current) => ({ ...current, [role]: next }))}
            />
          </Section>
        )
      })}
    </>
  )

  const functionTab = () => (
    <>
      {access.matrix.functions.length === 0 ? (
        <EmptyState
          figure="moderation"
          title={ACCESS_COPY.functionsEmptyTitle}
          description={ACCESS_COPY.functionsEmptyDescription}
          action={
            <Link href={ROUTES.settingsSection('fonctions')}>
              <Button variant="primary" icon="settings">
                {ACCESS_COPY.configure}
              </Button>
            </Link>
          }
        />
      ) : (
        access.matrix.functions.map((jobFunction) => {
          const draft = functionDrafts[jobFunction.id] ?? {}
          const kind = FUNCTION_KIND_REGISTRY.get(jobFunction.kind as FunctionKindName)
          const pending = countChanges(draft, jobFunction.permissions)

          return (
            <Section
              key={jobFunction.id}
              title={jobFunction.name}
              description={kind.label}
              action={
                <Button
                  variant="primary"
                  icon="confirm"
                  disabled={access.isSaving || pending === 0}
                  onClick={() => void access.saveFunction(jobFunction.id, fromDraft(draft))}
                >
                  {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
                </Button>
              }
              padded
            >
              <p className="pb-3">
                <Badge label={kind.label} accent={kind.accent} tone={'neutral'} />
              </p>
              <PermissionPicker
                mode="binary"
                value={draft}
                pending={pending}
                onChange={(next) =>
                  setFunctionDrafts((current) => ({ ...current, [jobFunction.id]: next }))
                }
              />
            </Section>
          )
        })
      )}
    </>
  )

  return (
    <>
      <FileTabs
        label={ACCESS_COPY.title}
        tabs={[
          { value: 'roles', label: ACCESS_COPY.tabRoles, icon: 'shield', render: roleTab },
          {
            value: 'functions',
            label: ACCESS_COPY.tabFunctions,
            icon: 'members',
            render: functionTab,
          },
        ]}
      />

      <ConfirmDialog
        open={presetRole !== null}
        title={ACCESS_COPY.presetTitle}
        description={ACCESS_COPY.presetDescription}
        confirmLabel={ACCESS_COPY.preset}
        pending={access.isSaving}
        onCancel={() => setPresetRole(null)}
        onConfirm={async () => {
          const role = presetRole!
          const next = await access.applyPreset(role)
          if (next) {
            setRoleDrafts((current) => ({ ...current, [role]: toDraft(next.roles[role] ?? []) }))
          }
          setPresetRole(null)
        }}
      />
    </>
  )
}
