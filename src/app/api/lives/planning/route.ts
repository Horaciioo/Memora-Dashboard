import { createProtectedRoute } from '@/core/lib/http/route'
import { readLivePlanning } from '@/core/services/lives/LiveService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.LiveAnnounce,
  descriptor: { summary: 'Read what a live is planned on', tags: ['lives'] },
  handler: async ({ scope }) => readLivePlanning(await scope()),
})
