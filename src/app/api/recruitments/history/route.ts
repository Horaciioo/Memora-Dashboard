import { createProtectedRoute } from '@/core/lib/http/route'
import { readHistory } from '@/core/services/recruitment/HistoryService'
import { Permissions } from '@/utils/constants/permissions'

export const GET = createProtectedRoute({
  permission: Permissions.RecruitmentManage,
  descriptor: {
    summary: 'Read the candidates of every session by identity',
    tags: ['recruitment'],
  },
  handler: async ({ query, scope }) =>
    readHistory(await scope(), {
      search: query.get('q') ?? '',
      bannedOnly: query.get('banned') === '1',
      page: Math.max(Number(query.get('page')) || 0, 0),
    }),
})
