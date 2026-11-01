import 'server-only'

import { cookies } from 'next/headers'

import { prisma } from '@/core/lib/db'
import { notAuthenticated, notFound } from '@/core/lib/errors'
import { SESSION_COOKIE } from '@/core/lib/auth/session'
import { digestSessionToken } from '@/core/lib/auth/sessionDigest'
import { PUSH_CATEGORY_REGISTRY } from '@/declarations/notifications/categories'
import type { PushCategoryName } from '@/declarations/notifications/categories'
import type { PushDeviceView, PushSettingsView, PushSubscriptionInput } from '@/types/push'

// Columns a device shows
const DEVICE_SELECT = {
  id: true,
  device: true,
  endpoint: true,
  createdAt: true,
  lastSentAt: true,
} as const

/**
 * Map a subscription row to its view
 * @param {Object} row - Stored subscription
 * @return {PushDeviceView} - Device
 */

const toDevice = (row: {
  id: string
  device: string | null
  endpoint: string
  createdAt: Date
  lastSentAt: Date | null
}): PushDeviceView => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  lastSentAt: row.lastSentAt?.toISOString() ?? null,
})

/**
 * Session the request was signed in with
 * @param {string} accountId - Signed-in member
 * @return {Promise<string>} - Session identifier
 */

const currentSessionId = async (accountId: string): Promise<string> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const session = token
    ? await prisma.session.findFirst({
        where: { token: digestSessionToken(token), accountId },
        select: { id: true },
      })
    : null
  if (!session) throw notAuthenticated()

  return session.id
}

/**
 * Record the browser of this session as a push device
 * @param {string} accountId - Signed-in member
 * @param {PushSubscriptionInput} input - Subscription handed by the browser
 * @param {string | null} device - User agent
 * @return {Promise<PushDeviceView>} - Device
 */

export const savePushSubscription = async (
  accountId: string,
  input: PushSubscriptionInput,
  device: string | null
): Promise<PushDeviceView> => {
  const sessionId = await currentSessionId(accountId)
  const owned = { accountId, sessionId, p256dh: input.p256dh, auth: input.auth, device }

  // A browser handed from one member to another changes hands with it
  const row = await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: { endpoint: input.endpoint, ...owned },
    update: owned,
    select: DEVICE_SELECT,
  })

  return toDevice(row)
}

/**
 * Forget the browser behind one address
 * @param {string} accountId - Signed-in member
 * @param {string} endpoint - Subscription address
 * @return {Promise<void>} - Removed
 */

export const removePushSubscription = async (
  accountId: string,
  endpoint: string
): Promise<void> => {
  await prisma.pushSubscription.deleteMany({ where: { accountId, endpoint } })
}

/**
 * Forget one device from the settings
 * @param {string} accountId - Signed-in member
 * @param {string} id - Subscription identifier
 * @return {Promise<void>} - Removed
 */

export const removePushDevice = async (accountId: string, id: string): Promise<void> => {
  const { count } = await prisma.pushSubscription.deleteMany({ where: { id, accountId } })
  if (count === 0) throw notFound()
}

/**
 * Read the push settings of a member
 * @param {string} accountId - Signed-in member
 * @return {Promise<PushSettingsView>} - Silenced families and devices
 */

export const readPushSettings = async (accountId: string): Promise<PushSettingsView> => {
  const account = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: {
      pushMutedCategories: true,
      pushSubscriptions: { select: DEVICE_SELECT, orderBy: { createdAt: 'desc' } },
    },
  })

  return {
    muted: account.pushMutedCategories.filter(PUSH_CATEGORY_REGISTRY.has),
    devices: account.pushSubscriptions.map(toDevice),
  }
}

/**
 * Store the families a member silenced
 * @param {string} accountId - Signed-in member
 * @param {string[]} muted - Silenced families, unknown ones dropped
 * @return {Promise<PushCategoryName[]>} - Stored families
 */

export const setMutedCategories = async (
  accountId: string,
  muted: string[]
): Promise<PushCategoryName[]> => {
  const kept = [...new Set(muted)].filter(PUSH_CATEGORY_REGISTRY.has)

  await prisma.account.update({ where: { id: accountId }, data: { pushMutedCategories: kept } })

  return kept
}
