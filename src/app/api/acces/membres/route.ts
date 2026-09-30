import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readAccessConsole } from '@/core/services/auth/AccessConsoleService'
import { readLayer } from '@/core/services/auth/AccessGuard'
import {
  assignFunctionMembers,
  assignRoleMembers,
  removeAccessMember,
} from '@/core/services/auth/RolesService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

export const PUT = createProtectedRoute({
  permission: [Permissions.AccessManage, Permissions.MemberUpdate],
  descriptor: { summary: 'Seat accounts on a role or a function', tags: ['access'] },
  handler: async ({ raw, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    const accountIds = Array.isArray(raw.accountIds) ? raw.accountIds.map(String) : []
    if (accountIds.length === 0) {
      throw invalidInput([{ field: 'accountIds', message: FORM_COPY.required }])
    }

    const role = raw.role === undefined ? null : String(raw.role)
    const functionId = raw.functionId === undefined ? null : String(raw.functionId)

    if (functionId) {
      await assignFunctionMembers(accountIds, functionId)
    } else if (role && ROLE_REGISTRY.has(role)) {
      await assignRoleMembers(accountIds, role as MemberRoleName)
    } else {
      throw invalidInput([{ field: 'role', message: FORM_COPY.notAnOption }])
    }

    await recordEvent({
      eventType: 'PermissionChanged',
      actorId: session.id,
      targetType: role ? 'role' : 'function',
      targetId: role ?? functionId ?? undefined,
      summary: String(accountIds.length),
    })

    return readAccessConsole(access.isAdmin, readLayer(raw))
  },
})

export const DELETE = createProtectedRoute({
  permission: [Permissions.AccessManage, Permissions.MemberUpdate],
  descriptor: { summary: 'Take one account off a role or a function', tags: ['access'] },
  handler: async ({ raw, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    const accountId = typeof raw.accountId === 'string' ? raw.accountId : ''
    if (accountId.length === 0) {
      throw invalidInput([{ field: 'accountId', message: FORM_COPY.required }])
    }

    const functionId = raw.functionId === undefined ? null : String(raw.functionId)
    await removeAccessMember(accountId, functionId)

    await recordEvent({
      eventType: 'PermissionChanged',
      actorId: session.id,
      targetType: functionId ? 'function' : 'role',
      targetId: functionId ?? undefined,
      summary: accountId,
    })

    return readAccessConsole(access.isAdmin, readLayer(raw))
  },
})
