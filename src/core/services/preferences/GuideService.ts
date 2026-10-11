import 'server-only'

import { prisma } from '@/core/lib/db'
import type { GuideKey } from '@/declarations/academy/welcome'

/**
 * Whether a member already saw a one-time guide
 * @param {string} accountId - Account identifier
 * @param {GuideKey} key - Guide
 * @return {Promise<boolean>} - Seen
 */

export const hasSeenGuide = async (accountId: string, key: GuideKey): Promise<boolean> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { seenGuides: true },
  })

  return account?.seenGuides.includes(key) ?? false
}

/**
 * Mark a one-time guide as seen
 * @param {string} accountId - Account identifier
 * @param {GuideKey} key - Guide
 * @return {Promise<void>} - Marked
 */

export const markGuideSeen = async (accountId: string, key: GuideKey): Promise<void> => {
  if (await hasSeenGuide(accountId, key)) return

  await prisma.account.update({ where: { id: accountId }, data: { seenGuides: { push: key } } })
}

/**
 * Guides of the first visit, never shown again by a reset
 * @param {string} key - Guide key
 * @return {boolean} - Belongs to the first visit
 */

const isTourGuide = (key: string): boolean =>
  key.startsWith('visite-') || key.startsWith('tour-page:')

/**
 * Show the one-time guides again, the first visit stays done
 * @param {string} accountId - Account identifier
 * @return {Promise<void>} - Reset
 */

export const resetGuides = async (accountId: string): Promise<void> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { seenGuides: true },
  })

  await prisma.account.update({
    where: { id: accountId },
    data: { seenGuides: { set: (account?.seenGuides ?? []).filter(isTourGuide) } },
  })
}
