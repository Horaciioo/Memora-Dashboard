import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { updatePlayConfig } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Change Play boosts, featured games and settings', tags: ['play'] },
  handler: async ({ session, access, raw }) => {
    if (!access.isAdmin) throw forbidden()

    return updatePlayConfig(raw, session.id)
  },
})
