import { createProtectedRoute } from '@/core/lib/http/route'
import { publishDeparture } from '@/core/services/academy/ParkourService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Mark a departure announcement as published', tags: ['academy'] },
  handler: async ({ params, session }) => {
    await publishDeparture(params.id, session.id)

    return { id: params.id }
  },
})
