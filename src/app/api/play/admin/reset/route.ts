import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { resetSelectedPlay } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Wipe the Play progression of chosen moderators', tags: ['play'] },
  handler: async ({ session, access, raw }) => {
    if (!access.isAdmin) throw forbidden()

    return { count: await resetSelectedPlay({ id: session.id, isAdmin: true }, raw) }
  },
})
