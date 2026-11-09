import 'server-only'

import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { createBatcher } from '@/core/lib/lives/batcher'
import { logger } from '@/core/lib/logger'
import type { ChatRecord } from '@/core/lib/platforms/twitch/chatRecord'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { ChatSources, LivePlatforms } from '@/utils/constants/lives'

/**
 * Message with the channel it belongs to
 * @typedef {Object} StoredChat
 * @property {string} youtuberId - Creator
 * @property {string} liveId - Live
 */

export type StoredChat = ChatRecord & { youtuberId: string; liveId: string }

// Key of a message on its channel
const keyOf = (item: { youtuberId: string; externalId: string }): string =>
  `${item.youtuberId}:${item.externalId}`

// Messages not stored yet, once each
const freshOnly = async (items: StoredChat[]): Promise<StoredChat[]> => {
  const known = await prisma.liveChatMessage.findMany({
    where: {
      platform: LivePlatforms.Twitch,
      externalId: { in: items.map((item) => item.externalId) },
    },
    select: { youtuberId: true, externalId: true },
  })
  const seen = new Set(known.map(keyOf))

  return items.filter((item) => {
    const key = keyOf(item)
    if (seen.has(key)) return false
    seen.add(key)

    return true
  })
}

// Totals per viewer of a batch
const totalsOf = (items: StoredChat[]) => {
  const totals = new Map<string, { item: StoredChat; count: number; first: Date }>()

  for (const item of items) {
    const key = `${item.youtuberId}:${item.platformUserId}`
    const sentAt = new Date(item.sentAt)
    const known = totals.get(key)

    totals.set(key, {
      item,
      count: (known?.count ?? 0) + 1,
      first: known && known.first < sentAt ? known.first : sentAt,
    })
  }

  return [...totals.values()]
}

// One batch in a few queries
const writeBatch = async (items: StoredChat[]): Promise<void> => {
  const fresh = await freshOnly(items)
  if (fresh.length === 0) return

  await prisma.$transaction([
    prisma.liveChatMessage.createMany({
      data: fresh.map((item) => ({
        youtuberId: item.youtuberId,
        platform: LivePlatforms.Twitch,
        platformUserId: item.platformUserId,
        viewerLogin: item.viewerLogin,
        externalId: item.externalId,
        body: encryptField(item.body) ?? '',
        sentAt: new Date(item.sentAt),
        liveId: item.liveId,
        source: ChatSources.Live,
      })),
      skipDuplicates: true,
    }),
    ...totalsOf(fresh).map(({ item, count, first }) =>
      prisma.viewerChatStat.upsert({
        where: {
          youtuberId_platform_platformUserId: {
            youtuberId: item.youtuberId,
            platform: LivePlatforms.Twitch,
            platformUserId: item.platformUserId,
          },
        },
        update: { messageCount: { increment: count } },
        create: {
          youtuberId: item.youtuberId,
          platform: LivePlatforms.Twitch,
          platformUserId: item.platformUserId,
          messageCount: count,
          firstMessageAt: first,
          firstSource: ChatSources.Live,
        },
      })
    ),
  ])
}

// Survives dev hot reloads
const globalForChat = globalThis as unknown as {
  chatBatcher?: ReturnType<typeof createBatcher<StoredChat>>
}

const batcher = (globalForChat.chatBatcher ??= createBatcher<StoredChat>({
  intervalMs: LIVE_SETTINGS.chatFlushMs,
  maxItems: LIVE_SETTINGS.chatBatchMax,
  capacity: LIVE_SETTINGS.chatBufferMax,
  write: (items) =>
    writeBatch(items).catch((error: unknown) => {
      logger.warn('[chat] batch not stored', error instanceof Error ? error.message : '')
    }),
  onDrop: () => logger.warn('[chat] buffer full, messages dropped'),
}))

/**
 * Keep one chat message, written with the next batch
 * @param {StoredChat} item - Message
 * @return {void}
 */

export const recordChatMessage = (item: StoredChat): void => batcher.push(item)

/**
 * Write every held message now
 * @return {Promise<void>} - Written
 */

export const flushChatMessages = (): Promise<void> => batcher.flush()

/**
 * Mark messages a moderator removed
 * @param {Object} input - Removal
 * @param {string} input.youtuberId - Creator
 * @param {string[]} [input.messageIds] - Messages removed
 * @param {string} [input.chatterId] - Chatter cleared
 * @return {Promise<void>} - Marked
 */

export const markChatDeleted = async (input: {
  youtuberId: string
  messageIds?: string[]
  chatterId?: string
}): Promise<void> => {
  // Never a blanket removal
  if (!input.messageIds && !input.chatterId) return

  // Held messages land first
  await flushChatMessages()

  await prisma.liveChatMessage.updateMany({
    where: {
      youtuberId: input.youtuberId,
      platform: LivePlatforms.Twitch,
      deletedAt: null,
      ...(input.messageIds ? { externalId: { in: input.messageIds } } : {}),
      ...(input.chatterId ? { platformUserId: input.chatterId } : {}),
    },
    data: { deletedAt: new Date() },
  })
}
