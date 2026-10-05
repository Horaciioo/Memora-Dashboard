'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiGet, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { PermissionOverwrite } from '@/core/lib/permissions'
import type { AccessConsole, AccessSimulation } from '@/types/access'
import type { AccessCategoryName, MemberRoleName } from '@/utils/constants/hierarchy'
import type { FunctionKindName } from '@/utils/constants/workflow'

/**
 * Colour and glyph of a role or function
 * @typedef {Object} AppearancePatch
 * @property {string | null} accent - Stored colour
 * @property {string | null} icon - Glyph key
 */

export interface AppearancePatch {
  accent: string | null
  icon: string | null
}

/**
 * Identity of a new function
 * @typedef {Object} FunctionInput
 * @property {string} name - Function name
 * @property {AccessCategoryName} category - Rail section
 * @property {FunctionKindName} kind - Primary or secondary holder slot
 * @property {string | null} accent - Stored colour
 * @property {string | null} icon - Glyph key
 * @property {string | null} summary - Short description
 */

export interface FunctionInput {
  name: string
  category: AccessCategoryName
  kind: FunctionKindName
  accent: string | null
  icon: string | null
  summary: string | null
}

/**
 * Access console state and mutations
 * @typedef {Object} AccessCollection
 * @property {AccessConsole} console - Roles
 * @property {boolean} isSaving - Mutation in flight
 * @property {(youtuberId: string | null) => Promise<AccessConsole | null>} openLayer - Switch creator
 * @property {(role: MemberRoleName, overwrites: PermissionOverwrite[]) => Promise<AccessConsole | null>} saveRole - Replace a role overwrite
 * @property {(functionId: string, overwrites: PermissionOverwrite[]) => Promise<AccessConsole | null>} saveFunction - Replace a function overwrite
 * @property {(role: MemberRoleName) => Promise<AccessConsole | null>} applyPreset - Restore the declared preset
 * @property {(role: MemberRoleName, patch: AppearancePatch) => Promise<AccessConsole | null>} saveRoleAppearance - Recolour a role
 * @property {(input: FunctionInput) => Promise<AccessConsole | null>} createFunction - Land a function
 * @property {(id: string, patch: Partial<FunctionInput>) => Promise<AccessConsole | null>} updateFunction - Edit a function
 * @property {(id: string) => Promise<AccessConsole | null>} deleteFunction - Drop a function
 * @property {(accountIds: string[], target: MemberTarget) => Promise<AccessConsole | null>} addMembers - Seat accounts
 * @property {(accountId: string, functionId: string | null) => Promise<AccessConsole | null>} removeMember - Unseat one account
 * @property {(target: SimulationTarget) => Promise<AccessSimulation | null>} simulate - Resolve effective access
 */

/**
 * Role or function a set of accounts is seated on
 * @typedef {Object} MemberTarget
 * @property {MemberRoleName} [role] - Hierarchy level
 * @property {string} [functionId] - Function identifier
 * @property {FunctionKindName} [kind] - Holder slot of the function
 */

export interface MemberTarget {
  role?: MemberRoleName
  functionId?: string
  kind?: FunctionKindName
}

/**
 * Role or function the preview resolves
 * @typedef {Object} SimulationTarget
 * @property {MemberRoleName} [role] - Hierarchy level
 * @property {string} [functionId] - Function identifier
 * @property {AccessCategoryName} [category] - Rail section of the function
 * @property {string} [label] - Name shown in the preview
 */

export interface SimulationTarget {
  role?: MemberRoleName
  functionId?: string
  category?: AccessCategoryName
  label?: string
}

export interface AccessCollection {
  console: AccessConsole
  isSaving: boolean
  openLayer: (youtuberId: string | null) => Promise<AccessConsole | null>
  saveRole: (
    role: MemberRoleName,
    overwrites: PermissionOverwrite[]
  ) => Promise<AccessConsole | null>
  saveFunction: (
    functionId: string,
    overwrites: PermissionOverwrite[]
  ) => Promise<AccessConsole | null>
  applyPreset: (role: MemberRoleName) => Promise<AccessConsole | null>
  saveRoleAppearance: (
    role: MemberRoleName,
    patch: AppearancePatch
  ) => Promise<AccessConsole | null>
  createFunction: (input: FunctionInput) => Promise<AccessConsole | null>
  updateFunction: (id: string, patch: Partial<FunctionInput>) => Promise<AccessConsole | null>
  deleteFunction: (id: string) => Promise<AccessConsole | null>
  addMembers: (accountIds: string[], target: MemberTarget) => Promise<AccessConsole | null>
  removeMember: (accountId: string, functionId: string | null) => Promise<AccessConsole | null>
  simulate: (target: SimulationTarget) => Promise<AccessSimulation | null>
}

/**
 * Drive the access console
 * @param {AccessConsole} initial - Console resolved server-side
 * @return {AccessCollection} - State and mutations
 */

export const useAccess = (initial: AccessConsole): AccessCollection => {
  const [data, setData] = useState(initial)
  const { isSaving, run } = useMutation()

  const write = useCallback(
    async (
      action: () => Promise<AccessConsole>,
      entity: 'Permissions' | 'Fonction' | 'Membres',
      verb: 'saved' | 'created' | 'deleted'
    ): Promise<AccessConsole | null> => {
      const next = await run(
        action,
        feedbackTitle(entity, verb, 'feminine', undefined, entity !== 'Fonction')
      )
      if (next) setData(next)

      return next
    },
    [run]
  )

  // The open layer travels with every write
  const layer = data.youtuberId

  return {
    console: data,
    isSaving,
    openLayer: async (youtuberId) => {
      const next = await run(() =>
        apiGet<AccessConsole>(
          youtuberId === null
            ? API_ROUTES.access
            : `${API_ROUTES.access}?youtuberId=${encodeURIComponent(youtuberId)}`
        )
      )
      if (next) setData(next)

      return next
    },
    saveRole: (role, permissions) =>
      write(
        () => apiPut<AccessConsole>(API_ROUTES.access, { role, permissions, youtuberId: layer }),
        'Permissions',
        'saved'
      ),
    saveFunction: (functionId, permissions) =>
      write(
        () =>
          apiPut<AccessConsole>(API_ROUTES.access, { functionId, permissions, youtuberId: layer }),
        'Permissions',
        'saved'
      ),
    applyPreset: (role) =>
      write(
        () => apiPut<AccessConsole>(API_ROUTES.access, { role, preset: true }),
        'Permissions',
        'saved'
      ),
    saveRoleAppearance: (role, patch) =>
      write(
        () =>
          apiPut<AccessConsole>(API_ROUTES.access, {
            role,
            appearance: true,
            youtuberId: layer,
            ...patch,
          }),
        'Permissions',
        'saved'
      ),
    createFunction: (input) =>
      write(
        () => apiPost<AccessConsole>(API_ROUTES.accessFunctions, { ...input, youtuberId: layer }),
        'Fonction',
        'created'
      ),
    updateFunction: (id, patch) =>
      write(
        () => apiPut<AccessConsole>(API_ROUTES.accessFunction(id), { ...patch, youtuberId: layer }),
        'Fonction',
        'saved'
      ),
    deleteFunction: (id) =>
      write(() => apiDelete<AccessConsole>(API_ROUTES.accessFunction(id)), 'Fonction', 'deleted'),
    addMembers: (accountIds, target) =>
      write(
        () =>
          apiPut<AccessConsole>(API_ROUTES.accessMembers, {
            accountIds,
            youtuberId: layer,
            ...target,
          }),
        'Membres',
        'saved'
      ),
    removeMember: (accountId, functionId) =>
      write(
        () =>
          apiDelete<AccessConsole>(API_ROUTES.accessMembers, {
            accountId,
            functionId,
            youtuberId: layer,
          }),
        'Membres',
        'saved'
      ),
    simulate: (target) => {
      const query = new URLSearchParams()
      Object.entries({ ...target, youtuberId: layer }).forEach(([key, value]) => {
        if (value) query.set(key, String(value))
      })

      return run(() =>
        apiGet<AccessSimulation>(`${API_ROUTES.accessSimulation}?${query.toString()}`)
      )
    },
  }
}
