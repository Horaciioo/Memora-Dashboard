import 'server-only'

import { openSeatOf } from '@/core/lib/play/session'
import type { Prisma, PrismaClient } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { PLAY_ENGINES } from '@/core/engines/play'
import type { PlayEngine } from '@/core/engines/play'
import { isPresent, SESSION_INCLUDE } from '@/core/lib/play/session'
import type { LoadedSeat, LoadedSession } from '@/core/lib/play/session'
import type { PlayGameName } from '@/utils/constants/play'

// Client inside or outside a transaction
type PlayClient = PrismaClient | Prisma.TransactionClient

/**
 * Read a game
 * @param {string} id - Game
 * @param {PlayClient} [client] - Database client
 * @return {Promise<LoadedSession>} - Game
 */

export const loadSession = async (
  id: string,
  client: PlayClient = prisma
): Promise<LoadedSession> => {
  const session = await client.playSession.findUnique({ where: { id }, include: SESSION_INCLUDE })
  if (!session) throw notFound(PLAY_ERRORS.sessionMissing)

  return session
}

/**
 * Read a game, holding it until commit
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string} id - Game
 * @return {Promise<LoadedSession>} - Game
 */

export const lockSession = async (
  tx: Prisma.TransactionClient,
  id: string
): Promise<LoadedSession> => {
  await tx.$queryRaw`SELECT id FROM play_sessions WHERE id = ${id} FOR UPDATE`

  return loadSession(id, tx)
}

/**
 * Engine of a playable game
 * @param {PlayGameName} game - Game
 * @return {PlayEngine} - Engine
 */

export const engineOf = (game: PlayGameName): PlayEngine => {
  const engine = PLAY_GAMES.get(game).playable ? PLAY_ENGINES[game] : undefined
  if (!engine) throw conflict(PLAY_ERRORS.unplayable)

  return engine
}

/**
 * Seat of a present player
 * @param {LoadedSession} session - Game
 * @param {string} accountId - Player
 * @return {LoadedSeat} - Seat
 */

export const requireSeat = (session: LoadedSession, accountId: string): LoadedSeat => {
  const seat = session.seats.find((entry) => entry.accountId === accountId && isPresent(entry))
  if (!seat) throw forbidden(PLAY_ERRORS.notSeated)

  return seat
}

/**
 * Host only gate
 * @param {LoadedSession} session - Game
 * @param {string} accountId - Player
 * @return {void}
 */

export const requireHost = (session: LoadedSession, accountId: string): void => {
  if (session.hostId !== accountId) throw forbidden(PLAY_ERRORS.notHost)
}

/**
 * Open game a player sits in
 * @param {string} accountId - Player
 * @param {PlayClient} [client] - Database client
 * @return {Promise<string | null>} - Game
 */

export const currentSessionId = async (
  accountId: string,
  client: PlayClient = prisma
): Promise<string | null> => {
  const seat = await client.playSeat.findFirst({
    where: openSeatOf(accountId),
    select: { sessionId: true },
  })

  return seat?.sessionId ?? null
}

/**
 * Refuse a second open game
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string} accountId - Player
 * @param {string} [sessionId] - Game being joined
 * @return {Promise<void>} - Throws when busy
 */

export const ensureFree = async (
  tx: Prisma.TransactionClient,
  accountId: string,
  sessionId?: string
): Promise<void> => {
  const current = await currentSessionId(accountId, tx)
  if (current && current !== sessionId) throw conflict(PLAY_ERRORS.alreadyPlaying)
}

/**
 * New lobby with the same table and settings
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession} session - Game replayed
 * @param {Prisma.PlaySessionUncheckedCreateInput} link - Tournament or rematch link
 * @return {Promise<string>} - New game
 */

export const cloneTable = async (
  tx: Prisma.TransactionClient,
  session: LoadedSession,
  link: Pick<
    Prisma.PlaySessionUncheckedCreateInput,
    'tournamentId' | 'tournamentIndex' | 'rematchOfId'
  >
): Promise<string> => {
  const present = session.seats.filter(isPresent)
  const hostId = present.some((seat) => seat.accountId === session.hostId)
    ? session.hostId
    : (present[0]?.accountId ?? session.hostId)

  const next = await tx.playSession.create({
    data: {
      ...link,
      game: session.game,
      hostId,
      settings: session.settings as Prisma.InputJsonValue,
      seats: { create: present.map((seat) => ({ accountId: seat.accountId, color: seat.color })) },
    },
  })

  return next.id
}
