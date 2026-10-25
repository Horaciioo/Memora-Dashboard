import 'server-only'

import { prisma } from '@/core/lib/db'
import { publishLive } from '@/core/lib/lives/bus'
import { queueLogWrite } from '@/core/lib/lives/logQueue'
import { forgetLiveState, pollLiveState } from '@/core/services/lives/LiveStatePoller'
import { forgetLive, keepConnection } from '@/core/lib/lives/recent'
import type { LiveConnection } from '@/core/lib/lives/recent'
import { closeRoom, pushRoomEvent } from '@/core/lib/lives/room'
import { logger } from '@/core/lib/logger'
import { EventSubSession } from '@/core/lib/platforms/twitch/session'
import type { TwitchSignal } from '@/core/lib/platforms/twitch/eventsub'
import { moveLiveFromPlatform } from '@/core/services/lives/LiveService'
import { liveconLevelOf, logPlatformGesture } from '@/core/services/lives/ModerationLogService'
import { logEntryOf } from '@/core/lib/platforms/twitch/logEntry'
import { forgetSampling, sampleViewers } from '@/core/services/lives/LiveSampler'
import { sweepStalePresences } from '@/core/services/lives/PresenceService'
import { soleChannel } from '@/core/services/platforms/ChannelService'
import { readTwitchSeat } from '@/core/services/platforms/PlatformAccountService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_STREAM_EVENTS, LIVE_TOPICS } from '@/declarations/lives/topics'
import { PLATFORM_NOTICE_COPY } from '@/declarations/platforms/copy'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import { CoordinationStatuses, LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * One live being watched
 * @typedef {Object} Watch
 * @property {EventSubSession} session - Platform session
 * @property {string} holderId - Member whose token carries it
 * @property {string} broadcasterId - Channel
 * @property {ReturnType<typeof setTimeout> | null} offline - Pending end after an offline
 * @property {LiveStatusName} status - Status read at the last sync
 */

interface Watch {
  session: EventSubSession
  holderId: string
  broadcasterId: string
  offline: ReturnType<typeof setTimeout> | null
  status: LiveStatusName
}

// Survives dev hot reloads
const globalForWatcher = globalThis as unknown as {
  liveWatcher?: {
    watches: Map<string, Watch>
    timer: ReturnType<typeof setInterval> | null
    livecon: Map<string, { level: number | null; until: number }>
    // Members whose seat failed to carry a live
    refused: Map<string, Set<string>>
    syncing?: boolean
  }
}

const watcher = (globalForWatcher.liveWatcher ??= {
  watches: new Map(),
  timer: null,
  livecon: new Map(),
  refused: new Map(),
  syncing: false,
})

/**
 * Livecon level, read once per window
 * @param {string} youtuberId - Creator
 * @return {Promise<number | null>} - Level number
 */

const cachedLivecon = async (youtuberId: string): Promise<number | null> => {
  const known = watcher.livecon.get(youtuberId)
  if (known && known.until > Date.now()) return known.level

  const level = await liveconLevelOf(youtuberId)
  watcher.livecon.set(youtuberId, {
    level,
    until: Date.now() + LIVE_SETTINGS.liveconCacheSeconds * 1000,
  })

  return level
}

/**
 * Tell every open Mod View of a live how the platform link stands
 * @param {string} liveId - Live
 * @param {LiveConnection} connection - Link
 * @return {Promise<void>} - Told
 */

const announceConnection = async (liveId: string, connection: LiveConnection): Promise<void> => {
  await keepConnection(liveId, connection)
  await publishLive(LIVE_TOPICS.live(liveId), {
    type: LIVE_STREAM_EVENTS.connection,
    ...connection,
  })
}

/**
 * Act on one signal of a watched live
 * @param {string} liveId - Live
 * @param {TwitchSignal} signal - Signal
 * @return {Promise<void>} - Handled
 */

const handleSignal = async (liveId: string, signal: TwitchSignal): Promise<void> => {
  const watch = watcher.watches.get(liveId)

  switch (signal.kind) {
    case 'scene':
      // Gathered then flushed
      pushRoomEvent(liveId, signal.event)
      return
    case 'online':
      // A short cut never ends the live
      if (watch?.offline) {
        clearTimeout(watch.offline)
        watch.offline = null
      }
      await moveLiveFromPlatform(liveId, LiveStatuses.Live, signal.streamId)
      return
    case 'offline':
      if (!watch || watch.offline) return
      watch.offline = setTimeout(() => {
        watch.offline = null
        void moveLiveFromPlatform(liveId, LiveStatuses.Ended)
      }, LIVE_SETTINGS.endGraceMinutes * MINUTE_MS)
      return
  }
}

/**
 * Start watching one live with the first member able to carry it
 * @param {Object} live - Live coordinates
 * @return {Promise<void>} - Watching
 */

const watch = async (live: {
  id: string
  youtuberId: string
  status: LiveStatusName
  coordinatorIds: string[]
  announcedById: string | null
  members: { accountId: string }[]
  youtuber: { channels: { externalId: string }[] }
}): Promise<void> => {
  // Same rule as the Mod View, never a guess between channels
  const channel = soleChannel(live.youtuber.channels)
  if (!channel || channel === 'several') {
    await announceConnection(live.id, {
      state: 'disconnected',
      notice: channel ? PLATFORM_NOTICE_COPY.severalChannels : PLATFORM_NOTICE_COPY.noChannel,
    })
    return
  }
  const broadcasterId = channel.externalId
  const refused = watcher.refused.get(live.id)

  // The coordinator first
  const candidates = [
    ...new Set(
      [
        ...live.coordinatorIds,
        live.announcedById,
        ...live.members.map((seat) => seat.accountId),
      ].filter((id): id is string => Boolean(id))
    ),
  ]
  let holderId: string | null = null
  for (const candidate of candidates) {
    if (refused?.has(candidate)) continue
    const seat = await readTwitchSeat(candidate).catch(() => null)
    if (seat?.ok) {
      holderId = candidate
      break
    }
  }
  if (!holderId) {
    await announceConnection(live.id, {
      state: 'disconnected',
      notice: PLATFORM_NOTICE_COPY.notLinked,
    })
    return
  }

  const holder = holderId
  const session = new EventSubSession({
    broadcasterId,
    keepaliveSeconds: LIVE_SETTINGS.eventsubKeepaliveSeconds,
    seat: async () => {
      const seat = await readTwitchSeat(holder).catch(() => null)

      return seat?.ok ? { accessToken: seat.accessToken, moderatorId: seat.moderatorId } : null
    },
    onSignal: (signal) => {
      void handleSignal(live.id, signal).catch((error: unknown) =>
        logger.warn('[watcher] signal not handled', error instanceof Error ? error.message : '')
      )
    },
    onNotification: (type, event, meta) => {
      const entry = logEntryOf(type, event, meta)
      if (!entry) return

      queueLogWrite(async () =>
        logPlatformGesture({
          liveId: live.id,
          platform: LivePlatforms.Twitch,
          entry,
          liveconLevel: await cachedLivecon(live.youtuberId),
        })
      )
    },
    onState: (state) => {
      void announceConnection(live.id, {
        state,
        notice: state === 'disconnected' ? PLATFORM_NOTICE_COPY.reconnecting : null,
      })
    },
  })

  watcher.watches.set(live.id, {
    session,
    holderId: holder,
    broadcasterId,
    offline: null,
    status: live.status,
  })
  session.start()
}

/**
 * Read the stream of a watched live: room, viewer curve, and the start or end a lost signal missed
 * @param {string} liveId - Live
 * @param {Watch} current - Watch
 * @return {Promise<void>} - Followed
 */

const followStream = async (liveId: string, current: Watch): Promise<void> => {
  const stream = await pollLiveState({ liveId, ...current })
  // No answer says nothing
  if (stream === undefined) return

  if (stream) {
    await sampleViewers(liveId, stream.viewers)
    // Started before the watch or while the signal was lost
    if (current.status === LiveStatuses.Announced) {
      await handleSignal(liveId, {
        kind: 'online',
        streamId: stream.id,
        startedAt: stream.startedAt,
      })
    }
    return
  }

  // Offline with no end pending, a restart lost the timer
  if (current.status === LiveStatuses.Live && !current.offline) {
    await handleSignal(liveId, { kind: 'offline' })
  }
}

/**
 * Line the sessions up with the open Twitch lives
 * @return {Promise<void>} - Synced
 */

export const syncLiveWatches = async (): Promise<void> => {
  // One tick at a time
  if (watcher.syncing) return
  watcher.syncing = true

  try {
    await syncOnce()
  } finally {
    watcher.syncing = false
  }
}

// One pass over the open lives
const syncOnce = async (): Promise<void> => {
  const lives = await prisma.live.findMany({
    where: {
      platform: LivePlatforms.Twitch,
      // A running live stays watched, an announced one from 2 h before to 2 h after its start
      OR: [
        { status: LiveStatuses.Live },
        {
          status: LiveStatuses.Announced,
          plannedStartAt: {
            gte: new Date(Date.now() - LIVE_SETTINGS.watchTrailMinutes * MINUTE_MS),
            lte: new Date(Date.now() + LIVE_SETTINGS.watchLeadMinutes * MINUTE_MS),
          },
        },
      ],
    },
    select: {
      id: true,
      youtuberId: true,
      status: true,
      coordinations: {
        where: { status: CoordinationStatuses.Accepted },
        select: { accountId: true },
      },
      announcedById: true,
      members: { select: { accountId: true } },
      youtuber: {
        select: {
          channels: { where: { platform: LivePlatforms.Twitch }, select: { externalId: true } },
        },
      },
    },
    // Newest first when over the cap
    orderBy: { plannedStartAt: 'desc' },
    take: LIVE_SETTINGS.maxOpenLives,
  })
  const open = new Map(lives.map((live) => [live.id, live]))

  for (const [liveId, current] of watcher.watches) {
    const live = open.get(liveId)

    // Closed lives let go of their session
    if (!live) {
      current.session.stop()
      if (current.offline) clearTimeout(current.offline)
      watcher.watches.delete(liveId)
      watcher.refused.delete(liveId)
      forgetSampling(liveId)
      forgetLiveState(liveId)
      await forgetLive(liveId)
      await closeRoom(liveId)
      continue
    }

    // A seat that gave up hands the live to the next member below
    if (current.session.isStopped) {
      if (current.offline) clearTimeout(current.offline)
      watcher.watches.delete(liveId)
      watcher.refused.set(
        liveId,
        new Set([...(watcher.refused.get(liveId) ?? []), current.holderId])
      )
      continue
    }

    current.status = live.status as LiveStatusName
    void followStream(liveId, current).catch(() => null)
  }

  for (const live of lives) {
    if (watcher.watches.has(live.id)) continue
    await watch({
      ...live,
      status: live.status as LiveStatusName,
      coordinatorIds: live.coordinations.map((seat) => seat.accountId),
    })
  }
}

// This instance, for the watching lease
const INSTANCE_ID = crypto.randomUUID()

/**
 * Whether this instance watches the lives: with several instances, only the one holding the
 * Redis lease does, the lease renewed at each pass. Without Redis, the only instance does
 * @return {Promise<boolean>} - Lease held
 */

const holdsWatchLease = async (): Promise<boolean> => {
  const container = runtime()
  const cache = container?.redis.isReady() ? container.redis.cache : null
  if (!cache) return true

  const key = `${container!.redis.prefix}${LIVE_TOPICS.watchLease}`
  const ttl = LIVE_SETTINGS.watchSyncSeconds * 3
  if ((await cache.set(key, INSTANCE_ID, 'EX', ttl, 'NX')) === 'OK') return true
  if ((await cache.get(key)) !== INSTANCE_ID) return false

  await cache.expire(key, ttl)
  return true
}

/**
 * Drop every session and pending end, the watching moved to another instance
 * @return {void}
 */

const releaseWatches = (): void => {
  for (const current of watcher.watches.values()) {
    if (current.offline) clearTimeout(current.offline)
    current.session.stop()
  }
  watcher.watches.clear()
}

/**
 * Keep the open lives watched
 * @return {void}
 */

export const startLiveWatcher = (): void => {
  if (watcher.timer || !isTwitchConfigured()) return
  // A build never holds platform sessions
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const tick = async () => {
    if (!(await holdsWatchLease())) return releaseWatches()

    await syncLiveWatches()
    // Silent tabs closed at their last beat
    await sweepStalePresences().catch(() => null)
  }
  const run = () =>
    void tick().catch((error: unknown) =>
      logger.warn('[watcher] sync failed', error instanceof Error ? error.message : '')
    )

  run()
  watcher.timer = setInterval(run, LIVE_SETTINGS.watchSyncSeconds * 1000)
  logger.info('[watcher] watching open Twitch lives')
}

/**
 * Stop every session
 * @return {void}
 */

export const stopLiveWatcher = (): void => {
  if (watcher.timer) clearInterval(watcher.timer)
  watcher.timer = null
  releaseWatches()
}
