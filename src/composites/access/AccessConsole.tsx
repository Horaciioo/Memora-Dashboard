'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FilterBar } from '@/components/structures/FilterBar'
import { FileTabs } from '@/components/structures/FileTabs'
import { AccessSimulationDialog } from '@/composites/access/AccessSimulationDialog'
import { RoleDisplayTab } from '@/composites/access/RoleDisplayTab'
import { RoleList } from '@/composites/access/RoleList'
import { RoleMembersTab } from '@/composites/access/RoleMembersTab'
import { RolePermissionsTab } from '@/composites/access/RolePermissionsTab'
import { useAccess } from '@/core/hooks/data/useAccess'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { FUNCTION_KIND_REGISTRY } from '@/declarations/reference/registries'
import { ACCESS_CONSOLE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'
import type { AccessSimulation } from '@/types/access'
import type {
  AccessConsole as AccessConsoleData,
  FunctionGrantsView,
  RoleGrantsView,
} from '@/types/access'
import type { FunctionKindName } from '@/utils/constants/workflow'

/**
 * Role or function currently open
 * @typedef {Object} AccessSelection
 */

export type AccessSelection =
  { kind: 'role'; role: RoleGrantsView } | { kind: 'function'; fn: FunctionGrantsView }

/**
 * Identity glyph of the open row
 * @param {string | null} icon - Stored glyph key
 * @return {JSX.Element | null}
 */

const DetailIcon = ({ icon }: { icon: string | null }) => {
  if (!icon || !(icon in ICONS)) return null

  const Glyph = ICONS[icon as keyof typeof ICONS]

  return <Glyph className={ACCESS_CONSOLE.detailIcon} aria-hidden="true" />
}

export interface AccessConsoleProps {
  initial: AccessConsoleData
  canManageEncadrement: boolean
}

/**
 * Access console — a rail of roles that collapses into an Affichage / Permissions / Membres
 * panel. The creator filter picks which overwrite layer every switch below writes to
 * @param {AccessConsoleData} initial - Console resolved server-side
 * @param {boolean} canManageEncadrement - Viewer may write the encadrement levels
 * @return {JSX.Element}
 */

export const AccessConsole = ({ initial, canManageEncadrement }: AccessConsoleProps) => {
  const access = useAccess(initial)
  const { factor, promptUnlock } = useSeal()
  const { isAdmin } = useAuthContext()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [simulation, setSimulation] = useState<AccessSimulation | null>(null)

  // Resolve the live row behind the pick
  const selection: AccessSelection | null = (() => {
    if (selectedId === null) return null

    const role = access.console.roles.find((entry) => entry.role === selectedId)
    if (role) return { kind: 'role', role }

    const fn = access.console.functions.find((entry) => entry.id === selectedId)

    return fn ? { kind: 'function', fn } : null
  })()

  const Back = ICONS.back
  const layer = access.console.youtuberId

  // A creator narrows the rail to the functions it actually opens
  const opened = access.console.perimeter.find((creator) => creator.id === layer)
  const needle = search.trim().toLowerCase()

  const roles = access.console.roles
  const functions = access.console.functions
    .filter((entry) => (opened ? opened.functionIds.includes(entry.id) : true))
    .filter((entry) => needle.length === 0 || entry.name.toLowerCase().includes(needle))

  const selectedIcon = selection
    ? selection.kind === 'role'
      ? selection.role.icon
      : selection.fn.icon
    : null
  const accent = selection
    ? selection.kind === 'role'
      ? selection.role.accent
      : selection.fn.accent
    : null
  const name =
    selection?.kind === 'role'
      ? selection.role.label
      : selection?.kind === 'function'
        ? selection.fn.name
        : ''
  const kindLabel =
    selection?.kind === 'function'
      ? FUNCTION_KIND_REGISTRY.get(selection.fn.kind as FunctionKindName).label
      : null

  const memberCount =
    selection?.kind === 'role'
      ? selection.role.members
      : selection?.kind === 'function'
        ? selection.fn.holders
        : 0

  const simulate = async () => {
    if (!selection) return

    const next = await access.simulate(
      selection.kind === 'role'
        ? { role: selection.role.role }
        : {
            functionId: selection.fn.id,
            category: selection.fn.category,
            label: selection.fn.name,
          }
    )

    if (next) setSimulation(next)
  }

  return (
    <>
      <div className={ACCESS_CONSOLE.layerBar}>
        <FilterBar
          searchLabel={ACCESS_COPY.search}
          search={search}
          onSearch={setSearch}
          filters={[
            {
              name: 'youtuberId',
              label: ACCESS_COPY.layerLabel,
              allLabel: ACCESS_COPY.layerGlobal,
              mark: 'dot',
              options: access.console.perimeter.map((creator) => ({
                value: creator.id,
                label: creator.name,
                accent: creator.accent ?? undefined,
              })),
            },
          ]}
          values={{ youtuberId: layer ?? '' }}
          onFilter={(_, value) => void access.openLayer(value || null)}
          onReset={() => {
            setSearch('')
            void access.openLayer(null)
          }}
          isFiltered={layer !== null || search.length > 0}
        />
        {layer !== null && <p className={ACCESS_CONSOLE.detailKind}>{ACCESS_COPY.layerLead}</p>}
      </div>

      <div className={ACCESS_CONSOLE.shell}>
        <div className={cn(ACCESS_CONSOLE.rail, selection && ACCESS_CONSOLE.railHidden)}>
          <RoleList
            roles={roles}
            functions={functions}
            selectedId={selectedId}
            canManageEncadrement={canManageEncadrement}
            access={access}
            onPick={(next) => setSelectedId(next.kind === 'role' ? next.role.role : next.fn.id)}
          />
        </div>

        <div className={ACCESS_CONSOLE.detail}>
          {selection === null ? (
            <p className={ACCESS_CONSOLE.prompt}>{ACCESS_COPY.pickRolePrompt}</p>
          ) : (
            <>
              <button
                type="button"
                className={ACCESS_CONSOLE.back}
                onClick={() => setSelectedId(null)}
              >
                <Back className={ACCESS_CONSOLE.backIcon} aria-hidden="true" />
                {ACCESS_COPY.back}
              </button>

              <div className={ACCESS_CONSOLE.detailHead}>
                <span
                  className={cn(ACCESS_CONSOLE.detailDot, 'accent-dot')}
                  style={accentVars(accent, 'neutral')}
                  aria-hidden="true"
                />
                <DetailIcon icon={selectedIcon} />
                <span className={ACCESS_CONSOLE.detailName}>{name}</span>
                {kindLabel && <span className={ACCESS_CONSOLE.detailKind}>{kindLabel}</span>}
                <span className={ACCESS_CONSOLE.detailActions}>
                  <Button icon="visible" disabled={access.isSaving} onClick={() => void simulate()}>
                    {ACCESS_COPY.simulate}
                  </Button>
                </span>
              </div>

              <FileTabs
                key={selectedId}
                label={name}
                tabs={[
                  {
                    value: 'display',
                    label: ACCESS_COPY.tabDisplay,
                    icon: 'edit',
                    render: () => (
                      <RoleDisplayTab
                        selection={selection}
                        access={access}
                        onDeleted={() => setSelectedId(null)}
                      />
                    ),
                  },
                  {
                    value: 'permissions',
                    label: ACCESS_COPY.tabPermissions,
                    icon: 'shield',
                    render: () => (
                      <RolePermissionsTab
                        selection={selection}
                        access={access}
                        sealed={!isAdmin && !factor.seal.isUnsealed}
                        onSealed={promptUnlock}
                      />
                    ),
                  },
                  {
                    value: 'members',
                    label: `${ACCESS_COPY.tabMembers} · ${memberCount}`,
                    icon: 'members',
                    render: () => <RoleMembersTab selection={selection} access={access} />,
                  },
                ]}
              />
            </>
          )}
        </div>
      </div>

      <AccessSimulationDialog simulation={simulation} onClose={() => setSimulation(null)} />
    </>
  )
}
