import 'server-only'

import { randomUUID } from 'node:crypto'

import { publishLive } from '@/core/lib/lives/bus'
import { standingsOf } from '@/core/lib/play/concordat'
import { signalPlay } from '@/core/lib/play/signal'
import { toBase64 } from '@/core/lib/realtime/codec'
import { loopOf } from '@/core/services/play/concordat/ConcordatLoop'
import type { ConcordatHost } from '@/core/services/play/concordat/ConcordatLoop'
import {
  claimGame,
  isSessionRunning,
  saveEventRows,
  saveResultRows,
  saveSnapshotRow,
} from '@/core/services/play/concordat/ConcordatStore'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'
import type { ConcordatState } from '@/types/concordat'

// One identity per process, kept over hot reloads
const globalForOwner = globalThis as unknown as { concordatOwner?: string }

/**
 * Identity of this process as a game owner
 * @type {string}
 */

export const PROCESS_OWNER = (globalForOwner.concordatOwner ??= randomUUID())

// Nation figures kept in the table
const nationsOf = (sessionId: string, state: ConcordatState) =>
  state.players
    .filter((player) => player.accountId)
    .map((player) => ({
      nation: player.id,
      tiles: player.tiles,
      peak: Math.max(player.tiles, loopOf(sessionId)?.peak[player.id] ?? 0),
      provinces: player.provincesHeld,
    }))

/**
 * Outside world of one game, backed by the database and the bus
 * @param {string} sessionId - Game
 * @param {() => ConcordatState} stateOf - Live state
 * @return {ConcordatHost} - Host
 */

export const databaseHost = (sessionId: string, stateOf: () => ConcordatState): ConcordatHost => ({
  claim: () => claimGame(sessionId, PROCESS_OWNER),
  isOpen: () => isSessionRunning(sessionId),
  saveSnapshot: (snapshot, rev) =>
    saveSnapshotRow({
      sessionId,
      ownerId: PROCESS_OWNER,
      snapshot,
      rev,
      nations: nationsOf(sessionId, stateOf()),
    }),
  saveEvents: (events) => saveEventRows(sessionId, events),
  publishDiff: (bytes) =>
    publishLive(PLAY_TOPICS.session(sessionId), {
      type: PLAY_STREAM_EVENTS.diff,
      sessionId,
      d: toBase64(bytes),
    }),
  signalOffers: () => signalPlay(sessionId, false, true),
  connectedAccounts: async () => {
    // Loaded late, the room service reaches the engines that reach this file
    const { connectedAccountIds } = await import('@/core/services/play/live/PlayRoomService')

    return connectedAccountIds(sessionId)
  },
  finish: async (state) => {
    // Ranks written, then the Play side pays and closes
    const results = standingsOf(state).map((standing) => ({
      accountId: state.players[standing.playerId - 1].accountId ?? '',
      rank: standing.rank,
      score: standing.score,
    }))
    await saveResultRows(
      sessionId,
      results.filter((result) => result.accountId)
    )
    const { settleSession } = await import('@/core/services/play/GameService')
    await settleSession(sessionId)
  },
})
