import { createProtectedRoute } from '@/core/lib/http/route'
import { readLiveBanDetail } from '@/core/services/lives/ModViewService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the account and the ban of a viewer', tags: ['lives'] },
  handler: async ({ params, session, scope }) =>
    readLiveBanDetail(params.id, await scope(), session.id, session.permissions, params.viewerId),
})
