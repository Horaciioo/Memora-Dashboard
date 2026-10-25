import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { pickSeatColor, readBodyInteger, readBodyText } from '@/core/lib/play'
import { clearDeadline } from '@/core/lib/play/timers'
import { signalPlay } from '@/core/lib/play/signal'
import { PLAY_ERRORS, PLAY_GAMES, PLAY_JOURNAL, PLAY_SETTINGS } from '@/declarations/play'
import { journalPlay } from '@/core/services/play/PlayJournalService'
import {
  cloneTable,
  currentSessionId,
  engineOf,
  ensureFree,
  lockSession,
  requireHost,
  requireSeat,
} from '@/core/services/play/PlaySessionService'
import { isPresent, SESSION_INCLUDE } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { toLobbyCard } from '@/core/lib/play/views'
import { PlayStatuses } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import { MINUTE_MS } from '@/utils/constants/time'

/**
 * Game named by key or slug
 * @param {string} name - Key or slug
 * @return {PlayGameName} - Game
 */

const gameNamed = (name: string): PlayGameName => {
  const game = PLAY_GAMES.keys.find((key) => key === name || PLAY_GAMES.get(key).slug === name)
  if (!game) throw notFound(PLAY_ERRORS.unknownGame)

  return game
}

/**
 * Tournament length asked, null for a single game
 * @param {Record<string, unknown>} raw - Body
 * @return {number | null} - Games
 */

const tournamentLength = (raw: Record<string, unknown>): number | null => {
  const games = readBodyInteger(raw, 'games')
  if (!games || games < PLAY_SETTINGS.tournament.minGames) return null

  return Math.min(games, PLAY_SETTINGS.tournament.maxGames)
}

/**
 * Open a lobby, its creator hosting
 * @param {string} accountId - Host
 * @param {Record<string, unknown>} raw - Body with game, settings and games
 * @return {Promise<{ id: string }>} - New game
 */

export const createSession = async (accountId: string, raw: Record<string, unknown>) => {
  const game = gameNamed(readBodyText(raw, 'game', PLAY_ERRORS.unknownGame))
  const settings = engineOf(game).readSettings(
    (raw.settings ?? {}) as Record<string, unknown>,
    null
  )
  const games = tournamentLength(raw)

  const session = await prisma.$transaction(async (tx) => {
    await ensureFree(tx, accountId)
    const tournament = games
      ? await tx.playTournament.create({ data: { game, hostId: accountId, gamesCount: games } })
      : null

    return tx.playSession.create({
      data: {
        game,
        hostId: accountId,
        settings,
        tournamentId: tournament?.id,
        tournamentIndex: tournament ? 0 : null,
        seats: { create: { accountId, color: pickSeatColor([]) } },
      },
      select: { id: true },
    })
  })
  await signalPlay(session.id, true)
  await journalPlay({
    eventType: 'PlayJoined',
    subjectId: accountId,
    game,
    template: PLAY_JOURNAL.hosted,
    sessionId: session.id,
  })

  return session
}

/**
 * Lobbies waiting for players, and the reader's own game
 * @param {string} accountId - Reader
 * @param {string | null} [game] - Game filter
 * @return {Promise<object>} - Lobbies
 */

export const listLobbies = async (accountId: string, game?: string | null) => {
  const idleSince = new Date(Date.now() - PLAY_SETTINGS.lobbyIdleMinutes * MINUTE_MS)

  // Forgotten lobbies close quietly
  await prisma.playSession.updateMany({
    where: { status: PlayStatuses.Lobby, updatedAt: { lt: idleSince } },
    data: { status: PlayStatuses.Abandoned },
  })

  // Running games welcome spectators
  const [lobbies, running, current] = await Promise.all([
    prisma.playSession.findMany({
      where: { status: PlayStatuses.Lobby, ...(game && { game: gameNamed(game) }) },
      orderBy: { createdAt: 'desc' },
      include: SESSION_INCLUDE,
    }),
    prisma.playSession.findMany({
      where: { status: PlayStatuses.Running, ...(game && { game: gameNamed(game) }) },
      orderBy: { startedAt: 'desc' },
      include: SESSION_INCLUDE,
    }),
    currentSessionId(accountId),
  ])

  return {
    lobbies: lobbies.map(toLobbyCard),
    running: running.map(toLobbyCard),
    currentId: current,
  }
}

/**
 * Take a seat in a lobby
 * @param {string} sessionId - Game
 * @param {string} accountId - Player
 * @return {Promise<void>} - Seated
 */

export const joinSession = async (sessionId: string, accountId: string): Promise<void> => {
  const joined = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    const seat = session.seats.find((entry) => entry.accountId === accountId)
    if (seat?.kickedAt) throw forbidden(PLAY_ERRORS.kicked)
    if (seat && isPresent(seat)) return null
    if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)

    const present = session.seats.filter(isPresent)
    if (present.length >= PLAY_GAMES.get(session.game).maxPlayers) throw conflict(PLAY_ERRORS.full)
    await ensureFree(tx, accountId, sessionId)

    // Back in the lobby, or a new seat
    const color = pickSeatColor(present.map((entry) => entry.color))
    await tx.playSeat.upsert({
      where: { sessionId_accountId: { sessionId, accountId } },
      create: { sessionId, accountId, color },
      update: { leftAt: null, color, joinedAt: new Date() },
    })
    await touch(tx, sessionId)

    return session.game
  })
  if (!joined) return

  await signalPlay(sessionId, true)
  await journalPlay({
    eventType: 'PlayJoined',
    subjectId: accountId,
    game: joined,
    template: PLAY_JOURNAL.joined,
    sessionId,
  })
}

/**
 * Mark a game active
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {string} sessionId - Game
 * @return {Promise<void>} - Touched
 */

const touch = async (tx: Prisma.TransactionClient, sessionId: string): Promise<void> => {
  await tx.playSession.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
}

/**
 * Hand the game over or end it once a seat empties
 * @param {Prisma.TransactionClient} tx - Transaction
 * @param {LoadedSession} session - Game before the seat emptied
 * @param {string} accountId - Player gone
 * @return {Promise<void>} - Written
 */

const afterDeparture = async (
  tx: Prisma.TransactionClient,
  session: LoadedSession,
  accountId: string
): Promise<void> => {
  const remaining = session.seats.filter((seat) => isPresent(seat) && seat.accountId !== accountId)

  // Empty table, nothing left to play
  if (!remaining.length) {
    await tx.playSession.update({
      where: { id: session.id },
      data: { status: PlayStatuses.Abandoned },
    })
    if (session.tournamentId) {
      await tx.playTournament.update({
        where: { id: session.tournamentId },
        data: { status: PlayStatuses.Abandoned },
      })
    }
    clearDeadline(session.id)
    return
  }

  // Longest seated player hosts
  if (session.hostId === accountId) {
    await tx.playSession.update({
      where: { id: session.id },
      data: { hostId: remaining[0].accountId },
    })
  } else {
    await touch(tx, session.id)
  }
}

/**
 * Leave a game on purpose
 * @param {string} sessionId - Game
 * @param {string} accountId - Player
 * @param {{ quiet?: boolean }} [options] - Skip the journal line
 * @return {Promise<void>} - Left
 */

export const leaveSession = async (
  sessionId: string,
  accountId: string,
  { quiet = false }: { quiet?: boolean } = {}
): Promise<void> => {
  const game = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    requireSeat(session, accountId)

    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId, accountId } },
      data: { leftAt: new Date() },
    })
    await afterDeparture(tx, session, accountId)

    return session.game
  })
  await signalPlay(sessionId, true)
  if (!quiet) {
    await journalPlay({
      eventType: 'PlayLeft',
      subjectId: accountId,
      game,
      template: PLAY_JOURNAL.left,
      sessionId,
    })
  }
}

/**
 * Host removes a player
 * @param {string} sessionId - Game
 * @param {string} hostId - Host
 * @param {string} accountId - Player removed
 * @return {Promise<void>} - Removed
 */

export const kickPlayer = async (
  sessionId: string,
  hostId: string,
  accountId: string
): Promise<void> => {
  if (hostId === accountId) throw conflict(PLAY_ERRORS.selfKick)

  const game = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    requireHost(session, hostId)
    requireSeat(session, accountId)

    const now = new Date()
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId, accountId } },
      data: { leftAt: now, kickedAt: now },
    })
    await afterDeparture(tx, session, accountId)

    return session.game
  })
  await signalPlay(sessionId, true)
  await journalPlay({
    eventType: 'PlayKicked',
    subjectId: accountId,
    actorId: hostId,
    game,
    template: PLAY_JOURNAL.kicked,
    sessionId,
  })
}

/**
 * Host changes the lobby settings
 * @param {string} sessionId - Game
 * @param {string} hostId - Host
 * @param {Record<string, unknown>} raw - Asked settings
 * @return {Promise<void>} - Saved
 */

export const updateSettings = async (
  sessionId: string,
  hostId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    requireHost(session, hostId)
    if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)

    await tx.playSession.update({
      where: { id: sessionId },
      data: { settings: engineOf(session.game).readSettings(raw, session.settings) },
    })
  })
  await signalPlay(sessionId)
}

/**
 * Host replays a finished game with the same table
 * @param {string} sessionId - Finished game
 * @param {string} hostId - Host
 * @return {Promise<{ id: string }>} - New lobby
 */

export const rematchSession = async (sessionId: string, hostId: string) => {
  const id = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    requireHost(session, hostId)
    if (session.status !== PlayStatuses.Finished) throw conflict(PLAY_ERRORS.notFinished)
    if (session.tournamentId) throw conflict(PLAY_ERRORS.rematchTournament)

    // One rematch per game
    const known = await tx.playSession.findUnique({
      where: { rematchOfId: sessionId },
      select: { id: true },
    })

    return known?.id ?? cloneTable(tx, session, { rematchOfId: sessionId })
  })
  await signalPlay(sessionId, true)

  return { id }
}
