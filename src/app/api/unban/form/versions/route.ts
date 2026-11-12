import { createProtectedRoute } from '@/core/lib/http/route'
import { listVersions } from '@/core/services/unban/UnbanFormService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.UnbanManage,
  descriptor: { summary: 'List the published Deban. form versions', tags: ['unban'] },
  handler: async ({ access }) => listVersions(access),
})
