import { createProtectedRoute } from '@/core/lib/http/route'
import { listOpenLives } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the open lives', tags: ['lives'] },
  handler: async ({ session, scope }) =>
    listOpenLives(await scope(), session.id, session.permissions),
})
