import 'server-only'

import crypto from 'node:crypto'

import { cookies } from 'next/headers'

import { digestSessionToken } from '@/core/lib/auth/sessionDigest'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { matchesToken } from '@/core/lib/auth/oauthState'
import { prisma } from '@/core/lib/db'
import { NEXUS_SESSION } from '@/declarations/nexus/settings'
import { SECOND_MS } from '@/utils/constants/time'
import type { NexusSession } from '@prisma/client'

/**
 * Sign-in session the console hangs from
 * @typedef {Object} HostSession
 * @property {string} id - Session row
 * @property {string} accountId - Owner
 * @property {Date} expiresAt - Sign-in expiry
 * @property {string | null} userAgent - Software that opened it
 */

export interface HostSession {
  id: string
  accountId: string
  expiresAt: Date
  userAgent: string | null
}

/**
 * Who is calling
 * @typedef {Object} NexusCaller
 * @property {string} address - Client address
 * @property {string | null} userAgent - Client software
 */

export interface NexusCaller {
  address: string
  userAgent: string | null
}

/**
 * Token a cookie carries and the hash stored for it
 * @typedef {Object} IssuedToken
 * @property {string} token - Cookie value
 * @property {Date} expiresAt - Expiry
 */

export interface IssuedToken {
  token: string
  expiresAt: Date
}

/**
 * Outcome of a session lookup
 * @typedef {Object} SessionLookup
 * @property {'ok' | 'reauth' | 'none'} state - Usable, address moved, absent
 * @property {NexusSession} [session] - Row when found
 */

export interface SessionLookup {
  state: 'ok' | 'reauth' | 'none'
  session?: NexusSession
}

/**
 * Stored form of a console token
 * @param {string} token - Cookie value
 * @return {string} - SHA-256 hex
 */

export const hashNexusToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')

/**
 * Anti-forgery value tied to a token
 * @param {string} token - Cookie value
 * @return {string} - Request header value
 */

export const csrfOf = (token: string): string =>
  crypto.createHash('sha256').update(`csrf:${token}`).digest('hex')

/**
 * Compare an anti-forgery header with its token
 * @param {string} token - Cookie value
 * @param {string | null} header - Header value
 * @return {boolean} - Header is right
 */

export const matchesCsrf = (token: string, header: string | null): boolean =>
  header !== null && matchesToken(csrfOf(token), header)

/**
 * Read the sign-in session of this request
 * @param {string} accountId - Expected owner
 * @return {Promise<HostSession | null>} - Live session or null
 */

export const readHostSession = async (accountId: string): Promise<HostSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null

  const row = await prisma.session.findUnique({
    where: { token: digestSessionToken(token) },
    select: { id: true, accountId: true, expiresAt: true, userAgent: true },
  })

  return row && row.accountId === accountId && row.expiresAt > new Date() ? row : null
}

// Fresh random cookie value
const randomToken = (): string => crypto.randomBytes(32).toString('base64url')

/**
 * Close a console session
 * @param {string} id - Row identifier
 * @param {string} reason - Why it closed
 * @return {Promise<void>}
 */

export const revokeNexusSession = async (id: string, reason: string): Promise<void> => {
  await prisma.nexusSession.updateMany({
    where: { id, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  })
}

/**
 * Close every console session of a member
 * @param {string} accountId - Member
 * @param {string} reason - Why they closed
 * @return {Promise<number>} - Sessions closed
 */

export const revokeAllNexusSessions = async (
  accountId: string,
  reason: string
): Promise<number> => {
  const { count } = await prisma.nexusSession.updateMany({
    where: { accountId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  })

  return count
}

/**
 * Open the stage that waits for Discord
 * @param {HostSession} host - Sign-in session
 * @param {NexusCaller} caller - Who is calling
 * @return {Promise<IssuedToken>} - Pending token
 */

export const openPendingSession = async (
  host: HostSession,
  caller: NexusCaller
): Promise<IssuedToken> => {
  const now = new Date()
  const token = randomToken()
  const expiresAt = new Date(now.getTime() + NEXUS_SESSION.pendingSeconds * SECOND_MS)

  // One pending stage per sign-in
  await prisma.nexusSession.updateMany({
    where: { sessionId: host.id, stage: 'PASSWORD', revokedAt: null },
    data: { revokedAt: now, revokedReason: 'replaced' },
  })

  await prisma.nexusSession.create({
    data: {
      tokenHash: hashNexusToken(token),
      sessionId: host.id,
      accountId: host.accountId,
      stage: 'PASSWORD',
      passwordAt: now,
      reauthAt: now,
      expiresAt,
      address: caller.address,
      userAgent: caller.userAgent,
    },
  })

  return { token, expiresAt }
}

/**
 * Find a console session and judge it against its caller
 * @param {string | undefined} token - Cookie value
 * @param {HostSession} host - Sign-in session
 * @param {NexusCaller} caller - Who is calling
 * @param {'PASSWORD' | 'UNLOCKED'} stage - Stage expected
 * @return {Promise<SessionLookup>} - Lookup
 */

export const findNexusSession = async (
  token: string | undefined,
  host: HostSession,
  caller: NexusCaller,
  stage: 'PASSWORD' | 'UNLOCKED'
): Promise<SessionLookup> => {
  if (!token) return { state: 'none' }

  const session = await prisma.nexusSession.findUnique({
    where: { tokenHash: hashNexusToken(token) },
  })
  const bound =
    session &&
    session.stage === stage &&
    session.revokedAt === null &&
    session.expiresAt > new Date() &&
    session.sessionId === host.id &&
    session.accountId === host.accountId &&
    session.userAgent === caller.userAgent

  if (!session || !bound) return { state: 'none' }

  // A moved address asks for the password again
  return { state: session.address === caller.address ? 'ok' : 'reauth', session }
}

/**
 * Turn a pending stage into a console session
 * @param {NexusSession} pending - Pending row
 * @param {HostSession} host - Sign-in session
 * @param {NexusCaller} caller - Who is calling
 * @return {Promise<IssuedToken>} - New token
 */

export const unlockNexusSession = async (
  pending: NexusSession,
  host: HostSession,
  caller: NexusCaller
): Promise<IssuedToken> => {
  const now = new Date()
  const token = randomToken()

  // Rotation, the pending token dies
  await revokeNexusSession(pending.id, 'rotated')

  // Lives as long as the sign-in itself
  await prisma.nexusSession.create({
    data: {
      tokenHash: hashNexusToken(token),
      sessionId: host.id,
      accountId: host.accountId,
      stage: 'UNLOCKED',
      passwordAt: pending.passwordAt,
      discordAt: now,
      reauthAt: pending.passwordAt,
      expiresAt: host.expiresAt,
      address: caller.address,
      userAgent: caller.userAgent,
    },
  })

  return { token, expiresAt: host.expiresAt }
}

/**
 * Record a fresh password check on a console session
 * @param {NexusSession} session - Console session
 * @param {NexusCaller} caller - Who is calling
 * @return {Promise<void>}
 */

export const markReauthenticated = async (
  session: NexusSession,
  caller: NexusCaller
): Promise<void> => {
  await prisma.nexusSession.update({
    where: { id: session.id },
    data: { reauthAt: new Date(), address: caller.address, lastUsedAt: new Date() },
  })
}
