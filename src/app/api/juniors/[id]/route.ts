import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { juniorFields, removeJunior, updateJunior } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const PATCH = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Edit the follow-up of a junior', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const junior = await prisma.academyJunior.findUnique({ where: { id: params.id } })
    if (!junior) throw notFound()

    const parsed = parseFormValues(await juniorFields(junior.sessionId), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return updateJunior(params.id, parsed.values)
  },
})

export const DELETE = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Take a junior out of a session', tags: ['academy'] },
  handler: ({ params }) => removeJunior(params.id),
})
