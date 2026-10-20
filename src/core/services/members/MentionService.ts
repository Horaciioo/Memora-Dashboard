import 'server-only'

import { prisma } from '@/core/lib/db'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { MentionOption } from '@/types/mentions'

/**
 * Members a remark can name, the closest names first
 * @param {string} term - Letters typed after the at sign
 * @param {string} viewerId - Who writes, never offered
 * @return {Promise<MentionOption[]>} - Members matching
 */

export const searchMentionable = async (
  term: string,
  viewerId: string
): Promise<MentionOption[]> => {
  const query = term.trim()

  const rows = await prisma.account.findMany({
    where: {
      id: { not: viewerId },
      leftAt: null,
      anonymisedAt: null,
      ...(query ? { displayName: { contains: query, mode: 'insensitive' } } : {}),
    },
    include: { division: { select: { name: true } } },
    orderBy: { displayName: 'asc' },
    // Room to put the closest names first
    take: NOTIFICATION_SETTINGS.mentionResults * 4,
  })

  // A name starting with the letters outranks one that merely holds them
  const lower = query.toLowerCase()
  const rank = (name: string) => (name.toLowerCase().startsWith(lower) ? 0 : 1)

  return rows
    .sort((left, right) => rank(left.displayName) - rank(right.displayName))
    .slice(0, NOTIFICATION_SETTINGS.mentionResults)
    .map((row) => ({
      id: row.id,
      name: row.displayName,
      image: row.avatarUrl,
      hint: row.division?.name ?? null,
    }))
}
