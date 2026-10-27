import { PLAY_GAMES } from '@/declarations/play'
import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { PLAY_OPEN_STATUSES } from '@/utils/constants/play'

/**
 * Game as its players read it
 * @param {LoadedSession} session - Game
 * @param {string} viewerId - Reader
 * @param {unknown} board - Engine view
 * @return {object} - View
 */

export const toSessionView = (session: LoadedSession, viewerId: string, board: unknown) => {
  const meta = PLAY_GAMES.get(session.game)
  const seat = session.seats.find((entry) => entry.accountId === viewerId)

  return {
    id: session.id,
    game: session.game,
    status: session.status,
    hostId: session.hostId,
    settings: session.settings,
    // Clock of the vote
    serverTime: Date.now(),
    maxPlayers: meta.maxPlayers,
    minPlayers: meta.minPlayers,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    rematch: session.rematch && {
      id: session.rematch.id,
      isOpen: PLAY_OPEN_STATUSES.includes(session.rematch.status),
    },
    tournament: session.tournament && {
      id: session.tournament.id,
      index: session.tournamentIndex ?? 0,
      gamesCount: session.tournament.gamesCount,
    },
    // Kicked players vanish, leavers stay greyed
    seats: session.seats
      .filter((entry) => !entry.kickedAt)
      .map((entry) => ({
        accountId: entry.accountId,
        name: entry.account.displayName,
        avatarUrl: entry.account.avatarUrl,
        color: entry.color,
        score: entry.score,
        rank: entry.rank,
        outcome: entry.outcome,
        xp: entry.xp,
        isHost: entry.accountId === session.hostId,
        hasLeft: Boolean(entry.leftAt),
      })),
    me: {
      isSeated: Boolean(seat && isPresent(seat)),
      // Readers without a seat only watch
      isSpectator: !seat || !isPresent(seat),
      isHost: session.hostId === viewerId,
      isKicked: Boolean(seat?.kickedAt),
    },
    board,
  }
}

/**
 * Lobby card of a game
 * @param {LoadedSession} session - Game
 * @return {object} - Card
 */

export const toLobbyCard = (session: LoadedSession) => {
  const host = session.seats.find((seat) => seat.accountId === session.hostId)

  return {
    id: session.id,
    game: session.game,
    hostName: host?.account.displayName ?? null,
    hostAvatarUrl: host?.account.avatarUrl ?? null,
    players: session.seats.filter(isPresent).length,
    maxPlayers: PLAY_GAMES.get(session.game).maxPlayers,
    gamesCount: session.tournament?.gamesCount ?? null,
    createdAt: session.createdAt,
  }
}
