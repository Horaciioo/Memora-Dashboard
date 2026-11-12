import { createProtectedRoute } from '@/core/lib/http/route'
import { publishDraft } from '@/core/services/unban/UnbanFormService'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.UnbanManage,
  descriptor: { summary: 'Publish the draft as the next Deban. form version', tags: ['unban'] },
  handler: async ({ access, session }) => publishDraft(access, session.id),
})
