import { createProtectedRoute } from '@/core/lib/http/route'
import { answerCoordination } from '@/core/services/lives/CoordinationService'
import { Permissions } from '@/utils/constants/permissions'

// Valid moment or nothing
const readMoment = (value: unknown): Date | null => {
  const date = typeof value === 'string' ? new Date(value) : null

  return date && !Number.isNaN(date.getTime()) ? date : null
}

export const POST = createProtectedRoute({
  permission: Permissions.LiveRead,
  descriptor: { summary: 'Answer a request to coordinate a live', tags: ['lives'] },
  handler: async ({ params, raw, session }) => {
    return answerCoordination(params.id, session.id, {
      accept: raw.accept === true,
      startsAt: readMoment(raw.startsAt),
      endsAt: readMoment(raw.endsAt),
    })
  },
})
