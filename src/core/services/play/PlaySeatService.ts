import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden } from '@/core/lib/errors'
import { pickSeatColor, readBodyText } from '@/core/lib/play'
import { isPresent } from '@/core/lib/play/session'
import { signalPlay } from '@/core/lib/play/signal'
import { presenceOf } from '@/core/lib/realtime/server/presence'
import { closeOtherTables } from '@/core/services/play/LobbyService'
import {
  ensureAllowed,
  lockSession,
  requireHost,
  requireSeat,
} from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PlayInviteRoles, PlayStatuses } from '@/utils/constants/play'
import type { PlayCandidate } from '@/types/play'

/**
 * Host moves someone between the table and the stands, in the lobby
 * @param {string} sessionId - Game
 * @param {string} hostId - Host
 * @param {Record<string, unknown>} raw - accountId and role
 * @return {Promise<void>} - Moved
 */

export const setSeatRole = async (
  sessionId: string,
  hostId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const accountId = readBodyText(raw, 'accountId', PLAY_ERRORS.notSeated)
  if (accountId === hostId) throw conflict(PLAY_ERRORS.selfKick)

  let seated: string | null = null
  await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    requireHost(session, hostId)
    if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)

    if (raw.role === PlayInviteRoles.Spectator) {
      requireSeat(session, accountId)
      await tx.playSeat.update({
        where: { sessionId_accountId: { sessionId, accountId } },
        data: { leftAt: new Date() },
      })
    } else {
      const seat = session.seats.find((entry) => entry.accountId === accountId)
      if (!seat || seat.kickedAt) throw forbidden(PLAY_ERRORS.notSeated)
      if (isPresent(seat)) return
      const present = session.seats.filter(isPresent)
      if (present.length >= PLAY_GAMES.get(session.game).maxPlayers) {
        throw conflict(PLAY_ERRORS.full)
      }
      await ensureAllowed(tx, accountId)
      await tx.playSeat.update({
        where: { sessionId_accountId: { sessionId, accountId } },
        data: { leftAt: null, color: pickSeatColor(present.map((entry) => entry.color)) },
      })
      seated = session.game
    }
    await tx.playSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
  })
  if (seated) await closeOtherTables(accountId, seated, sessionId)
  await signalPlay(sessionId, true)
}

/**
 * People watching a game without a seat, read from its presence room
 * @param {string} sessionId - Game
 * @param {string[]} seated - Players at the table
 * @return {PlayCandidate[]} - Spectators
 */

export const listSpectators = (sessionId: string, seated: string[]): PlayCandidate[] =>
  presenceOf(PLAY_TOPICS.session(sessionId))
    .filter((member) => member.status !== 'left' && !seated.includes(member.accountId))
    .map(({ accountId, name, image }) => ({ id: accountId, displayName: name, avatarUrl: image }))
    .toSorted((left, right) => left.displayName.localeCompare(right.displayName))
