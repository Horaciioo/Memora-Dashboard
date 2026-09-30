import 'server-only'

import { forbidden } from '@/core/lib/errors'
import { readSealState } from '@/core/services/auth/SealService'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { PermissionEffects } from '@/utils/constants/workflow'
import type { PermissionOverwrite } from '@/core/lib/permissions'
import type { PermissionHelpers } from '@/types/auth'
import { isPermissionName } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Refuse a permission write the second factor has not opened, an administrator being the
 * one holder that never has to unseal to reach the console
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<void>} - Throws while still sealed
 */

export const assertUnsealed = async (access: PermissionHelpers): Promise<void> => {
  if (access.isAdmin) return

  const { isUnsealed } = await readSealState()
  if (!isUnsealed) throw forbidden(ACCESS_COPY.twoFactorRequired)
}

/**
 * Read the creator an overwrite layer belongs to, nothing standing for the global layer
 * @param {Record<string, unknown>} raw - Untouched body
 * @return {string | null} - Creator identifier
 */

export const readLayer = (raw: Record<string, unknown>): string | null => {
  const value = typeof raw.youtuberId === 'string' ? raw.youtuberId.trim() : ''

  return value.length > 0 ? value : null
}

/**
 * Read a consistent overwrite list out of a request body
 * @param {unknown} value - Raw overwrites
 * @return {PermissionOverwrite[]} - Known overwrites
 */

export const readOverwrites = (value: unknown): PermissionOverwrite[] => {
  if (!Array.isArray(value)) return []

  const seen = new Set<PermissionName>()

  return value.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) return []

    const row = entry as { permission?: unknown; effect?: unknown }
    const permission = String(row.permission ?? '')

    // One row per permission, the first one landing and the rest dropping
    if (!isPermissionName(permission) || seen.has(permission)) return []
    seen.add(permission)

    return [
      {
        permission,
        effect:
          row.effect === PermissionEffects.Deny ? PermissionEffects.Deny : PermissionEffects.Allow,
      },
    ]
  })
}
