import { prisma } from '@/core/lib/db'
import { createProtectedRoute } from '@/core/lib/http/route'
import { academyScope } from '@/core/services/academy/AcademyScope'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

// Longest search and longest answer
const SEARCH_MAX_LENGTH = 100
const HITS_MAX = 20

export const GET = createProtectedRoute({
  permission: Permissions.AcademyRead,
  descriptor: { summary: 'Find the juniors in reach by name', tags: ['academy'] },
  handler: async ({ query, session, access }) => {
    const scope = academyScope(session, access)
    const rows = await prisma.academyJunior.findMany({
      where: {
        status: AcademyJuniorStatuses.Active,
        session: scope.session,
        ...scope.juniors,
        // A junior never opens the file of another
        accountId: access.isResponsable || access.isAdmin ? undefined : { not: session.id },
        account: {
          displayName: {
            contains: (query.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH).trim(),
            mode: 'insensitive',
          },
        },
      },
      select: {
        id: true,
        sessionId: true,
        account: { select: { displayName: true } },
        trainer: { select: { displayName: true } },
      },
      orderBy: { account: { displayName: 'asc' } },
      take: HITS_MAX,
    })

    return rows.map((row) => ({
      juniorId: row.id,
      sessionId: row.sessionId,
      name: row.account.displayName,
      hint: row.trainer?.displayName ?? null,
    }))
  },
})
