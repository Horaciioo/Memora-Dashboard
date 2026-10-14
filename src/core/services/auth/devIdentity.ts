import 'server-only'

import crypto from 'crypto'

import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'

// Tests only, never on staging or production
export const SKIPS_DISCORD = APP_ENVIRONMENT === 'dev'

// Digits in a made-up identifier
const FAKE_ID_DIGITS = 18

/**
 * Identity standing in for Discord while testing a public link
 * @param {string | null} [discordId] - Member to impersonate, a made-up one otherwise
 * @return {DiscordIdentity} - Identity as Discord would return it
 */

export const devIdentity = (discordId?: string | null): DiscordIdentity => {
  const id =
    discordId || crypto.randomInt(10 ** (FAKE_ID_DIGITS - 1), 10 ** FAKE_ID_DIGITS).toString()

  return { id, username: `test-${id.slice(-4)}`, avatar: null, banner: null, globalName: null }
}
