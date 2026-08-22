export const Permissions = {
  EntityCreate: 'entity:create',
  EntityUpdate: 'entity:update',
  EntityDelete: 'entity:delete',
} as const

export type PermissionName = (typeof Permissions)[keyof typeof Permissions]

export interface PermissionMeta {
  name: PermissionName
  displayName: string
  description: string
  important: boolean
}

/**
 * Permission metadata list
 * @type {PermissionMeta[]}
 */

export const PermissionsList: PermissionMeta[] = [
  {
    name: Permissions.EntityCreate,
    displayName: 'Create entities',
    description: 'Create new entities in the collection.',
    important: true,
  },
  {
    name: Permissions.EntityUpdate,
    displayName: 'Update entities',
    description: 'Edit fields on existing entities.',
    important: false,
  },
  {
    name: Permissions.EntityDelete,
    displayName: 'Delete entities',
    description: 'Remove entities from the collection.',
    important: true,
  },
]

/**
 * Check any permission
 * @param {PermissionName[]} userPermissions - Permissions held
 * @param {PermissionName | PermissionName[]} required - Permission needed
 * @return {boolean} - Has permission
 */

export function hasPermission(
  userPermissions: PermissionName[],
  required: PermissionName | PermissionName[]
): boolean {
  if (typeof required === 'string') return userPermissions.includes(required)

  return required.some((permission) => userPermissions.includes(permission))
}

/**
 * Check all permissions
 * @param {PermissionName[]} userPermissions - Permissions held
 * @param {PermissionName[]} required - Permissions needed
 * @return {boolean} - Has all
 */

export function hasEveryPermission(
  userPermissions: PermissionName[],
  required: PermissionName[]
): boolean {
  return required.every((permission) => userPermissions.includes(permission))
}
