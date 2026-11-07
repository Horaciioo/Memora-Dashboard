import { seatBoundsOf } from '@/core/lib/play/seats'
import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { PLAY_OPEN_STATUSES } from '@/utils/constants/play'

/**
 * Replay of a finished game as a player reads it
 * @param {NonNullable<LoadedSession['rematch']>} rematch - New table
 * @param {string} viewerId - Reader
 * @return {object} - Replay with who answered
 */

const toRematchView = (rematch: NonNullable<LoadedSession['rematch']>, viewerId: string) => {
  const seated = new Set(rematch.seats.filter(isPresent).map((seat) => seat.accountId))
  const answers = rematch.invites.map((invite) => ({
    accountId: invite.inviteeId ?? '',
    state: (seated.has(invite.inviteeId ?? '')
      ? 'accepted'
      : invite.answeredAt
        ? 'declined'
        : 'pending') as 'accepted' | 'declined' | 'pending',
  }))

  return {
    id: rematch.id,
    isOpen: PLAY_OPEN_STATUSES.includes(rematch.status),
    hostId: rematch.hostId,
    answers,
    // Invitation the reader still has to answer
    myInviteId:
      rematch.invites.find(
        (invite) => invite.inviteeId === viewerId && !invite.answeredAt && !seated.has(viewerId)
      )?.id ?? null,
  }
}

/**
 * Game as its players read it
 * @param {LoadedSession} session - Game
 * @param {string} viewerId - Reader
 * @param {unknown} board - Engine view
 * @return {object} - View
 */

export const toSessionView = (session: LoadedSession, viewerId: string, board: unknown) => {
  const bounds = seatBoundsOf(session.game, session.settings)
  const seat = session.seats.find((entry) => entry.accountId === viewerId)

  return {
    id: session.id,
    game: session.game,
    status: session.status,
    hostId: session.hostId,
    settings: session.settings,
    visibility: session.visibility,
    // Only the table shares the code
    joinCode: seat && isPresent(seat) ? session.joinCode : null,
    // Clock of the vote
    serverTime: Date.now(),
    maxPlayers: bounds.max,
    minPlayers: bounds.min,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    rematch: session.rematch && toRematchView(session.rematch, viewerId),
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
        botKind: entry.account.botKind,
        // Bots and the host never wait
        isReady:
          Boolean(entry.readyAt) ||
          Boolean(entry.account.botKind) ||
          entry.accountId === session.hostId,
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
    // Faces of the seated players, host first
    faces: session.seats.filter(isPresent).map(({ account }) => ({
      id: account.id,
      name: account.displayName,
      avatarUrl: account.avatarUrl,
      isBot: Boolean(account.botKind),
    })),
    status: session.status,
    maxPlayers: seatBoundsOf(session.game, session.settings).max,
    gamesCount: session.tournament?.gamesCount ?? null,
    createdAt: session.createdAt,
  }
}
