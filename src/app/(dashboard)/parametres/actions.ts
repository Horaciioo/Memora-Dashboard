'use server'

import { refresh } from 'next/cache'
import { cookies } from 'next/headers'

import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { revokeOtherSessions } from '@/core/services/auth/SessionService'
import { unlinkTwitch } from '@/core/services/platforms/PlatformAccountService'
import { resetGuides } from '@/core/services/preferences/GuideService'
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

/**
 * Show the one-time guides again
 * @return {Promise<void>} - Guides reset
 */

export async function replayGuides(): Promise<void> {
  const { session } = await requireUser()

  await resetGuides(session.id)

  refresh()
}

/**
 * Unlink the member's Twitch account
 * @return {Promise<void>} - Unlinked
 */

export async function unlinkTwitchAccount(): Promise<void> {
  const { session } = await requireUser()

  await unlinkTwitch(session.id)

  refresh()
}
