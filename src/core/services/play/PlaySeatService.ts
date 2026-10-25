import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden } from '@/core/lib/errors'
import { pickSeatColor, readBodyText } from '@/core/lib/play'
import { isPresent } from '@/core/lib/play/session'
import { signalPlay } from '@/core/lib/play/signal'
import { watchersOf } from '@/core/lib/play/watchers'
import {
  ensureFree,
  lockSession,
  requireHost,
  requireSeat,
} from '@/core/services/play/PlaySessionService'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
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
      await ensureFree(tx, accountId, sessionId)
      await tx.playSeat.update({
        where: { sessionId_accountId: { sessionId, accountId } },
        data: { leftAt: null, color: pickSeatColor(present.map((entry) => entry.color)) },
      })
    }
    await tx.playSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
  })
  await signalPlay(sessionId, true)
}

/**
 * People watching a game without a seat
 * @param {string} sessionId - Game
 * @param {string[]} seated - Players at the table
 * @return {Promise<PlayCandidate[]>} - Spectators
 */

export const listSpectators = async (
  sessionId: string,
  seated: string[]
): Promise<PlayCandidate[]> => {
  const ids = watchersOf(sessionId).filter((id) => !seated.includes(id))
  if (!ids.length) return []

  return prisma.account.findMany({
    where: { id: { in: ids } },
    orderBy: { displayName: 'asc' },
    select: { id: true, displayName: true, avatarUrl: true },
  })
}
