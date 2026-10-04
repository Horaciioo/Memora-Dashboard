import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { openSecondPeriodAnyway } from '@/core/services/academy/ParkourService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Open the second period of a PIM session', tags: ['academy'] },
  handler: async ({ params, session, access }) => {
    await openSecondPeriodAnyway(params.id, academyScope(session, access), session.id)

    return { id: params.id }
  },
})
