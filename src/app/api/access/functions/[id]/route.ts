import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readAccessConsole } from '@/core/services/auth/AccessConsoleService'
import { readLayer } from '@/core/services/auth/AccessGuard'
import { deleteJobFunction, readKind, updateJobFunction } from '@/core/services/auth/RolesService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import { ACCESS_CATEGORY_REGISTRY, readCategory } from '@/declarations/access/categories'
import { MemberRoles } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read a nullable text field
 * @param {unknown} value - Raw value
 * @return {string | null} - Trimmed value or nothing
 */

const readNullable = (value: unknown): string | null => {
  const text = typeof value === 'string' ? value.trim() : ''

  return text.length > 0 ? text : null
}

export const PUT = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Edit a function identity', tags: ['access'] },
  handler: async ({ params, raw, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    const category = raw.category === undefined ? undefined : readCategory(String(raw.category))

    // Moving a function into a section that sits at admin level is an admin move
    if (
      category !== undefined &&
      ACCESS_CATEGORY_REGISTRY.get(category).tier === MemberRoles.Admin &&
      !access.isAdmin
    ) {
      throw forbidden()
    }

    await updateJobFunction(params.id, {
      name: typeof raw.name === 'string' ? raw.name.trim() : undefined,
      category,
      kind: raw.kind === undefined ? undefined : readKind(String(raw.kind)),
      summary: 'summary' in raw ? readNullable(raw.summary) : undefined,
      ...('accent' in raw ? { accent: readNullable(raw.accent) } : {}),
      ...('icon' in raw ? { icon: readNullable(raw.icon) } : {}),
    })

    await recordEvent({
      eventType: 'FunctionChanged',
      actorId: session.id,
      targetType: 'function',
      targetId: params.id,
      summary: typeof raw.name === 'string' ? raw.name : params.id,
    })

    return readAccessConsole(access.isAdmin, readLayer(raw))
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AccessManage,
  descriptor: { summary: 'Delete a function nobody holds', tags: ['access'] },
  handler: async ({ params, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    await deleteJobFunction(params.id)

    await recordEvent({
      eventType: 'FunctionChanged',
      actorId: session.id,
      targetType: 'function',
      targetId: params.id,
      summary: params.id,
    })

    return readAccessConsole(access.isAdmin)
  },
})
