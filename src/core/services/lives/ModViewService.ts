import 'server-only'

import { conflict, forbidden, notFound, rateLimited, systemFailure } from '@/core/lib/errors'
import type { AppError } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { claimGestureKey } from '@/core/lib/lives/idempotency'
import { isFollowing } from '@/core/services/lives/FocusService'
import { readConnection, readRecentEvents } from '@/core/lib/lives/recent'
import { logger } from '@/core/lib/logger'
import { gateIntent } from '@/core/lib/modview/gate'
import { applySceneEvent } from '@/core/lib/modview/scene'
import { PlatformError } from '@/core/lib/platforms/http'
import {
  moderatesChannel,
  performOnTwitch,
  readBlockedTerms,
  readChatModes,
  readCommunity,
  readStream,
  readUnbanRequests,
} from '@/core/lib/platforms/twitch/helix'
import type { TwitchSeat } from '@/core/lib/platforms/twitch/helix'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { readLive } from '@/core/services/lives/LiveService'
import { logMemoraGesture, settleGesture } from '@/core/services/lives/ModerationLogService'
import { markTwitchRevoked, readTwitchSeat } from '@/core/services/platforms/PlatformAccountService'
import { recordEvent } from '@/core/services/system/ActivityService'
import { PLATFORM_ERROR_COPY, PLATFORM_NOTICE_COPY } from '@/declarations/platforms/copy'
import type { LiveView } from '@/types/lives'
import type { ActContext, ModViewIntent, ModViewState } from '@/types/modview'
import { LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * What a Mod View opens on
 * @typedef {Object} ModViewSnapshot
 * @property {ModViewState} state - State to draw
 * @property {string | null} channelLogin - Twitch login, for the player
 */

export interface ModViewSnapshot {
  state: ModViewState
  channelLogin: string | null
}

/**
 * Empty Mod View of a live
 * @param {LiveView} live - Live
 * @return {ModViewState} - State
 */

const baseState = (live: LiveView): ModViewState => ({
  platform: live.platform,
  connection: 'disconnected',
  channel: {
    name: live.youtuber.name,
    avatar: live.youtuber.avatar,
    category: null,
    categoryArt: null,
  },
  title: live.title,
  embedUrl: null,
  messages: [],
  acts: [],
  held: [],
  unbanRequests: [],
  blockedTerms: [],
  allowedTerms: [],
  modes: { shield: false, subscribers: false, followers: false, emotes: false, slowSeconds: null },
  community: { broadcaster: [], moderators: [], vips: [], bots: [], viewers: [] },
  liveconLevel: live.liveconLevel?.level ?? null,
  notice: null,
  readOnly: false,
})

/**
 * Twitch channel of a creator
 * @param {string} youtuberId - Creator
 * @return {Promise<{ externalId: string, login: string | null } | null>} - Channel
 */

const channelOf = (youtuberId: string) =>
  prisma.youtuberChannel.findUnique({
    where: { youtuberId_platform: { youtuberId, platform: LivePlatforms.Twitch } },
    select: { externalId: true, login: true },
  })

/**
 * The viewer's seat on the live's channel, or the notice saying why not
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
 * Open the Mod View of a live: what Twitch says now, the recent feed replayed over it
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
  let state = baseState(live)

  // Only Twitch is wired, YouTube comes with its own connector
  if (live.platform !== LivePlatforms.Twitch) return { state, channelLogin: null }

  const found = await seatOf(viewerId, live.youtuber.id)
  if ('notice' in found)
    return { state: { ...state, notice: found.notice, readOnly: true }, channelLogin: null }

  const { seat, login } = found
  try {
    const moderates = await moderatesChannel(seat)
    if (!moderates) {
      state = { ...state, notice: PLATFORM_NOTICE_COPY.notModerator, readOnly: true }
    } else {
      // What Twitch says right now
      const [modes, terms, requests, community, stream] = await Promise.all([
        readChatModes(seat),
        readBlockedTerms(seat),
        readUnbanRequests(seat).catch(() => []),
        readCommunity(seat).catch(() => null),
        readStream(seat),
      ])
      state = {
        ...state,
        modes,
        blockedTerms: terms.map((term) => term.text),
        unbanRequests: requests,
        community: community ? { ...state.community, ...community } : state.community,
        title: stream?.title ?? state.title,
        channel: { ...state.channel, category: stream?.category ?? null },
      }
    }
  } catch (error) {
    const refusal = await translateRefusal(error, viewerId)
    return { state: { ...state, notice: refusal.message, readOnly: true }, channelLogin: login }
  }

  // The feed kept since the session opened, replayed in order
  const recent = await readRecentEvents(liveId)
  state = recent.reduce(
    (played, event) => applySceneEvent({ view: played, spotlight: null }, event).view,
    state
  )

  const connection = await readConnection(liveId)
  const waiting = live.status === LiveStatuses.Announced ? PLATFORM_NOTICE_COPY.waiting : null

  return {
    state: {
      ...state,
      connection: connection?.state ?? 'disconnected',
      notice: state.notice ?? connection?.notice ?? waiting,
    },
    channelLogin: login,
  }
}

/**
 * Carry one gesture out on the platform, checked again on the server
 * @param {Object} input - Gesture
 * @param {string} input.liveId - Live
 * @param {ModViewIntent} input.intent - Gesture
 * @param {ActContext} input.context - Panel rung, Focus target
 * @param {string} input.key - Idempotency key from the browser
 * @param {AccessScope} input.scope - Viewer's perimeter
 * @param {string} input.viewerId - Member who clicked
 * @param {PermissionName[]} input.held - Permissions held
 * @return {Promise<{ done: boolean }>} - Done, false for a repeated click
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

  // The same rule as the greyed buttons, never trusted from the browser
  const gate = gateIntent(input.intent, {
    permissions: live.permissions,
    platform: live.platform,
    liveconLevel: live.liveconLevel?.level ?? null,
  })
  if (!gate.allowed) throw forbidden(gate.reason ?? undefined)
  if (live.platform !== LivePlatforms.Twitch) throw forbidden(PLATFORM_ERROR_COPY.unsupported)

  const found = await seatOf(input.viewerId, live.youtuber.id)
  if ('notice' in found) throw forbidden(found.notice)

  // Acting in someone's place needs a Focus open on them
  const onBehalfOfId = input.context.onBehalfOfId
  if (onBehalfOfId && !(await isFollowing(input.liveId, input.viewerId, onBehalfOfId))) {
    throw forbidden()
  }

  // A double click lands once
  if (!(await claimGestureKey(`${input.liveId}:${input.viewerId}:${input.key}`)))
    return { done: false }

  // Written before the call, so a failure is logged too
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

  // The audit line points at the log line, the business and the trace meet there
  await recordEvent({
    eventType: 'ModerationActed',
    actorId: input.viewerId,
    targetType: 'live',
    targetId: input.liveId,
    summary: logId ? `${input.intent.kind} · ${logId}` : input.intent.kind,
  })

  return { done: true }
}
