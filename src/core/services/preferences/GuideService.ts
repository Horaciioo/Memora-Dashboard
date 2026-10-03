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
 * Mark a one-time guide as seen, once
 * @param {string} accountId - Account identifier
 * @param {GuideKey} key - Guide
 * @return {Promise<void>} - Marked
 */

export const markGuideSeen = async (accountId: string, key: GuideKey): Promise<void> => {
  if (await hasSeenGuide(accountId, key)) return

  await prisma.account.update({ where: { id: accountId }, data: { seenGuides: { push: key } } })
}
