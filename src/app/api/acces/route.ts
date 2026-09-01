import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  applyRolePreset,
  readFunctionGrants,
  readRoleGrants,
  replaceFunctionGrants,
  replaceRoleGrants,
} from '@/core/services/auth/GrantsService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { ENCADREMENT_ROLES, ROLE_REGISTRY } from '@/declarations/access/roles'
import { isPermissionName } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read the permission list of a request body
 * @param {unknown} value - Raw permissions
 * @return {PermissionName[]} - Known permissions
 */

const readPermissions = (value: unknown): PermissionName[] =>
  Array.isArray(value) ? value.map(String).filter(isPermissionName) : []

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Read the permission matrix', tags: ['access'] },
  handler: async () => ({
    roles: await readRoleGrants(),
    functions: await readFunctionGrants(),
  }),
})

export const PUT = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Replace the grants of a role or a function', tags: ['access'] },
  handler: async ({ raw, session, access }) => {
    const role = raw.role === undefined ? null : String(raw.role)
    const functionId = raw.functionId === undefined ? null : String(raw.functionId)

    // An encadrement level is what a whole perimeter hangs off, so only an admin writes one
    if (role && ENCADREMENT_ROLES.includes(role as MemberRoleName) && !access.isAdmin) {
      throw forbidden()
    }

    // A preset request rewrites the role from the declared defaults
    if (role && ROLE_REGISTRY.has(role)) {
      if (raw.preset === true) await applyRolePreset(role as MemberRoleName)
      else await replaceRoleGrants(role as MemberRoleName, readPermissions(raw.permissions))
    } else if (functionId) {
      await replaceFunctionGrants(functionId, readPermissions(raw.permissions))
    } else {
      throw invalidInput([{ field: 'role', message: FORM_COPY.notAnOption }])
    }

    await recordEvent({
      eventType: 'PermissionChanged',
      actorId: session.id,
      targetType: role ? 'role' : 'function',
      targetId: role ?? functionId ?? undefined,
      summary: role ?? functionId ?? '',
    })

    return { roles: await readRoleGrants(), functions: await readFunctionGrants() }
  },
})
