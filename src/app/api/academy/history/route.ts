import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { readAcademyHistory } from '@/core/services/academy/HistoryService'
import { Permissions } from '@/utils/constants/permissions'

// Longest search
const SEARCH_MAX_LENGTH = 100

export const GET = createProtectedRoute({
  permission: Permissions.AcademyManage,
  descriptor: { summary: 'Read the juniors of every session, session by session', tags: ['academy'] },
  handler: async ({ query, session, access }) =>
    readAcademyHistory(academyScope(session, access), {
      search: (query.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH),
      status: query.get('status') ?? '',
      juniorStatus: query.get('junior') ?? '',
      referentId: query.get('referent') ?? '',
      page: Math.max(Number(query.get('page')) || 0, 0),
    }),
})
