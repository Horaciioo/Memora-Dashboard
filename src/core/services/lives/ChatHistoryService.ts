import 'server-only'

import { decryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { channelOf } from '@/core/services/lives/ViewerCommentService'
import { LIVE_SETTINGS, RETENTION_SETTINGS } from '@/declarations/configurations/settings'
import type { ViewerChatHistory } from '@/types/lives'
import { DAY_MS } from '@/utils/constants/time'

/**
 * Chat of a viewer on the creator's channel
 * @param {string} liveId - Live the card opens on
 * @param {string} viewerId - Platform user identifier
 * @param {AccessScope} scope - Reader perimeter
 * @param {string | null} cursor - Last message of the previous page
 * @return {Promise<ViewerChatHistory>} - One page, newest first
 */

export const viewerChatHistory = async (
  liveId: string,
  viewerId: string,
  scope: AccessScope,
  cursor: string | null
): Promise<ViewerChatHistory> => {
  const channel = await channelOf(liveId, scope)
  const size = LIVE_SETTINGS.chatPageSize

  const [rows, stat] = await Promise.all([
    prisma.liveChatMessage.findMany({
      where: { ...channel, platformUserId: viewerId },
      orderBy: [{ sentAt: 'desc' }, { id: 'desc' }],
      // One more row tells whether a page follows
      take: size + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.viewerChatStat.findUnique({
      where: { youtuberId_platform_platformUserId: { ...channel, platformUserId: viewerId } },
    }),
  ])
  const page = rows.slice(0, size)

  return {
    messages: page.map((row) => ({
      id: row.id,
      body: decryptField(row.body) ?? '',
      sentAt: row.sentAt.toISOString(),
      liveId: row.liveId,
      source: row.source,
      deleted: row.deletedAt !== null,
    })),
    nextCursor: rows.length > size ? (page.at(-1)?.id ?? null) : null,
    total: stat?.messageCount ?? 0,
    firstKnownAt: stat?.firstMessageAt.toISOString() ?? null,
    firstSource: stat?.firstSource ?? null,
    isComplete: stat?.isComplete ?? false,
  }
}

/**
 * Erase the chat kept on a viewer, at their request
 * @param {string} liveId - Live the card opens on
 * @param {string} viewerId - Platform user identifier
 * @param {AccessScope} scope - Eraser perimeter
 * @return {Promise<number>} - Messages erased
 */

export const eraseViewerChat = async (
  liveId: string,
  viewerId: string,
  scope: AccessScope
): Promise<number> => {
  const channel = await channelOf(liveId, scope)
  const where = { ...channel, platformUserId: viewerId }

  const [messages] = await prisma.$transaction([
    prisma.liveChatMessage.deleteMany({ where }),
    prisma.viewerChatStat.deleteMany({ where }),
  ])

  return messages.count
}

/**
 * Drop messages past their keeping time: totals and first message stay in the stats
 * @return {Promise<number>} - Messages dropped
 */

export const purgeChatMessages = async (): Promise<number> => {
  const before = new Date(Date.now() - RETENTION_SETTINGS.chatMessageDays * DAY_MS)
  const done = await prisma.liveChatMessage.deleteMany({ where: { sentAt: { lt: before } } })

  return done.count
}
