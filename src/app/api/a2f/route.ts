import { createProtectedRoute } from '@/core/lib/http/route'
import { readSealState } from '@/core/services/auth/SealService'
import {
  confirmEnrolment,
  dropEnrolment,
  readTwoFactorState,
  startEnrolment,
} from '@/core/services/auth/TwoFactorService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { codeField } from '@/declarations/access/permissions'
import { readText } from '@/core/lib/forms/values'

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read the second factor of the signed-in member', tags: ['security'] },
  handler: async ({ session }) => ({
    ...(await readTwoFactorState(session.id)),
    seal: await readSealState(),
  }),
})

export const POST = createProtectedRoute({
  status: 201,
  rateLimit: 'twoFactor',
  descriptor: { summary: 'Open a second factor enrolment', tags: ['security'] },
  handler: async ({ session }) => startEnrolment(session),
})

export const PUT = createProtectedRoute({
  fields: [codeField],
  rateLimit: 'twoFactor',
  descriptor: { summary: 'Confirm a second factor enrolment', tags: ['security'] },
  handler: async ({ body, session }) => {
    const state = await confirmEnrolment(session.id, readText(body, 'code') ?? '')

    await recordEvent({
      eventType: 'SecurityChanged',
      actorId: session.id,
      summary: TWO_FACTOR_COPY.confirmed,
    })

    return { ...state, seal: await readSealState() }
  },
})

export const DELETE = createProtectedRoute({
  fields: [codeField],
  rateLimit: 'twoFactor',
  descriptor: { summary: 'Drop the second factor', tags: ['security'] },
  handler: async ({ body, session }) => {
    await dropEnrolment(session.id, readText(body, 'code') ?? '')

    await recordEvent({
      eventType: 'SecurityChanged',
      actorId: session.id,
      summary: TWO_FACTOR_COPY.dropped,
    })

    return { ...(await readTwoFactorState(session.id)), seal: await readSealState() }
  },
})
