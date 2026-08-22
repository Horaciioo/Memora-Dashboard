import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { createJunior, juniorFields } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  status: 201,
  descriptor: { summary: 'Take a moderator into a session', tags: ['academy'] },
  handler: async ({ params, raw }) => {
    const session = await prisma.academySession.findUnique({ where: { id: params.id } })
    if (!session) throw notFound()

    const parsed = parseFormValues(await juniorFields(params.id), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createJunior(params.id, session.program, parsed.values)
  },
})
