import 'server-only'

import { PlayNoticeKind } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { seatBoundsOf } from '@/core/lib/play/seats'
import { conflict, notFound } from '@/core/lib/errors'
import { mayEnter } from '@/core/lib/play/access'
import { signalPlay } from '@/core/lib/play/signal'
import { clearSessionTimers, scheduleDeadline } from '@/core/lib/play/timers'
import { PLAY_ERRORS } from '@/declarations/play'
import type { EngineStep } from '@/core/engines/play'
import { driveBots } from '@/core/engines/play/players/BotDriver'
import { logger } from '@/core/lib/logger'
import { noteAction } from '@/core/services/play/PlayIdleService'
import { tellFollowers } from '@/core/services/play/PlayFollowService'
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
    clearSessionTimers(sessionId)
    await finishSession(sessionId)
  } else if (step.deadline) {
    scheduleDeadline(sessionId, step.deadline, () => settleSession(sessionId))
  }

  // A running table draws from its board alone, the page moves at the end
  if (step.changed || step.finished) await signalPlay(sessionId, step.finished, !step.finished)
  // Bots answer the new board
  if (step.changed && !step.finished) {
    void driveBots(sessionId, playMove).catch((error: unknown) =>
      logger.warn('[play] bots stalled', error)
    )
  }
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
  // Private games stay shut to the uninvited
  if (!(await mayEnter(prisma, session, viewerId))) throw notFound(PLAY_ERRORS.sessionMissing)
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
    if (locked.seats.filter(isPresent).length < seatBoundsOf(locked.game, locked.settings).min) {
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
  noteAction(sessionId)
  await signalPlay(sessionId, true)
  await tellFollowers(sessionId, PlayNoticeKind.STARTED)
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
  noteAction(sessionId)
  await playMove(sessionId, accountId, raw)
}

/**
 * Checked engine move, bots included
 * @param {string} sessionId - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Action body
 * @return {Promise<void>} - Played
 */

const playMove = async (
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
