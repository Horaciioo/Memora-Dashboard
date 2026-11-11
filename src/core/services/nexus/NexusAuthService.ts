import 'server-only'

import { forbidden, invalidInput } from '@/core/lib/errors'
import { encodeHash, hashPassword, needsRehash, verifyPassword } from '@/core/lib/nexus/password'
import { assertAttemptOpen, recordAttempt } from '@/core/services/nexus/NexusAttemptService'
import type { NexusCaller } from '@/core/services/nexus/NexusSessionService'
import { DISCORD_CREDENTIALS } from '@/declarations/access/discord'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_OWNER } from '@/declarations/nexus/owner'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { NEXUS_PASSWORD } from '@/declarations/nexus/settings'
import type { NexusAttemptKind } from '@prisma/client'

/**
 * Callback registered for the console flow
 * @return {string | undefined} - Absolute callback or undefined without Discord
 */

export const nexusCallbackUri = (): string | undefined =>
  DISCORD_CREDENTIALS.redirectUri
    ? new URL(NEXUS_PATHS.callback, DISCORD_CREDENTIALS.redirectUri).toString()
    : undefined

/**
 * Check a password and count the attempt
 * @param {string} accountId - Owner
 * @param {NexusCaller} caller - Who is calling
 * @param {unknown} password - Submitted value
 * @param {NexusAttemptKind} kind - Factor tried
 * @return {Promise<string | null>} - Replacement hash when the cost moved
 */

export const checkOwnerPassword = async (
  accountId: string,
  caller: NexusCaller,
  password: unknown,
  kind: NexusAttemptKind
): Promise<string | null> => {
  const actor = { accountId, address: caller.address }

  // Bounds first so a huge value never reaches the hash
  if (
    typeof password !== 'string' ||
    password.length < 1 ||
    password.length > NEXUS_PASSWORD.maxLength
  ) {
    throw invalidInput([{ field: 'password', message: NEXUS_COPY.wrongPassword }])
  }

  await assertAttemptOpen(actor)

  const matches = await verifyPassword(password, NEXUS_OWNER.passwordHash)
  await recordAttempt(actor, kind, matches)
  if (!matches) throw forbidden(NEXUS_COPY.wrongPassword)

  // Shown once to the owner, never written
  const stored = NEXUS_OWNER.passwordHash
  return stored && needsRehash(stored) ? encodeHash(await hashPassword(password)) : null
}

/**
 * Count a failed Discord step
 * @param {string} accountId - Owner
 * @param {NexusCaller} caller - Who is calling
 * @return {Promise<void>}
 */

export const recordDiscordFailure = (accountId: string, caller: NexusCaller): Promise<void> =>
  recordAttempt({ accountId, address: caller.address }, 'DISCORD', false)

/**
 * Count a good Discord step
 * @param {string} accountId - Owner
 * @param {NexusCaller} caller - Who is calling
 * @return {Promise<void>}
 */

export const recordDiscordSuccess = (accountId: string, caller: NexusCaller): Promise<void> =>
  recordAttempt({ accountId, address: caller.address }, 'DISCORD', true)

/**
 * Refuse a Discord step while paused
 * @param {string} accountId - Owner
 * @param {NexusCaller} caller - Who is calling
 * @return {Promise<void>} - Throws when paused
 */

export const assertDiscordOpen = (accountId: string, caller: NexusCaller): Promise<void> =>
  assertAttemptOpen({ accountId, address: caller.address })
