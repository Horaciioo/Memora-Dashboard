import 'server-only'

import { conflict, forbidden, notFound, rateLimited, systemFailure } from '@/core/lib/errors'
import type { AppError } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { claimGestureKey } from '@/core/lib/lives/idempotency'
import { isFollowing } from '@/core/services/lives/FocusService'
import { readConnection } from '@/core/lib/lives/recent'
import { readRoomMemory } from '@/core/lib/lives/room'
import { logger } from '@/core/lib/logger'
import { gateIntent } from '@/core/lib/modview/gate'
import { blankModView } from '@/core/lib/modview/feed'
import { PlatformError } from '@/core/lib/platforms/http'
import {
  moderatesChannel,
  performOnTwitch,
  readBlockedTerms,
  readChatModes,
  readBanDetail,
  readCategoryArt,
  readChannelTags,
  readCommunity,
  readEmotes,
  readOwnedEmoteIds,
  readPin,
  readStream,
  readUnbanRequests,
} from '@/core/lib/platforms/twitch/helix'
import type { TwitchSeat } from '@/core/lib/platforms/twitch/helix'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readLive } from '@/core/services/lives/LiveService'
import { pollLiveState } from '@/core/services/lives/LiveStatePoller'
import { activeSuspension } from '@/core/services/members/admin/SuspensionService'
import { logMemoraGesture, settleGesture } from '@/core/services/lives/ModerationLogService'
import {
  markTwitchRevoked,
  readTwitchRoster,
  readTwitchSeat,
} from '@/core/services/platforms/PlatformAccountService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import { MODVIEW_LOCK_COPY } from '@/declarations/modview/copy'
import { PLATFORM_ERROR_COPY, PLATFORM_NOTICE_COPY } from '@/declarations/platforms/copy'
import { formatDay } from '@/utils/format/dates'
import type { LiveView } from '@/types/lives'
import type {
  ActContext,
  BanDetail,
  LiveEmotes,
  ModViewIntent,
  ModViewState,
} from '@/types/modview'
import { LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * What a Mod View opens on
 * @typedef {Object} ModViewSnapshot
 * @property {ModViewState} state - State to draw
 * @property {string | null} channelLogin - Twitch login
 * @property {number} feedSeq - Last flush included
 */

export interface ModViewSnapshot {
  state: ModViewState
  channelLogin: string | null
  feedSeq: number
}

/**
 * Empty Mod View of a live
 * @param {LiveView} live - Live
 * @return {ModViewState} - State
 */

const baseState = (live: LiveView): ModViewState => ({
  ...blankModView({
    platform: live.platform,
    name: live.youtuber.name,
    avatar: live.youtuber.avatar,
    title: live.title,
    liveconLevel: live.liveconLevel?.level ?? null,
  }),
  connection: 'disconnected',
  notice: null,
  readOnly: false,
})

// Moderators confirmed lately, by seat
const moderatorCache = new Map<string, number>()
const MODERATOR_CACHE_MS = 60_000

/**
 * Twitch channel of a creator
 * @param {string} youtuberId - Creator
 * @return {Promise<{ externalId: string, login: string | null } | 'several' | null>} - Channel, or none
 */

const channelOf = async (youtuberId: string) => {
  const channels = await prisma.youtuberChannel.findMany({
    where: { youtuberId, platform: LivePlatforms.Twitch },
    select: { externalId: true, login: true },
    take: 2,
  })

  // A live names no channel, guessing would moderate the wrong one
  return channels.length > 1 ? 'several' : (channels[0] ?? null)
}

/**
 * The viewer's seat on the live's channel
 * @param {string} viewerId - Member
 * @param {string} youtuberId - Creator
 * @return {Promise<{ seat: TwitchSeat, login: string | null, memberLogin: string } | { notice: string }>} - Seat or notice
 */

const seatOf = async (
  viewerId: string,
  youtuberId: string
): Promise<
  { seat: TwitchSeat; login: string | null; memberLogin: string } | { notice: string }
> => {
  const channel = await channelOf(youtuberId)
  if (!channel) return { notice: PLATFORM_NOTICE_COPY.noChannel }
  if (channel === 'several') return { notice: PLATFORM_NOTICE_COPY.severalChannels }

  const lookup = await readTwitchSeat(viewerId)
  if (!lookup.ok) return { notice: PLATFORM_NOTICE_COPY[lookup.reason] }

  return {
    seat: {
      accessToken: lookup.accessToken,
      moderatorId: lookup.moderatorId,
      broadcasterId: channel.externalId,
    },
    login: channel.login,
    memberLogin: lookup.login,
  }
}

/**
 * Translate a Twitch refusal into what the member reads
 * @param {unknown} error - Failure
 * @param {string} viewerId - Member who acted
 * @return {Promise<AppError>} - Error to answer
 */

const translateRefusal = async (error: unknown, viewerId: string): Promise<AppError> => {
  if (!(error instanceof PlatformError)) throw error

  if (error.status === 401) {
    await markTwitchRevoked(viewerId)
    return forbidden(PLATFORM_ERROR_COPY.unauthorized)
  }
  if (error.detail === 'allowed terms not exposed')
    return forbidden(PLATFORM_ERROR_COPY.unsupported)
  if (error.status === 403) return forbidden(PLATFORM_ERROR_COPY.forbidden)
  if (error.status === 404) return notFound(PLATFORM_ERROR_COPY.notFound)
  if (error.status === 409) return conflict(PLATFORM_ERROR_COPY.conflict)
  if (error.status === 429) return rateLimited(5, PLATFORM_ERROR_COPY.rateLimited)
  if (error.status === 400) return conflict(PLATFORM_ERROR_COPY.invalid)

  logger.warn('[modview] twitch unavailable', error.status)
  return systemFailure(PLATFORM_ERROR_COPY.unavailable)
}

/**
 * Notice shown to a paused member
 * @param {string} endsAt - Last moment of the pause, ISO
 * @return {string} - Sentence
 */

const suspensionNotice = (endsAt: string): string =>
  MEMBER_ADMIN_COPY.suspendedNotice.replace('{date}', formatDay(endsAt))

/**
 * Whether the viewer may enter this live's Mod View: a Twitch moderator of the channel
 * @param {string} viewerId - Member
 * @param {LiveView} live - Live
 * @return {Promise<{ allowed: true } | { allowed: false, notice: string }>} - Verdict
 */

export const channelAccess = async (
  viewerId: string,
  live: LiveView
): Promise<{ allowed: true } | { allowed: false; notice: string }> => {
  // Only Twitch is wired
  if (live.platform !== LivePlatforms.Twitch) return { allowed: true }

  const found = await seatOf(viewerId, live.youtuber.id)
  if ('notice' in found) return { allowed: false, notice: found.notice }

  const key = `${found.seat.moderatorId}:${found.seat.broadcasterId}`
  if ((moderatorCache.get(key) ?? 0) > Date.now()) return { allowed: true }

  try {
    if (!(await moderatesChannel(found.seat)))
      return { allowed: false, notice: PLATFORM_NOTICE_COPY.notModeratorDenied }
  } catch (error) {
    return { allowed: false, notice: (await translateRefusal(error, viewerId)).message }
  }
  moderatorCache.set(key, Date.now() + MODERATOR_CACHE_MS)

  return { allowed: true }
}

/**
 * Same verdict as a refusal
 * @param {string} viewerId - Member
 * @param {LiveView} live - Live
 * @return {Promise<void>}
 */

export const requireChannelModerator = async (viewerId: string, live: LiveView): Promise<void> => {
  const verdict = await channelAccess(viewerId, live)
  if (!verdict.allowed) throw forbidden(verdict.notice)
}

/**
 * Open the Mod View of a live: what Twitch says now
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer's perimeter
 * @param {string} viewerId - Member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<ModViewSnapshot>} - Snapshot
 */

export const openModView = async (
  liveId: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<ModViewSnapshot> => {
  const live = await readLive(liveId, scope, viewerId, held)
  if (live.access !== 'open') throw conflict()
  await requireChannelModerator(viewerId, live)
  let state: ModViewState = { ...baseState(live), roster: await readTwitchRoster() }

  // The player needs no seat, only the channel
  const channel = live.platform === LivePlatforms.Twitch ? await channelOf(live.youtuber.id) : null
  const channelLogin = channel && channel !== 'several' ? channel.login : null

  // A paused member only watches
  const paused = await activeSuspension(viewerId)
  if (paused) {
    return {
      state: { ...state, notice: suspensionNotice(paused.endsAt), readOnly: true },
      channelLogin,
      feedSeq: 0,
    }
  }

  // Only Twitch is wired
  if (live.platform !== LivePlatforms.Twitch) return { state, channelLogin, feedSeq: 0 }

  const found = await seatOf(viewerId, live.youtuber.id)
  if ('notice' in found)
    return {
      state: { ...state, notice: found.notice, readOnly: true },
      channelLogin,
      feedSeq: 0,
    }

  const { seat } = found
  try {
    const moderates = await moderatesChannel(seat)
    if (!moderates) {
      state = { ...state, notice: PLATFORM_NOTICE_COPY.notModerator, readOnly: true }
    } else {
      // What Twitch says right now
      const [modes, terms, requests, community, stream, pinned, tags] = await Promise.all([
        readChatModes(seat),
        readBlockedTerms(seat),
        readUnbanRequests(seat).catch(() => []),
        readCommunity(seat).catch(() => null),
        readStream(seat),
        readPin(seat).catch(() => null),
        readChannelTags(seat).catch(() => []),
      ])
      state = {
        ...state,
        modes,
        blockedTerms: terms.map((term) => term.text),
        unbanRequests: requests,
        community: community ? { ...state.community, ...community } : state.community,
        title: stream?.title ?? state.title,
        viewers: stream?.viewers ?? null,
        pinned,
        channel: {
          ...state.channel,
          category: stream?.category ?? null,
          tags,
          categoryArt: stream?.categoryId
            ? await readCategoryArt(seat, stream.categoryId).catch(() => null)
            : null,
        },
      }
    }
  } catch (error) {
    const refusal = await translateRefusal(error, viewerId)
    return {
      state: { ...state, notice: refusal.message, readOnly: true },
      channelLogin,
      feedSeq: 0,
    }
  }

  // Chat kept by the live's room
  const room = await readRoomMemory(liveId)
  if (room) {
    state = {
      ...state,
      messages: room.messages,
      acts: room.acts,
      held: room.held,
      pinned: room.pinned === undefined ? state.pinned : room.pinned,
      viewers: room.viewers === undefined ? state.viewers : room.viewers,
    }
  }

  const connection = await readConnection(liveId)
  const waiting = live.status === LiveStatuses.Announced ? PLATFORM_NOTICE_COPY.waiting : null

  return {
    state: {
      ...state,
      connection: connection?.state ?? 'disconnected',
      notice: state.notice ?? connection?.notice ?? waiting,
    },
    channelLogin,
    feedSeq: room?.seq ?? 0,
  }
}

/**
 * Carry one gesture out on the platform
 * @param {Object} input - Gesture
 * @param {string} input.liveId - Live
 * @param {ModViewIntent} input.intent - Gesture
 * @param {ActContext} input.context - Panel rung
 * @param {string} input.key - Idempotency key from the browser
 * @param {AccessScope} input.scope - Viewer's perimeter
 * @param {string} input.viewerId - Member who clicked
 * @param {PermissionName[]} input.held - Permissions held
 * @return {Promise<{ done: boolean }>} - Done
 */

export const actOnLive = async (input: {
  liveId: string
  intent: ModViewIntent
  context: ActContext
  key: string
  scope: AccessScope
  viewerId: string
  held: PermissionName[]
}): Promise<{ done: boolean }> => {
  const live = await readLive(input.liveId, input.scope, input.viewerId, input.held)
  if (live.access !== 'open') throw conflict()
  await requireChannelModerator(input.viewerId, live)

  const paused = await activeSuspension(input.viewerId)
  if (paused) throw forbidden(suspensionNotice(paused.endsAt))

  // The same rule as the greyed buttons
  const gate = gateIntent(input.intent, {
    permissions: live.permissions,
    platform: live.platform,
    liveconLevel: live.liveconLevel?.level ?? null,
  })
  if (!gate.allowed) throw forbidden(gate.reason ?? undefined)
  if (live.platform !== LivePlatforms.Twitch) throw forbidden(PLATFORM_ERROR_COPY.unsupported)

  const found = await seatOf(input.viewerId, live.youtuber.id)
  if ('notice' in found) throw forbidden(found.notice)

  // Never on oneself nor on the channel
  const target = 'chatterId' in input.intent ? input.intent.chatterId : null
  if (target && [found.seat.moderatorId, found.seat.broadcasterId].includes(target)) {
    throw forbidden(MODVIEW_LOCK_COPY.self)
  }

  // Acting in someone's place needs a Focus open on them
  const onBehalfOfId = input.context.onBehalfOfId
  if (onBehalfOfId && !(await isFollowing(input.liveId, input.viewerId, onBehalfOfId))) {
    throw forbidden()
  }

  // A double click lands once
  if (!(await claimGestureKey(`${input.liveId}:${input.viewerId}:${input.key}`)))
    return { done: false }

  // Written before the call
  const logId = await logMemoraGesture({
    liveId: input.liveId,
    platform: live.platform,
    actorAccountId: input.viewerId,
    actorPlatformUserId: found.seat.moderatorId,
    actorLogin: found.memberLogin,
    intent: input.intent,
    idempotencyKey: `${input.viewerId}:${input.key}`,
    liveconLevel: live.liveconLevel?.level ?? null,
    offenseId: input.context.offenseId ?? null,
    rung: input.context.rung ?? null,
    onBehalfOfId: onBehalfOfId ?? null,
    targetLogin: input.context.targetLogin ?? null,
  })

  try {
    await performOnTwitch(input.intent, found.seat)
  } catch (error) {
    await settleGesture(
      logId,
      false,
      error instanceof PlatformError ? String(error.status) : 'error'
    )
    throw await translateRefusal(error, input.viewerId)
  }
  await settleGesture(logId, true)

  // The pin shows at once
  if (input.intent.kind === 'pin' || input.intent.kind === 'unpin') {
    void pollLiveState({
      liveId: input.liveId,
      holderId: input.viewerId,
      broadcasterId: found.seat.broadcasterId,
    }).catch(() => null)
  }

  // The audit line points at the log line
  await recordEvent({
    eventType: 'ModerationActed',
    actorId: input.viewerId,
    targetType: 'live',
    targetId: input.liveId,
    summary: logId ? `${input.intent.kind}, ${logId}` : input.intent.kind,
  })

  return { done: true }
}

// Emotes kept per channel, they hardly ever change
const emoteCache = new Map<
  string,
  { until: number; emotes: Awaited<ReturnType<typeof readEmotes>> }
>()
// What a member may use, kept per member and channel
const ownedCache = new Map<string, { until: number; owned: Set<string> | null }>()
const EMOTE_CACHE_MS = 600_000
const OWNED_CACHE_MS = 300_000

/**
 * Emotes the chat box offers on a live, the ones the member cannot use marked locked
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer's perimeter
 * @param {string} viewerId - Member
 * @param {PermissionName[]} held - Permissions held
 * @return {Promise<LiveEmotes>} - Emotes of Twitch and of the channel
 */

export const readLiveEmotes = async (
  liveId: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[]
): Promise<LiveEmotes> => {
  const live = await readLive(liveId, scope, viewerId, held)
  if (live.access !== 'open') throw conflict()
  if (live.platform !== LivePlatforms.Twitch) {
    return { global: [], channel: [], isVerified: false }
  }
  await requireChannelModerator(viewerId, live)

  const found = await seatOf(viewerId, live.youtuber.id)
  if ('notice' in found) throw forbidden(found.notice)
  const { seat } = found

  try {
    let base = emoteCache.get(seat.broadcasterId)
    if (!base || base.until <= Date.now()) {
      base = { until: Date.now() + EMOTE_CACHE_MS, emotes: await readEmotes(seat) }
      emoteCache.set(seat.broadcasterId, base)
    }

    const ownedKey = `${seat.moderatorId}:${seat.broadcasterId}`
    let owned = ownedCache.get(ownedKey)
    if (!owned || owned.until <= Date.now()) {
      owned = { until: Date.now() + OWNED_CACHE_MS, owned: await readOwnedEmoteIds(seat) }
      ownedCache.set(ownedKey, owned)
    }

    // Without the right to read them, nothing is locked and the panel says so
    const ids = owned.owned
    return {
      global: base.emotes.global,
      channel: base.emotes.channel.map((emote) => ({
        ...emote,
        isLocked: ids !== null && !ids.has(emote.id),
      })),
      isVerified: ids !== null,
    }
  } catch (error) {
    throw await translateRefusal(error, viewerId)
  }
}

/**
 * Account and ban of a viewer who asked to be unbanned
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Viewer's perimeter
 * @param {string} viewerId - Member
 * @param {PermissionName[]} held - Permissions held
 * @param {string} chatterId - Viewer asking
 * @return {Promise<BanDetail>} - Detail
 */

export const readLiveBanDetail = async (
  liveId: string,
  scope: AccessScope,
  viewerId: string,
  held: PermissionName[],
  chatterId: string
): Promise<BanDetail> => {
  const live = await readLive(liveId, scope, viewerId, held)
  if (live.access !== 'open') throw conflict()
  await requireChannelModerator(viewerId, live)

  const found = await seatOf(viewerId, live.youtuber.id)
  if ('notice' in found) throw forbidden(found.notice)

  try {
    return await readBanDetail(found.seat, chatterId)
  } catch (error) {
    throw await translateRefusal(error, viewerId)
  }
}
