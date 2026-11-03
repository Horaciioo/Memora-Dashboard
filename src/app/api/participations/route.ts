import { forbidden, invalidInput } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { signalSession } from '@/core/lib/recruitment/signal'
import { applySeatAction } from '@/core/services/members/seats'
import { reachableSession } from '@/core/services/recruitment/reach'
import { recordEvent } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import type { SeatAction, SeatFamily } from '@/declarations/members/seats'

// Event written for each gesture
const SEAT_EVENTS = {
  revoke: 'SeatRevoked',
  restore: 'SeatRestored',
  forget: 'SeatForgotten',
} as const

const ACTIONS = Object.keys(SEAT_EVENTS)
const FAMILIES = ['recruitment', 'academy']

export const POST = createProtectedRoute({
  descriptor: {
    summary: 'Take back, give back or delete the participation of a member in a session',
    tags: ['members'],
  },
  handler: async ({ raw, session, access, scope }) => {
    // Responsables and above only
    if (!access.isResponsable) throw forbidden()

    const { accountId, family, sessionId, action } = raw as Record<string, string>
    if (!accountId || !sessionId || !ACTIONS.includes(action) || !FAMILIES.includes(family)) {
      throw invalidInput([{ field: 'action', message: action }])
    }

    if (family === 'recruitment') await reachableSession(sessionId, await scope())
    await applySeatAction(accountId, family as SeatFamily, sessionId, action as SeatAction)

    await recordEvent({
      eventType: SEAT_EVENTS[action as SeatAction],
      actorId: session.id,
      subjectId: accountId,
      targetType: family === 'academy' ? JOURNAL_FILES.Academy : JOURNAL_FILES.Recruitment,
      targetId: sessionId,
      summary: accountId,
    })
    if (family === 'recruitment') await signalSession(sessionId)

    return { accountId, sessionId }
  },
})
