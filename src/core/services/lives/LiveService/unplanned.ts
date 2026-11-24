import 'server-only'
import { prisma } from '@/core/lib/db'
import { publishLive } from '@/core/lib/lives/bus'
import { logger } from '@/core/lib/logger'
import { readRunningStreams } from '@/core/lib/platforms/twitch/helix'
import { syncRoster } from '@/core/services/calendar/attendance'
import { convene } from '@/core/services/lives/LiveService/convene'
import { moveLiveFromPlatform } from '@/core/services/lives/LiveService/lifecycle'
import { findPlannedEntry } from '@/core/services/lives/LiveService/adopt'
import { missedBefore } from '@/core/services/lives/LiveService/recovery'
import { readLiveTemplateId, readLiveTemplates } from '@/core/services/lives/LiveService/forms'
import { notify } from '@/core/services/system/NotificationService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { LIVE_UNPLANNED_TITLE } from '@/declarations/lives/copy'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MINUTE_MS } from '@/utils/constants/time'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import { TWITCH_LIMITS } from '@/declarations/platforms/twitch'

/**
 * Open the live of a running stream nobody planned: calendar entry titled after the stream,
 * no Coordinator, the creator's team convened and told
 * @param {Object} stream - Running stream
 * @param {string} stream.youtuberId - Creator
 * @param {string} stream.id - Platform stream
 * @param {string} stream.title - Stream title
 * @param {string} stream.startedAt - Start moment
 * @param {string | null} templateId - Live entry model
 * @param {string | null} plannedEntryId - Entry the responsables already planned
 * @return {Promise<void>} - Opened
 */

const openFromStream = async (
  stream: { youtuberId: string; id: string; title: string; startedAt: string },
  templateId: string | null,
  plannedEntryId: string | null
): Promise<void> => {
  const startsAt = new Date(stream.startedAt)
  const title = stream.title.trim() || LIVE_UNPLANNED_TITLE
  const memberIds = await convene({
    youtuberId: stream.youtuberId,
    picked: [],
    startsAt,
    endsAt: startsAt,
    scope: { isGlobal: true, youtuberIds: [], activeYoutuberId: null },
  })

  const entry = plannedEntryId
    ? await prisma.calendarEvent.update({
        where: { id: plannedEntryId },
        data: { title },
      })
    : await prisma.calendarEvent.create({
        data: { title, templateId, youtuberId: stream.youtuberId, startsAt },
      })

  // An entry is never left without its live
  const live = await createStreamLive({ entryId: entry.id, stream, title, memberIds }).catch(
    async (error: unknown) => {
      if (!plannedEntryId) await prisma.calendarEvent.deleteMany({ where: { id: entry.id } })
      throw error
    }
  )

  await publishLive(LIVE_TOPICS.lives, {
    liveId: live.id,
    youtuberId: stream.youtuberId,
    status: LiveStatuses.Live,
  })
  await notify({
    kind: 'LiveStarted',
    recipients: memberIds,
    actorId: null,
    target: 'live',
    targetId: live.id,
    subject: title,
  })
  await recordEvent({
    eventType: 'LiveAnnounced',
    actorId: null,
    targetType: 'live',
    targetId: live.id,
    summary: title,
  })
}

/**
 * Write the roll and the running live of an opened entry
 * @param {Object} input - Live to write
 * @param {string} input.entryId - Calendar entry
 * @param {{ youtuberId: string, id: string, startedAt: string }} input.stream - Running stream
 * @param {string} input.title - Live title
 * @param {string[]} input.memberIds - Team convened
 * @return {Promise<{ id: string }>} - Live
 */

const createStreamLive = async ({
  entryId,
  stream,
  title,
  memberIds,
}: {
  entryId: string
  stream: { youtuberId: string; id: string; startedAt: string }
  title: string
  memberIds: string[]
}): Promise<{ id: string }> => {
  await syncRoster(entryId, memberIds)

  return prisma.live.create({
    select: { id: true },
    data: {
      youtuberId: stream.youtuberId,
      platform: LivePlatforms.Twitch,
      title,
      status: LiveStatuses.Live,
      plannedStartAt: new Date(stream.startedAt),
      startedAt: new Date(stream.startedAt),
      streamExternalId: stream.id,
      calendarEventId: entryId,
      members: { create: memberIds.map((accountId) => ({ accountId })) },
    },
  })
}

// Streams already announced to the team, survives dev hot reloads
const globalForTold = globalThis as unknown as { creatorLiveTold?: Set<string> }
const told = (globalForTold.creatorLiveTold ??= new Set<string>())

/**
 * Tell the creator's live team the stream is on, once per stream
 * @param {Object} stream - Running stream
 * @param {string} stream.youtuberId - Creator
 * @param {string} stream.id - Platform stream
 * @param {string | null} liveId - Live already planned, if any
 * @return {Promise<void>} - Told
 */

const tellCreatorLive = async (
  stream: { youtuberId: string; id: string },
  liveId: string | null
): Promise<void> => {
  if (told.has(stream.id)) return
  told.add(stream.id)

  const [creator, memberIds] = await Promise.all([
    prisma.youtuber.findUnique({ where: { id: stream.youtuberId }, select: { name: true } }),
    convene({
      youtuberId: stream.youtuberId,
      picked: [],
      startsAt: new Date(),
      endsAt: new Date(),
      scope: { isGlobal: true, youtuberIds: [], activeYoutuberId: null },
    }),
  ])
  if (!creator) return

  await notify({
    kind: 'CreatorLive',
    recipients: memberIds,
    actorId: null,
    target: liveId ? 'live' : 'home',
    targetId: liveId,
    subject: creator.name,
    once: true,
  })
}

/**
 * Open a live for every Twitch stream running with no live or live entry on its slot, tell the team otherwise
 * @return {Promise<void>} - Opened
 */

export const openUnplannedLives = async (): Promise<void> => {
  const channels = await prisma.youtuberChannel.findMany({
    where: { platform: LivePlatforms.Twitch, youtuber: { archived: false } },
    select: { externalId: true, youtuberId: true },
  })
  // Same rule as the watcher, never a guess between channels
  const count = new Map<string, number>()
  for (const channel of channels)
    count.set(channel.youtuberId, (count.get(channel.youtuberId) ?? 0) + 1)
  const sole = channels.filter((channel) => count.get(channel.youtuberId) === 1)
  if (sole.length === 0) return

  const byChannel = new Map(sole.map((channel) => [channel.externalId, channel.youtuberId]))
  const ids = [...byChannel.keys()]
  const running: Awaited<ReturnType<typeof readRunningStreams>> = []
  for (let from = 0; from < ids.length; from += TWITCH_LIMITS.streamsBatch) {
    running.push(...(await readRunningStreams(ids.slice(from, from + TWITCH_LIMITS.streamsBatch))))
  }
  if (running.length === 0) return

  // A stream already carried is left alone
  const known = await prisma.live.findMany({
    where: {
      platform: LivePlatforms.Twitch,
      streamExternalId: { in: running.map((stream) => stream.id) },
    },
    select: { streamExternalId: true },
  })
  const seen = new Set(known.map((live) => live.streamExternalId))
  const templateId = await readLiveTemplateId()
  const liveTemplates = [...(await readLiveTemplates()).keys()]
  const to = new Date(Date.now() + LIVE_SETTINGS.watchLeadMinutes * MINUTE_MS)

  for (const stream of running) {
    const youtuberId = byChannel.get(stream.channelId)
    if (!youtuberId || seen.has(stream.id)) continue

    // Already on air: only the creator's team is told
    const running = await prisma.live.findFirst({
      where: { youtuberId, platform: LivePlatforms.Twitch, status: LiveStatuses.Live },
      select: { id: true },
    })
    if (running) {
      await tellCreatorLive({ ...stream, youtuberId }, running.id)
      continue
    }

    // The announced live takes the stream, however late it starts
    const announced = await prisma.live.findFirst({
      where: {
        youtuberId,
        platform: LivePlatforms.Twitch,
        status: LiveStatuses.Announced,
        plannedStartAt: { gte: missedBefore(), lte: to },
      },
      orderBy: { plannedStartAt: 'desc' },
      select: { id: true },
    })
    if (
      announced &&
      (await moveLiveFromPlatform(announced.id, LiveStatuses.Live, stream.id, stream.title))
    ) {
      continue
    }

    // The responsables' entry takes the stream, the roll stays on it
    const entry = await findPlannedEntry({ youtuberId, liveTemplates })
    if (entry?.hasLive) {
      await tellCreatorLive({ ...stream, youtuberId }, null)
      continue
    }

    await openFromStream({ ...stream, youtuberId }, templateId, entry?.id ?? null).catch(
      (error: unknown) =>
        logger.warn(
          '[lives] unplanned live not opened',
          error instanceof Error ? error.message : ''
        )
    )
  }
}
