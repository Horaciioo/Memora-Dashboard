import 'server-only'

import { prisma } from '@/core/lib/db'
import { publishLive } from '@/core/lib/lives/bus'
import { forgetLive, keepConnection, keepRecentEvent } from '@/core/lib/lives/recent'
import type { LiveConnection } from '@/core/lib/lives/recent'
import { logger } from '@/core/lib/logger'
import { EventSubSession } from '@/core/lib/platforms/twitch/session'
import type { TwitchSignal } from '@/core/lib/platforms/twitch/eventsub'
import { moveLiveFromPlatform } from '@/core/services/lives/LiveService'
import { liveconLevelOf, logPlatformGesture } from '@/core/services/lives/ModerationLogService'
import { logEntryOf } from '@/core/lib/platforms/twitch/logEntry'
import { sweepStalePresences } from '@/core/services/lives/PresenceService'
import { readTwitchSeat } from '@/core/services/platforms/PlatformAccountService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_STREAM_EVENTS, LIVE_TOPICS } from '@/declarations/lives/topics'
import { PLATFORM_NOTICE_COPY } from '@/declarations/platforms/copy'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import { LivePlatforms, LiveStatuses, OPEN_LIVE_STATUSES } from '@/utils/constants/lives'

/**
 * One live being watched
 * @typedef {Object} Watch
 * @property {EventSubSession} session - Platform session
 * @property {string} holderId - Member whose token carries it
 * @property {ReturnType<typeof setTimeout> | null} offline - Pending end after an offline
 */

interface Watch {
  session: EventSubSession
  holderId: string
  offline: ReturnType<typeof setTimeout> | null
}

// Survives dev hot reloads, one watcher per process
const globalForWatcher = globalThis as unknown as {
  liveWatcher?: { watches: Map<string, Watch>; timer: ReturnType<typeof setInterval> | null }
}

const watcher = (globalForWatcher.liveWatcher ??= { watches: new Map(), timer: null })

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
      await keepRecentEvent(liveId, signal.event)
      await publishLive(LIVE_TOPICS.live(liveId), {
        type: LIVE_STREAM_EVENTS.scene,
        event: signal.event,
      })
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
      watch.offline = setTimeout(
        () => {
          watch.offline = null
          void moveLiveFromPlatform(liveId, LiveStatuses.Ended)
        },
        LIVE_SETTINGS.endGraceMinutes * 60 * 1000
      )
      return
  }
}

/**
 * Start watching one live with the first member able to carry it
 * @param {Object} live - Live coordinates
 * @return {Promise<void>} - Watching, or the reason told
 */

const watch = async (live: {
  id: string
  youtuberId: string
  coordinatorId: string | null
  announcedById: string | null
  members: { accountId: string }[]
  youtuber: { channels: { externalId: string }[] }
}): Promise<void> => {
  const broadcasterId = live.youtuber.channels[0]?.externalId
  if (!broadcasterId) {
    await announceConnection(live.id, {
      state: 'disconnected',
      notice: PLATFORM_NOTICE_COPY.noChannel,
    })
    return
  }

  // The coordinator first, then the announcer, then the team
  const candidates = [
    ...new Set(
      [
        live.coordinatorId,
        live.announcedById,
        ...live.members.map((seat) => seat.accountId),
      ].filter((id): id is string => Boolean(id))
    ),
  ]
  let holderId: string | null = null
  for (const candidate of candidates) {
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

      void liveconLevelOf(live.youtuberId)
        .then((liveconLevel) =>
          logPlatformGesture({
            liveId: live.id,
            platform: LivePlatforms.Twitch,
            entry,
            liveconLevel,
          })
        )
        .catch(() => null)
    },
    onState: (state) => {
      void announceConnection(live.id, {
        state,
        notice: state === 'disconnected' ? PLATFORM_NOTICE_COPY.reconnecting : null,
      })
    },
  })

  watcher.watches.set(live.id, { session, holderId: holder, offline: null })
  session.start()
}

/**
 * Line the sessions up with the open Twitch lives
 * @return {Promise<void>} - Synced
 */

export const syncLiveWatches = async (): Promise<void> => {
  const lives = await prisma.live.findMany({
    where: {
      platform: LivePlatforms.Twitch,
      status: { in: [...OPEN_LIVE_STATUSES] },
      plannedStartAt: { lte: new Date(Date.now() + LIVE_SETTINGS.watchLeadMinutes * 60 * 1000) },
    },
    select: {
      id: true,
      youtuberId: true,
      coordinatorId: true,
      announcedById: true,
      members: { select: { accountId: true } },
      youtuber: {
        select: {
          channels: { where: { platform: LivePlatforms.Twitch }, select: { externalId: true } },
        },
      },
    },
    take: LIVE_SETTINGS.maxOpenLives,
  })
  const open = new Set(lives.map((live) => live.id))

  // Closed lives let go of their session
  for (const [liveId, current] of watcher.watches) {
    if (open.has(liveId)) continue
    current.session.stop()
    if (current.offline) clearTimeout(current.offline)
    watcher.watches.delete(liveId)
    await forgetLive(liveId)
  }

  for (const live of lives) {
    if (!watcher.watches.has(live.id)) await watch(live)
  }
}

/**
 * Keep the open lives watched, every few seconds
 * @return {void}
 */

export const startLiveWatcher = (): void => {
  if (watcher.timer || !isTwitchConfigured()) return
  // A build never holds platform sessions
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const tick = () => {
    void syncLiveWatches().catch((error: unknown) =>
      logger.warn('[watcher] sync failed', error instanceof Error ? error.message : '')
    )
    // Silent tabs closed at their last beat
    void sweepStalePresences().catch(() => null)
  }

  tick()
  watcher.timer = setInterval(tick, LIVE_SETTINGS.watchSyncSeconds * 1000)
  logger.info('[watcher] watching open Twitch lives')
}

/**
 * Stop every session
 * @return {void}
 */

export const stopLiveWatcher = (): void => {
  if (watcher.timer) clearInterval(watcher.timer)
  watcher.timer = null
  for (const current of watcher.watches.values()) current.session.stop()
  watcher.watches.clear()
}
