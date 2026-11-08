import { notAuthenticated } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import { readSealState, readSessionToken } from '@/core/services/auth/SealService'
import { assertCode, sealSession, unsealSession } from '@/core/services/auth/TwoFactorService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import { codeField } from '@/declarations/access/permissions'
import { readText } from '@/core/lib/forms/values'

export const POST = createProtectedRoute({
  fields: [codeField],
  rateLimit: 'twoFactor',
  descriptor: { summary: 'Open the unlock window of the session', tags: ['security'] },
  handler: async ({ body, session }) => {
    const token = await readSessionToken()
    if (!token) throw notAuthenticated()

    await assertCode(session.id, readText(body, 'code') ?? '')
    const closesAt = await unsealSession(token)

    await recordEvent({
      eventType: 'SecurityChanged',
      actorId: session.id,
      summary: TWO_FACTOR_COPY.unlocked,
    })

    return { isUnsealed: true, closesAt }
  },
})

export const DELETE = createProtectedRoute({
  descriptor: { summary: 'Close the unlock window of the session', tags: ['security'] },
  handler: async () => {
    const token = await readSessionToken()
    if (!token) throw notAuthenticated()

    await sealSession(token)

    return readSealState()
  },
})
