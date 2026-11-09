import 'server-only'

import { pushRoomEvent } from '@/core/lib/lives/room'
import { toLivePoll } from '@/core/lib/modview/poll'
import { readLatestPoll } from '@/core/lib/platforms/twitch/helix'
import type { TwitchSeat } from '@/core/lib/platforms/twitch/helix'
import { readChannelOwnerSeat } from '@/core/services/platforms/PlatformAccountService'
import { POLL_REFRESH_SECONDS } from '@/declarations/modview/polls'
import type { LivePoll } from '@/types/modview'
import { SECOND_MS } from '@/utils/constants/time'

// Running follows, per live
const follows = new Map<string, ReturnType<typeof setInterval>>()
// Last poll told, per live
const told = new Map<string, string>()
// Members who launched a poll
const authors = new Map<string, string>()

/**
 * Tell a live's room where its poll stands
 * @param {string} liveId - Live
 * @param {TwitchSeat} seat - Channel owner's seat
 * @return {Promise<LivePoll | null>} - Poll shown
 */

const tellPoll = async (liveId: string, seat: TwitchSeat): Promise<LivePoll | null> => {
  const row = await readLatestPoll(seat)
  const poll = row ? toLivePoll(row, authors.get(row.id) ?? null, Date.now()) : null
  const key = JSON.stringify(poll)
  if (told.get(liveId) !== key) {
    told.set(liveId, key)
    pushRoomEvent(liveId, { kind: 'poll', poll })
  }

  return poll
}

/**
 * Stop following a live's poll
 * @param {string} liveId - Live
 * @return {void}
 */

export const stopLivePoll = (liveId: string): void => {
  const timer = follows.get(liveId)
  if (timer) clearInterval(timer)
  follows.delete(liveId)
}

/**
 * Forget a closed live's poll
 * @param {string} liveId - Live
 * @return {void}
 */

export const forgetLivePoll = (liveId: string): void => {
  stopLivePoll(liveId)
  told.delete(liveId)
}

/**
 * Read votes closely until the results are gone
 * @param {string} liveId - Live
 * @param {string} broadcasterId - Channel
 * @return {void}
 */

const followPoll = (liveId: string, broadcasterId: string): void => {
  if (follows.has(liveId)) return

  const timer = setInterval(() => {
    void syncLivePoll(liveId, broadcasterId, true).catch(() => null)
  }, POLL_REFRESH_SECONDS * SECOND_MS)
  follows.set(liveId, timer)
}

/**
 * Read a live's poll once and follow it while it shows
 * @param {string} liveId - Live
 * @param {string} broadcasterId - Channel
 * @param {boolean} [isFollowing] - Called by the follow itself
 * @return {Promise<void>} - Read
 */

export const syncLivePoll = async (
  liveId: string,
  broadcasterId: string,
  isFollowing = false
): Promise<void> => {
  const owner = await readChannelOwnerSeat(broadcasterId)
  if (!owner) {
    if (isFollowing) stopLivePoll(liveId)
    return
  }

  const poll = await tellPoll(liveId, owner.seat)
  if (poll) followPoll(liveId, broadcasterId)
  else stopLivePoll(liveId)
}

/**
 * Note who launched the poll just created
 * @param {string} liveId - Live
 * @param {TwitchSeat} seat - Channel owner's seat
 * @param {string} author - Who launched it
 * @return {Promise<void>} - Told
 */

export const announceLivePoll = async (
  liveId: string,
  seat: TwitchSeat,
  author: string
): Promise<void> => {
  const row = await readLatestPoll(seat)
  if (row) authors.set(row.id, author)
  await tellPoll(liveId, seat)
  followPoll(liveId, seat.broadcasterId)
}
