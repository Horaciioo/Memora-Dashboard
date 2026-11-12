import 'server-only'

import { prisma } from '@/core/lib/db'
import { accessStateOf } from '@/core/lib/unban/linkState'
import { hashToken, isWellFormedToken } from '@/core/lib/unban/token'
import type { PublicLinkContext } from '@/types/unban'
import type { Prisma } from '@prisma/client'

// What the public pages may learn about a link
const PUBLIC_INCLUDE = {
  youtuber: { select: { name: true, avatarUrl: true, bannerUrl: true } },
} as const

export type PublicLinkRow = Prisma.UnbanLinkGetPayload<{ include: typeof PUBLIC_INCLUDE }>

/**
 * Link behind a token, none for a token that cannot exist
 * @param {string} token - Secret from the address
 * @return {Promise<PublicLinkRow | null>} - Stored link
 */

export const findLinkByToken = async (token: string): Promise<PublicLinkRow | null> => {
  // A badly formed token never reaches the database
  if (!isWellFormedToken(token)) return null

  return prisma.unbanLink.findUnique({
    where: { tokenHash: hashToken(token) },
    include: PUBLIC_INCLUDE,
  })
}

/**
 * Minimal context of a link for the public page, the expected account is never sent
 * @param {PublicLinkRow} row - Stored link
 * @param {Date} [now] - Moment of the reading
 * @return {PublicLinkContext} - Context
 */

export const toPublicContext = (row: PublicLinkRow, now: Date = new Date()): PublicLinkContext => ({
  linkId: row.id,
  state: accessStateOf(row, now),
  requiresAccount: row.expectedDiscordId !== null,
  expiresAt: row.expiresAt.toISOString(),
  creator: row.youtuber,
})

/**
 * What a stranger holding a token may know, none when it opens nothing
 * @param {string} token - Secret from the address
 * @return {Promise<PublicLinkContext | null>} - Context, null for an unknown token
 */

export const resolvePublicLink = async (token: string): Promise<PublicLinkContext | null> => {
  const row = await findLinkByToken(token)

  return row ? toPublicContext(row) : null
}
