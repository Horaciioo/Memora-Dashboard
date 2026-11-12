import { createProtectedRoute } from '@/core/lib/http/route'
import { readHistory } from '@/core/services/recruitment/HistoryService'
import { Permissions } from '@/utils/constants/permissions'

const SEARCH_MAX_LENGTH = 100

export const GET = createProtectedRoute({
  permission: Permissions.RecruitmentCandidateWrite,
  descriptor: { summary: 'Find candidates by name or identifier', tags: ['recruitment'] },
  handler: async ({ query, scope }) => {
    const { sessions } = await readHistory(await scope(), {
      // Bounded, it goes into a database search
      search: (query.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH),
      bannedOnly: false,
      outcomeId: '',
      recruiterId: '',
      status: '',
      page: 0,
    })

    // One line per passage, the session tells homonyms apart
    return sessions.flatMap((session) =>
      session.candidates.map((entry) => ({
        candidateId: entry.candidateId,
        name: entry.name,
        sessionName: session.name,
      }))
    )
  },
})
