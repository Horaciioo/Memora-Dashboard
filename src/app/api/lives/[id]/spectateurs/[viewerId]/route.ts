import { createProtectedRoute } from '@/core/lib/http/route'
import { viewerSanctions } from '@/core/services/lives/LiveInsightService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Read the past sanctions of a viewer', tags: ['lives'] },
  handler: async ({ params, scope }) => viewerSanctions(params.id, params.viewerId, await scope()),
})
