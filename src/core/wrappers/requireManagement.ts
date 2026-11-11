import 'server-only'
import { forbidden } from 'next/navigation'
import { requirePermission } from '@/core/wrappers/requireUser'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Guard a management page, kept to the Administration
 * @param {PermissionName | PermissionName[]} permission - Permission, or any of them
 * @return {ReturnType<typeof requirePermission>} - Guarded session
 */

export const requireManagement = async (
  permission: PermissionName | PermissionName[]
): ReturnType<typeof requirePermission> => {
  const guarded = await requirePermission(permission)

  if (!guarded.access.isResponsable) forbidden()

  return guarded
}
