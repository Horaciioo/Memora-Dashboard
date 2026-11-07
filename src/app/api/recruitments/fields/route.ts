import { createProtectedRoute } from '@/core/lib/http/route'
import { sessionFields } from '@/core/services/recruitment'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: { summary: 'Read the fields of a recruitment session', tags: ['recruitment'] },
  handler: async ({ scope }) => sessionFields(await scope()),
})
