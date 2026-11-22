import { forbidden } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { setGameOpen } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const POST = createProtectedRoute({
  permission: Permissions.PlayManage,
  descriptor: { summary: 'Open or close one Play game for every player', tags: ['play'] },
  handler: async ({ session, access, raw }) => {
    if (!access.isAdmin) throw forbidden()
    await setGameOpen(raw, session.id)

    return { ok: true }
  },
})
