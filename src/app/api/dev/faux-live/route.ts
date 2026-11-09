import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { createProtectedRoute } from '@/core/lib/http/route'
import {
  clearFakeLives,
  fakeLiveStatus,
  pressFakeKey,
  startFakeLive,
  stopFakeLive,
} from '@/core/services/dev/FakeLiveService'
import { FAKE_LIVE_KEYS, FAKE_LIVE_PACES } from '@/declarations/dev/fakeLive'
import { TWITCH_MOCK_ORIGIN } from '@/declarations/platforms/twitch'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { PermissionHelpers } from '@/types/auth'

/**
 * Only an administrator on a dev database with the fake Twitch configured
 * @param {PermissionHelpers} access - Permission helpers
 * @return {void} - Throws otherwise
 */

const assertFakeLive = (access: PermissionHelpers): void => {
  if (!TWITCH_MOCK_ORIGIN) throw notFound()
  if (!access.isAdmin) throw forbidden()
}

export const GET = createProtectedRoute({
  descriptor: { summary: 'Read the state of the fake live', tags: ['dev'] },
  handler: async ({ access }) => {
    assertFakeLive(access)

    return fakeLiveStatus()
  },
})

export const POST = createProtectedRoute({
  descriptor: { summary: 'Start, drive, stop or clear the fake live', tags: ['dev'] },
  handler: async ({ access, raw, session }) => {
    assertFakeLive(access)
    const action = String(raw.action ?? '')

    if (action === 'start') {
      const pace = FAKE_LIVE_PACES.find((entry) => entry.id === raw.pace)?.id ?? 'normal'
      await startFakeLive({ pace, discordId: session.discordId })
    } else if (action === 'key') {
      const key = FAKE_LIVE_KEYS.find((entry) => entry.key === raw.key)?.key
      if (!key) throw invalidInput([{ field: 'key', message: FORM_COPY.notAnOption }])
      await pressFakeKey(key)
    } else if (action === 'stop') {
      await stopFakeLive()
    } else if (action === 'clear') {
      await clearFakeLives()
    } else {
      throw invalidInput([{ field: 'action', message: FORM_COPY.notAnOption }])
    }

    return fakeLiveStatus()
  },
})
