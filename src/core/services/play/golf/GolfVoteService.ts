import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import {
  golfSettingsOf,
  golfVoteAt,
  golfVoteOf,
  golfVoteOptions,
  golfVoteSettings,
  golfVoteSteps,
  readGolfSettings,
  winningCard,
} from '@/core/lib/play/golf'
import type { GolfVoteState } from '@/core/lib/play/golf'
import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { signalPlay } from '@/core/lib/play/signal'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { GolfVoteActions, GolfVoteSteps } from '@/declarations/play/golf/vote'
import type { GolfVoteAction } from '@/declarations/play/golf/vote'
import { startSession } from '@/core/services/play/GameService'
import { lockSession, requireHost, requireSeat } from '@/core/services/play/PlaySessionService'
import { PlayStatuses } from '@/utils/constants/play'

// Clock slack between a player's screen and the server
const CLOCK_SLACK_MS = 1000

/**
 * Settings with the vote written or removed
 * @param {Prisma.JsonValue} settings - Stored settings
 * @param {GolfVoteState | null} vote - Vote, none to close it
 * @return {Prisma.InputJsonObject} - Settings to store
 */

const withVote = (settings: Prisma.JsonValue, vote: GolfVoteState | null) => {
  const next = { ...(settings as Record<string, unknown>) }
  if (vote) next.vote = vote
  else delete next.vote

  return next as Prisma.InputJsonObject
}

/**
 * What a vote action works on
 * @typedef {Object} VoteContext
 */

interface VoteContext {
  tx: Prisma.TransactionClient
  session: LoadedSession
  accountId: string
  vote: GolfVoteState | null
  raw: Record<string, unknown>
}

// Settings stored back, the game launched when the last step closed
type VoteOutcome = { isStarting: boolean }

/**
 * Store a vote or its end
 * @param {VoteContext} context - Game
 * @param {Prisma.InputJsonObject} settings - Settings to store
 * @return {Promise<void>} - Saved
 */

const store = async ({ tx, session }: VoteContext, settings: Prisma.InputJsonObject) => {
  await tx.playSession.update({ where: { id: session.id }, data: { settings } })
}

/**
 * Host opens the vote of the lobby
 * @param {VoteContext} context - Game
 * @return {Promise<VoteOutcome>} - Outcome
 */

const open = async (context: VoteContext): Promise<VoteOutcome> => {
  const { session, vote, accountId } = context
  requireHost(session, accountId)
  if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)
  if (session.seats.filter(isPresent).length < PLAY_GAMES.get(session.game).minPlayers) {
    throw conflict(PLAY_ERRORS.tooFewPlayers)
  }
  if (!vote)
    await store(context, withVote(session.settings, golfVoteAt(GolfVoteSteps.Mode, Date.now())))

  return { isStarting: false }
}

/**
 * A seated player picks a card of the step on screen
 * @param {VoteContext} context - Game
 * @return {Promise<VoteOutcome>} - Outcome
 */

const pick = async (context: VoteContext): Promise<VoteOutcome> => {
  const { session, vote, accountId, raw } = context
  requireSeat(session, accountId)
  if (!vote) throw conflict(PLAY_ERRORS.noVote)
  if (!golfVoteOptions(vote.step).includes(String(raw.key))) {
    throw conflict(PLAY_ERRORS.invalidSettings)
  }
  const picks = { ...vote.picks, [accountId]: String(raw.key) }
  await store(context, withVote(session.settings, { ...vote, picks }))

  return { isStarting: false }
}

/**
 * Close the step: the host any time, anyone once the clock ran out
 * @param {VoteContext} context - Game
 * @return {Promise<VoteOutcome>} - Outcome
 */

const close = async (context: VoteContext): Promise<VoteOutcome> => {
  const { session, vote, accountId, raw } = context
  requireSeat(session, accountId)
  const isStale = !vote || raw.step !== vote.step
  const isOver = vote && Date.now() >= vote.endsAt - CLOCK_SLACK_MS
  if (isStale || !(session.hostId === accountId || isOver)) return { isStarting: false }

  const settings = golfSettingsOf(session.settings)
  const present = new Set(session.seats.filter(isPresent).map((seat) => seat.accountId))
  const picks = Object.fromEntries(
    Object.entries(vote.picks).filter(([voter]) => present.has(voter))
  )
  const chosen = {
    ...vote.chosen,
    [vote.step]: winningCard(vote.step, picks, session.hostId, settings),
  }
  const steps = golfVoteSteps(chosen.mode)
  const next = steps[steps.indexOf(vote.step) + 1]
  if (next) {
    await store(context, withVote(session.settings, golfVoteAt(next, Date.now(), chosen)))

    return { isStarting: false }
  }

  // Last step: the winners become the rules, the game starts
  const rules = readGolfSettings(golfVoteSettings(chosen, settings), session.settings)
  await store(context, withVote(rules as Prisma.JsonValue, null))

  return { isStarting: true }
}

/**
 * Host drops the vote, the lobby stays open
 * @param {VoteContext} context - Game
 * @return {Promise<VoteOutcome>} - Outcome
 */

const cancel = async (context: VoteContext): Promise<VoteOutcome> => {
  requireHost(context.session, context.accountId)
  if (context.vote) await store(context, withVote(context.session.settings, null))

  return { isStarting: false }
}

// Handler of each action
const ACTIONS: Record<GolfVoteAction, (context: VoteContext) => Promise<VoteOutcome>> = {
  [GolfVoteActions.Open]: open,
  [GolfVoteActions.Pick]: pick,
  [GolfVoteActions.Close]: close,
  [GolfVoteActions.Cancel]: cancel,
}

/**
 * Play one action of the launch vote of a golf lobby
 * @param {string} sessionId - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with action, key and step
 * @return {Promise<void>} - Done, the game started when the last step closed
 */

export const voteInLobby = async (
  sessionId: string,
  accountId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const action = ACTIONS[raw.action as GolfVoteAction]
  if (!action) throw conflict(PLAY_ERRORS.unknownAction)

  const { outcome, hostId } = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)

    return {
      outcome: await action({ tx, session, accountId, raw, vote: golfVoteOf(session.settings) }),
      hostId: session.hostId,
    }
  })
  await signalPlay(sessionId)
  if (outcome.isStarting) await startSession(sessionId, hostId)
}
