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
import { optionalText } from '@/utils/format/strings'

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
      accent: optionalText(raw.accent),
      icon: optionalText(raw.icon),
      summary: optionalText(raw.summary),
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
