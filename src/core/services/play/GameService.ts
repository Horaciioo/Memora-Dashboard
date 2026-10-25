import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { signalPlay } from '@/core/lib/play/signal'
import { clearDeadline, scheduleDeadline } from '@/core/lib/play/timers'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import type { EngineStep } from '@/core/engines/play'
import { finishSession } from '@/core/services/play/RewardService'
import { tournamentStandings } from '@/core/services/play/TournamentService'
import {
  engineOf,
  loadSession,
  lockSession,
  requireHost,
  requireSeat,
} from '@/core/services/play/PlaySessionService'
import { isPresent, toEngineSession } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { toSessionView } from '@/core/lib/play/views'
import { PlayStatuses } from '@/utils/constants/play'

/**
 * Follow up an engine move
 * @param {string} sessionId - Game
 * @param {EngineStep} step - Move result
 * @return {Promise<void>} - Applied
 */

const applyStep = async (sessionId: string, step: EngineStep): Promise<void> => {
  if (step.finished) {
    clearDeadline(sessionId)
    await finishSession(sessionId)
  } else if (step.deadline) {
    scheduleDeadline(sessionId, step.deadline, () => settleSession(sessionId))
  }

  if (step.changed || step.finished) await signalPlay(sessionId, step.finished)
}

/**
 * Play every overdue timed move of a game
 * @param {string} sessionId - Game
 * @return {Promise<LoadedSession>} - Game afterwards
 */

export const settleSession = async (sessionId: string): Promise<LoadedSession> => {
  const session = await loadSession(sessionId)
  if (session.status !== PlayStatuses.Running) return session

  const step = await engineOf(session.game).settle(toEngineSession(session))
  await applyStep(sessionId, step)

  return step.changed || step.finished ? loadSession(sessionId) : session
}

/**
 * Next game of a finished tournament game
 * @param {LoadedSession} session - Game
 * @return {Promise<string | null>} - Next game
 */

const nextGameId = async (session: LoadedSession): Promise<string | null> => {
  if (!session.tournamentId || session.status !== PlayStatuses.Finished) return null
  const next = await prisma.playSession.findFirst({
    where: {
      tournamentId: session.tournamentId,
      tournamentIndex: (session.tournamentIndex ?? 0) + 1,
    },
    select: { id: true },
  })

  return next?.id ?? null
}

/**
 * Read a game as one of its players
 * @param {string} sessionId - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - View
 */

export const readSession = async (sessionId: string, viewerId: string) => {
  const session = await settleSession(sessionId)
  const isStarted = session.status !== PlayStatuses.Lobby
  const engine = engineOf(session.game)

  const [board, standings, nextId] = await Promise.all([
    isStarted ? engine.view(toEngineSession(session), viewerId) : null,
    session.tournamentId ? tournamentStandings(session.tournamentId) : null,
    nextGameId(session),
  ])
  const view = toSessionView(session, viewerId, board)

  return { ...view, tournament: view.tournament && { ...view.tournament, standings, nextId } }
}

/**
 * Host launches the game
 * @param {string} sessionId - Game
 * @param {string} hostId - Host
 * @return {Promise<void>} - Started
 */

export const startSession = async (sessionId: string, hostId: string): Promise<void> => {
  const session = await prisma.$transaction(async (tx) => {
    const locked = await lockSession(tx, sessionId)
    requireHost(locked, hostId)
    if (locked.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)
    if (locked.seats.filter(isPresent).length < PLAY_GAMES.get(locked.game).minPlayers) {
      throw conflict(PLAY_ERRORS.tooFewPlayers)
    }

    await tx.playSession.update({
      where: { id: sessionId },
      data: { status: PlayStatuses.Running, startedAt: new Date() },
    })

    return locked
  })

  // A table that failed to open goes back to the lobby, never stuck running
  try {
    await applyStep(sessionId, await engineOf(session.game).start(toEngineSession(session)))
  } catch (error) {
    await prisma.playSession.update({
      where: { id: sessionId },
      data: { status: PlayStatuses.Lobby, startedAt: null },
    })
    await signalPlay(sessionId, false)
    throw error
  }
  await signalPlay(sessionId, true)
}

/**
 * Play one action of the game
 * @param {string} sessionId - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Action body
 * @return {Promise<void>} - Played
 */

export const actInSession = async (
  sessionId: string,
  accountId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const session = await settleSession(sessionId)
  if (session.status !== PlayStatuses.Running) throw conflict(PLAY_ERRORS.notRunning)
  requireSeat(session, accountId)

  await applyStep(
    sessionId,
    await engineOf(session.game).act(toEngineSession(session), accountId, raw)
  )
}
