'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/Section'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { useAccess } from '@/core/hooks/data/useAccess'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { PERMISSION_SECTIONS } from '@/declarations/access/permissions'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { FUNCTION_KIND_REGISTRY } from '@/declarations/reference/registries'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toTone } from '@/declarations/ui/theme'
import type { AccessMatrix } from '@/types/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { FunctionKindName } from '@/utils/constants/workflow'
import type { PermissionName } from '@/utils/constants/permissions'

export interface AccessMatrixPanelProps {
  initialMatrix: AccessMatrix
}

/**
 * Permission matrix, one editable column per hierarchy level and per moderation function
 * @param {AccessMatrix} initialMatrix - Matrix resolved server-side
 * @return {JSX.Element}
 */

export const AccessMatrixPanel = ({ initialMatrix }: AccessMatrixPanelProps) => {
  const access = useAccess(initialMatrix)
  const [tab, setTab] = useState('roles')
  const [presetRole, setPresetRole] = useState<MemberRoleName | null>(null)

  const [roleDrafts, setRoleDrafts] = useState(initialMatrix.roles)
  const [functionDrafts, setFunctionDrafts] = useState(
    Object.fromEntries(initialMatrix.functions.map((entry) => [entry.id, entry.permissions]))
  )

  const toggle = (list: PermissionName[], permission: PermissionName) =>
    list.includes(permission)
      ? list.filter((entry) => entry !== permission)
      : [...list, permission]

  const tabs = [
    { value: 'roles', label: ACCESS_COPY.tabRoles, icon: 'shield' as const },
    {
      value: 'functions',
      label: ACCESS_COPY.tabFunctions,
      icon: 'members' as const,
      count: access.matrix.functions.length,
    },
  ]

  return (
    <>
      <Tabs items={tabs} value={tab} onChange={setTab} label={ACCESS_COPY.title} />

      {tab === 'roles' &&
        ROLE_REGISTRY.keys.map((role) => {
          const meta = ROLE_REGISTRY.get(role)
          const draft = roleDrafts[role] ?? []

          return (
            <Section
              key={role}
              title={meta.label}
              description={meta.summary}
              action={
                <>
                  <Button
                    icon="spark"
                    disabled={access.isSaving}
                    onClick={() => setPresetRole(role)}
                  >
                    {ACCESS_COPY.preset}
                  </Button>
                  <Button
                    variant="primary"
                    icon="confirm"
                    disabled={access.isSaving}
                    onClick={() => void access.saveRole(role, draft)}
                  >
                    {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
                  </Button>
                </>
              }
              padded
            >
              <p className="pb-3 text-xs text-[var(--color-ink-subtle)]">
                {`${draft.length} ${draft.length === 1 ? ACCESS_COPY.grantedOne : ACCESS_COPY.granted}`}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {PERMISSION_SECTIONS.map((section) => (
                  <div key={section.group} className="flex flex-col gap-1">
                    <p className="text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase">
                      {section.label}
                    </p>
                    {section.permissions.map((permission) => (
                      <Checkbox
                        key={permission.name}
                        checked={draft.includes(permission.name)}
                        onChange={() =>
                          setRoleDrafts((current) => ({
                            ...current,
                            [role]: toggle(current[role] ?? [], permission.name),
                          }))
                        }
                        label={permission.displayName}
                        hint={permission.important ? permission.description : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          )
        })}

      {tab === 'functions' &&
        (access.matrix.functions.length === 0 ? (
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
            const draft = functionDrafts[jobFunction.id] ?? []
            const kind = FUNCTION_KIND_REGISTRY.get(jobFunction.kind as FunctionKindName)

            return (
              <Section
                key={jobFunction.id}
                title={jobFunction.name}
                description={kind.label}
                action={
                  <Button
                    variant="primary"
                    icon="confirm"
                    disabled={access.isSaving}
                    onClick={() => void access.saveFunction(jobFunction.id, draft)}
                  >
                    {access.isSaving ? ACTION_COPY.saving : ACCESS_COPY.save}
                  </Button>
                }
                padded
              >
                <p className="flex flex-wrap items-center gap-2 pb-3 text-xs text-[var(--color-ink-subtle)]">
                  <Badge label={kind.label} tone={toTone(kind.accent, 'neutral')} />
                  {`${draft.length} ${draft.length === 1 ? ACCESS_COPY.grantedOne : ACCESS_COPY.granted}`}
                </p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {PERMISSION_SECTIONS.map((section) => (
                    <div key={section.group} className="flex flex-col gap-1">
                      <p className="text-xs font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase">
                        {section.label}
                      </p>
                      {section.permissions.map((permission) => (
                        <Checkbox
                          key={permission.name}
                          checked={draft.includes(permission.name)}
                          onChange={() =>
                            setFunctionDrafts((current) => ({
                              ...current,
                              [jobFunction.id]: toggle(current[jobFunction.id] ?? [], permission.name),
                            }))
                          }
                          label={permission.displayName}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </Section>
            )
          })
        ))}

      <ConfirmDialog
        open={presetRole !== null}
        title={ACCESS_COPY.presetTitle}
        description={ACCESS_COPY.presetDescription}
        confirmLabel={ACCESS_COPY.preset}
        pending={access.isSaving}
        onCancel={() => setPresetRole(null)}
        onConfirm={async () => {
          await access.applyPreset(presetRole!)
          setPresetRole(null)
        }}
      />
    </>
  )
}
