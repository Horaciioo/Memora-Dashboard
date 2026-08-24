import { invalidInput } from '@/core/lib/errors'
import { parseFormValues } from '@/core/lib/forms'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { createSession, listSessions, sessionFields } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Read every academy session', tags: ['academy'] },
  handler: ({ session, access }) => listSessions(academyScope(session, access)),
})

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  status: 201,
  descriptor: { summary: 'Open an academy session', tags: ['academy'] },
  handler: async ({ raw }) => {
    const parsed = parseFormValues(await sessionFields(), raw, { fillMissing: true })
    if (!parsed.ok) throw invalidInput(parsed.issues)

    return createSession(parsed.values)
  },
})
