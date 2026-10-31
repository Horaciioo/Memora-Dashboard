import 'server-only'

import { prisma } from '@/core/lib/db'
import { discordAvatarUrl } from '@/declarations/access/discord'

/**
 * Discord portraits of candidates
 * @param {string[]} discordIds - Candidate identifiers
 * @return {Promise<Map<string, string>>} - Portrait URL by identifier
 */

export const readPortraits = async (discordIds: string[]): Promise<Map<string, string>> => {
  const [accounts, claims] = await Promise.all([
    prisma.account.findMany({
      where: { discordId: { in: discordIds }, avatarUrl: { not: null } },
      select: { discordId: true, avatarUrl: true },
    }),
    // Newest claim last, so it wins
    prisma.integrationClaim.findMany({
      where: { discordId: { in: discordIds }, discordAvatarHash: { not: null } },
      orderBy: { claimedAt: 'asc' },
      select: { discordId: true, discordAvatarHash: true },
    }),
  ])

  const portraits = new Map<string, string>()

  for (const claim of claims) {
    const url = discordAvatarUrl(claim.discordId, claim.discordAvatarHash)
    if (url) portraits.set(claim.discordId, url)
  }

  // A member file keeps its own portrait
  for (const account of accounts) portraits.set(account.discordId, account.avatarUrl!)

  return portraits
}
