import 'server-only'

import crypto from 'crypto'

import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'

// Tests only, never on staging or production
export const SKIPS_DISCORD = APP_ENVIRONMENT === 'dev'

// Smallest 18 digit identifier and the span above it
const FAKE_ID_FLOOR = BigInt(10) ** BigInt(17)
const FAKE_ID_SPAN = BigInt(9) * FAKE_ID_FLOOR

/**
 * Identity standing in for Discord while testing a public link
 * @param {string | null} [discordId] - Member to impersonate, a made-up one otherwise
 * @return {DiscordIdentity} - Identity as Discord would return it
 */

export const devIdentity = (discordId?: string | null): DiscordIdentity => {
  // Past 2^53 the integer helper refuses, so the draw is a bigint
  const id =
    discordId ||
    (FAKE_ID_FLOOR + (crypto.randomBytes(8).readBigUInt64BE() % FAKE_ID_SPAN)).toString()

  return { id, username: `test-${id.slice(-4)}`, avatar: null, banner: null, globalName: null }
}
