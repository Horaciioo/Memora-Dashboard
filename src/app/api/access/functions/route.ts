import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readAccessConsole } from '@/core/services/auth/AccessConsoleService'
import { readLayer } from '@/core/services/auth/AccessGuard'
import { createJobFunction, readKind } from '@/core/services/auth/RolesService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import { ACCESS_CATEGORY_REGISTRY, readCategory } from '@/declarations/access/categories'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
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

export const POST = createProtectedRoute({
  permission: Permissions.AccessManage,
  status: 201,
  descriptor: { summary: 'Create a function', tags: ['access'] },
  handler: async ({ raw, session, access }) => {
    // Decided in code for now
    if (!ACCESS_EDITABLE) throw forbidden()

    const name = typeof raw.name === 'string' ? raw.name.trim() : ''
    if (name.length === 0) throw invalidInput([{ field: 'name', message: FORM_COPY.required }])

    const category = readCategory(String(raw.category ?? ''))

    // A section sitting at admin level anchors a whole perimeter
    if (ACCESS_CATEGORY_REGISTRY.get(category).tier === MemberRoles.Admin && !access.isAdmin) {
      throw forbidden()
    }

    const id = await createJobFunction({
      name,
      category,
      kind: readKind(String(raw.kind ?? '')),
      accent: readNullable(raw.accent),
      icon: readNullable(raw.icon),
      summary: readNullable(raw.summary),
    })

    await recordEvent({
      eventType: 'FunctionChanged',
      actorId: session.id,
      targetType: 'function',
      targetId: id,
      summary: name,
    })

    return readAccessConsole(access.isAdmin, readLayer(raw))
  },
})
