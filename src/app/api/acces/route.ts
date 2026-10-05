import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readAccessConsole } from '@/core/services/auth/AccessConsoleService'
import { assertUnsealed, readLayer, readOverwrites } from '@/core/services/auth/AccessGuard'
import {
  applyRolePreset,
  replaceFunctionGrants,
  replaceRoleGrants,
} from '@/core/services/auth/GrantsService'
import { saveRoleAppearance } from '@/core/services/auth/RolesService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { ENCADREMENT_ROLES, ROLE_REGISTRY } from '@/declarations/access/roles'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read a nullable colour or glyph string
 * @param {unknown} value - Raw value
 * @return {string | null} - Trimmed value or nothing
 */

const readNullable = (value: unknown): string | null => {
  const text = typeof value === 'string' ? value.trim() : ''

  return text.length > 0 ? text : null
}

export const GET = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Read the access console', tags: ['access'] },
  handler: async ({ query, access }) =>
    readAccessConsole(access.isAdmin, query.get('youtuberId') || null),
})

export const PUT = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: {
    summary: 'Replace a role or function overwrite, or a role appearance',
    tags: ['access'],
  },
  handler: async ({ raw, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    const role = raw.role === undefined ? null : String(raw.role)
    const functionId = raw.functionId === undefined ? null : String(raw.functionId)
    const youtuberId = readLayer(raw)

    // An encadrement level is what a whole perimeter hangs off
    if (role && ENCADREMENT_ROLES.includes(role as MemberRoleName) && !access.isAdmin) {
      throw forbidden()
    }

    // An appearance edit carries a colour and a glyph rather than an overwrite list
    if (role && ROLE_REGISTRY.has(role) && raw.appearance === true) {
      await saveRoleAppearance(role as MemberRoleName, {
        accent: readNullable(raw.accent),
        icon: readNullable(raw.icon),
      })
    } else if (role && ROLE_REGISTRY.has(role)) {
      await assertUnsealed(access)

      if (raw.preset === true) await applyRolePreset(role as MemberRoleName)
      else
        await replaceRoleGrants(role as MemberRoleName, readOverwrites(raw.permissions), youtuberId)
    } else if (functionId) {
      await assertUnsealed(access)
      await replaceFunctionGrants(functionId, readOverwrites(raw.permissions), youtuberId)
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

    return readAccessConsole(access.isAdmin, youtuberId)
  },
})
