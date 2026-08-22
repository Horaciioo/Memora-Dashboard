'use client'

import { useCallback, useState } from 'react'

import { apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { AccessMatrix } from '@/types/access'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Access matrix state and mutations
 * @typedef {Object} AccessCollection
 * @property {AccessMatrix} matrix - Grants per role and per function
 * @property {boolean} isSaving - Mutation in flight
 * @property {(role: MemberRoleName, permissions: PermissionName[]) => Promise<void>} saveRole - Replace a role
 * @property {(functionId: string, permissions: PermissionName[]) => Promise<void>} saveFunction - Replace a function
 * @property {(role: MemberRoleName) => Promise<void>} applyPreset - Restore the declared preset
 */

export interface AccessCollection {
  matrix: AccessMatrix
  isSaving: boolean
  saveRole: (role: MemberRoleName, permissions: PermissionName[]) => Promise<void>
  saveFunction: (functionId: string, permissions: PermissionName[]) => Promise<void>
  applyPreset: (role: MemberRoleName) => Promise<void>
}

/**
 * Drive the permission matrix
 * @param {AccessMatrix} initialMatrix - Matrix resolved server-side
 * @return {AccessCollection} - State and mutations
 */

export const useAccess = (initialMatrix: AccessMatrix): AccessCollection => {
  const [matrix, setMatrix] = useState(initialMatrix)
  const { isSaving, run } = useMutation()

  const write = useCallback(
    async (payload: Record<string, unknown>) => {
      const next = await run(
        () => apiPut<AccessMatrix>(API_ROUTES.access, payload),
        FEEDBACK_COPY.saved
      )

      if (next) setMatrix(next)
    },
    [run]
  )

  return {
    matrix,
    isSaving,
    saveRole: (role, permissions) => write({ role, permissions }),
    saveFunction: (functionId, permissions) => write({ functionId, permissions }),
    applyPreset: (role) => write({ role, preset: true }),
  }
}
