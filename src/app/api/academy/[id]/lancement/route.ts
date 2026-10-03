import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { startSession } from '@/core/services/academy/AcademyService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Launch a planned PIM session', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    await startSession(params.id, academyScope(session, access))

    return { id: params.id }
  },
})
