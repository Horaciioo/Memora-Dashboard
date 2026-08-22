import type { PermissionName } from '@/utils/constants/permissions'

// Permission identifier
export type Permission = PermissionName

// User session data
export interface SessionUser {
  id: string
  email: string
  role: 'admin' | 'member'
  permissions: Permission[]
  mustChangePassword: boolean
}

// Permission authorization helpers
export interface PermissionHelpers {
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  isAdmin: boolean
  isReadOnly: boolean
}
