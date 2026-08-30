'use server'

import { refresh } from 'next/cache'
import { cookies } from 'next/headers'

import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { revokeOtherSessions } from '@/core/services/auth/SessionService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { requireUser } from '@/core/wrappers/requireUser'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'

/**
 * Close every session of the signed-in member but the one in use
 * @return {Promise<void>} - Sessions closed
 */

export async function dropOtherSessions(): Promise<void> {
  const { session } = await requireUser()

  const cookieStore = await cookies()
  const closed = await revokeOtherSessions(session.id, cookieStore.get(SESSION_COOKIE)?.value ?? '')

  await recordEvent({
    eventType: 'SessionClosed',
    actorId: session.id,
    summary: `${PREFERENCES_COPY.closeOthers} · ${closed}`,
  })

  refresh()
}
