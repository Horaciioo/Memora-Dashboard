import 'server-only'

import { cache } from 'react'
import { renderSVG } from 'uqr'

import { prisma } from '@/core/lib/db'
import { decryptSecret, encryptSecret } from '@/core/lib/crypto'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import {
  createRecoveryCodes,
  createSecret,
  digestRecoveryCode,
  otpauthUri,
  verifyCode,
} from '@/core/lib/auth/totp'
import { APP_NAME } from '@/declarations/app'
import { TWO_FACTOR_SETTINGS } from '@/declarations/configurations/settings'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import type { TwoFactorEnrolment, TwoFactorState } from '@/types/security'

// Milliseconds in one minute
const MINUTE_MS = 60_000

/**
 * Read a credential
 * @param {string} accountId - Account identifier
 * @return {Promise<object | null>} - Credential row
 */

const readCredential = (accountId: string) =>
  prisma.twoFactorCredential.findUnique({ where: { accountId } })

/**
 * Read enrolment state
 * @param {string} accountId - Account identifier
 * @return {Promise<TwoFactorState>} - Enrolment state
 */

export const readTwoFactorState = cache(async (accountId: string): Promise<TwoFactorState> => {
  const credential = await readCredential(accountId)

  // A credential still waiting for its first code does not count as enrolled
  if (!credential || !credential.confirmedAt) {
    return { isEnrolled: false, confirmedAt: null, recoveryCodesLeft: 0 }
  }

  const recoveryCodesLeft = await prisma.twoFactorRecoveryCode.count({
    where: { credentialId: credential.id, usedAt: null },
  })

  return {
    isEnrolled: true,
    confirmedAt: credential.confirmedAt.toISOString(),
    recoveryCodesLeft,
  }
})

/**
 * Open an enrolment
 * @param {Object} member - Signed-in member
 * @param {string} member.id - Account identifier
 * @param {string} member.displayName - Display name
 * @return {Promise<TwoFactorEnrolment>} - Secret, QR code and fallback codes
 */

export const startEnrolment = async (member: {
  id: string
  displayName: string
}): Promise<TwoFactorEnrolment> => {
  const existing = await readCredential(member.id)

  // A confirmed credential is never silently overwritten
  if (existing?.confirmedAt) throw forbidden()

  const secret = createSecret()
  const codes = createRecoveryCodes()

  const credential = await prisma.twoFactorCredential.upsert({
    where: { accountId: member.id },
    update: { secret: encryptSecret(secret), lastStep: null },
    create: { accountId: member.id, secret: encryptSecret(secret) },
  })

  // The clear codes are handed over once, only their digests are kept
  await prisma.$transaction([
    prisma.twoFactorRecoveryCode.deleteMany({ where: { credentialId: credential.id } }),
    prisma.twoFactorRecoveryCode.createMany({
      data: codes.map((code) => ({
        credentialId: credential.id,
        digest: digestRecoveryCode(code),
      })),
    }),
  ])

  const uri = otpauthUri({ secret, account: member.displayName, issuer: APP_NAME })

  return { secret, uri, qrCode: renderSVG(uri), recoveryCodes: codes }
}

/**
 * Open a stored secret
 * @param {Object} credential - Credential row
 * @param {string} credential.secret - Stored secret
 * @return {string} - Clear secret
 */

const openSecret = (credential: { secret: string }): string => {
  const secret = decryptSecret(credential.secret)
  if (!secret) throw notFound()

  return secret
}

/**
 * Spend one fallback code
 * @param {string} credentialId - Credential identifier
 * @param {string} code - Submitted code
 * @return {Promise<boolean>} - Code was spent
 */

const spendRecoveryCode = async (credentialId: string, code: string): Promise<boolean> => {
  const { count } = await prisma.twoFactorRecoveryCode.updateMany({
    where: { credentialId, digest: digestRecoveryCode(code), usedAt: null },
    data: { usedAt: new Date() },
  })

  return count > 0
}

/**
 * Check a code
 * @param {string} accountId - Account identifier
 * @param {string} code - Submitted code
 * @return {Promise<void>} - Throws when rejected
 */

export const assertCode = async (accountId: string, code: string): Promise<void> => {
  const credential = await readCredential(accountId)
  if (!credential) throw notFound()

  const step = verifyCode(
    openSecret(credential),
    code,
    credential.lastStep ? Number(credential.lastStep) : undefined
  )

  // The spent step is recorded so the same code never opens twice
  if (step !== null) {
    await prisma.twoFactorCredential.update({
      where: { id: credential.id },
      data: { lastStep: BigInt(step) },
    })

    return
  }

  const spent = await spendRecoveryCode(credential.id, code)
  if (!spent) throw invalidInput([{ field: 'code', message: TWO_FACTOR_COPY.wrongCode }])
}

/**
 * Confirm an enrolment
 * @param {string} accountId - Account identifier
 * @param {string} code - Submitted code
 * @return {Promise<TwoFactorState>} - Enrolment state
 */

export const confirmEnrolment = async (
  accountId: string,
  code: string
): Promise<TwoFactorState> => {
  const credential = await readCredential(accountId)
  if (!credential) throw notFound()
  if (credential.confirmedAt) throw forbidden()

  // An enrolment left hanging past its window is not confirmable any more
  const opened = credential.updatedAt.getTime()
  const expired = opened + TWO_FACTOR_SETTINGS.enrolmentMinutes * MINUTE_MS < Date.now()
  if (expired) throw invalidInput([{ field: 'code', message: TWO_FACTOR_COPY.enrolmentExpired }])

  await assertCode(accountId, code)
  await prisma.twoFactorCredential.update({
    where: { id: credential.id },
    data: { confirmedAt: new Date() },
  })

  return readTwoFactorState(accountId)
}

/**
 * Drop a second factor
 * @param {string} accountId - Account identifier
 * @param {string} code - Submitted code
 * @return {Promise<void>} - Dropped
 */

export const dropEnrolment = async (accountId: string, code: string): Promise<void> => {
  await assertCode(accountId, code)
  await prisma.twoFactorCredential.deleteMany({ where: { accountId } })

  // Nothing stays unsealed once the factor that opened it is gone
  await prisma.session.updateMany({ where: { accountId }, data: { unsealedAt: null } })
}

/**
 * Open the window
 * @param {string} token - Session token
 * @return {Promise<string>} - Instant the window closes
 */

export const unsealSession = async (token: string): Promise<string> => {
  const unsealedAt = new Date()
  await prisma.session.updateMany({ where: { token }, data: { unsealedAt } })

  return new Date(
    unsealedAt.getTime() + TWO_FACTOR_SETTINGS.unlockMinutes * MINUTE_MS
  ).toISOString()
}

/**
 * Close the window
 * @param {string} token - Session token
 * @return {Promise<void>} - Sealed
 */

export const sealSession = async (token: string): Promise<void> => {
  await prisma.session.updateMany({ where: { token }, data: { unsealedAt: null } })
}

/**
 * Read the window
 * @param {string} token - Session token
 * @return {Promise<string | null>} - Instant it closes, null once shut
 */

export const readUnlockWindow = cache(async (token: string): Promise<string | null> => {
  const session = await prisma.session.findUnique({
    where: { token },
    select: { unsealedAt: true },
  })
  if (!session?.unsealedAt) return null

  const closesAt = session.unsealedAt.getTime() + TWO_FACTOR_SETTINGS.unlockMinutes * MINUTE_MS

  return closesAt > Date.now() ? new Date(closesAt).toISOString() : null
})
