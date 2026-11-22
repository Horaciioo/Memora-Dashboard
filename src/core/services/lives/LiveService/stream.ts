import 'server-only'

import { prisma } from '@/core/lib/db'
import { LiveStatuses } from '@/utils/constants/lives'

/**
 * Keep a running live on what Twitch shows: title and category
 * @param {Object} input - Stream read
 * @param {string} input.liveId - Live
 * @param {string} input.title - Title on Twitch
 * @param {{ id: string, name: string, art: string | null } | null} input.category - Category on Twitch
 * @return {Promise<void>} - Synced
 */

export const syncStreamState = async (input: {
  liveId: string
  title: string
  category: { id: string; name: string; art: string | null } | null
}): Promise<void> => {
  const live = await prisma.live.findUnique({
    where: { id: input.liveId },
    select: {
      status: true,
      title: true,
      calendarEventId: true,
      categories: { orderBy: { startedAt: 'desc' }, take: 1, select: { externalId: true } },
    },
  })
  if (!live || live.status !== LiveStatuses.Live) return

  // The Twitch title is the one the logs keep
  const title = input.title.trim()
  if (title && title !== live.title) {
    await prisma.live.update({ where: { id: input.liveId }, data: { title } })
    if (live.calendarEventId) {
      await prisma.calendarEvent
        .update({ where: { id: live.calendarEventId }, data: { title } })
        .catch(() => null)
    }
  }

  // One row per switch
  const { category } = input
  if (category && live.categories[0]?.externalId !== category.id) {
    await prisma.liveCategory.create({
      data: {
        liveId: input.liveId,
        externalId: category.id,
        name: category.name,
        artUrl: category.art,
      },
    })
  }
}
