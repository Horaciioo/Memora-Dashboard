import { createProtectedRoute } from '@/core/lib/http/route'
import { readEscalation } from '@/core/services/identity'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.IntegrationManage,
  descriptor: { summary: 'Read an identifier a candidate could not give', tags: ['identity'] },
  handler: async ({ params, session }) => readEscalation(params.id, session),
})
