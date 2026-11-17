import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { adjustEveryonesXp } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Give or take Play XP from chosen moderators, or all', tags: ['play'] },
  handler: async ({ session, access, raw }) => {
    if (!access.isAdmin) throw forbidden()

    return { count: await adjustEveryonesXp({ id: session.id, isAdmin: true }, raw) }
  },
})
