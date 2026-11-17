import { createProtectedRoute } from '@/core/lib/http/route'
import { readPlayCard } from '@/core/services/play'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.PlayAccess,
  descriptor: { summary: 'Read the card of a Play player', tags: ['play'] },
  handler: async (context) => readPlayCard(context.params.id),
})
