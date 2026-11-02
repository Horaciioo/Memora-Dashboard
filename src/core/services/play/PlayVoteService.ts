import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { isPresent } from '@/core/lib/play/session'
import type { LoadedSession } from '@/core/lib/play/session'
import { signalPlay } from '@/core/lib/play/signal'
import { clearDeadline, scheduleDeadline } from '@/core/lib/play/timers'
import { voteAt, voteOf, voteRulesOf } from '@/core/lib/play/vote'
import type { PlayVoteRules, PlayVoteState } from '@/core/lib/play/vote'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { GolfVoteActions } from '@/declarations/play/golf/vote'
import type { GolfVoteAction } from '@/declarations/play/golf/vote'
import { startSession } from '@/core/services/play/GameService'
import {
  engineOf,
  lockSession,
  requireHost,
  requireSeat,
} from '@/core/services/play/PlaySessionService'
import { PlayStatuses } from '@/utils/constants/play'

// Clock slack between a player's screen and the server
const CLOCK_SLACK_MS = 1000

/**
 * Settings with the vote written or removed
 * @param {Prisma.JsonValue} settings - Stored settings
 * @param {PlayVoteState | null} vote - Vote, none to close it
 * @return {Prisma.InputJsonObject} - Settings to store
 */

const withVote = (settings: Prisma.JsonValue, vote: PlayVoteState | null) => {
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
  vote: PlayVoteState | null
  rules: PlayVoteRules
  raw: Record<string, unknown>
  // The server's own clock closing the step, no player behind it
  isSystem: boolean
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
  const { session, vote, accountId, rules } = context
  requireHost(session, accountId)
  if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)
  if (session.seats.filter(isPresent).length < PLAY_GAMES.get(session.game).minPlayers) {
    throw conflict(PLAY_ERRORS.tooFewPlayers)
  }
  if (!vote)
    await store(context, withVote(session.settings, voteAt(rules.steps({})[0], Date.now())))

  return { isStarting: false }
}

/**
 * A seated player picks a card of the step on screen
 * @param {VoteContext} context - Game
 * @return {Promise<VoteOutcome>} - Outcome
 */

const pick = async (context: VoteContext): Promise<VoteOutcome> => {
  const { session, vote, accountId, raw, rules } = context
  requireSeat(session, accountId)
  if (!vote) throw conflict(PLAY_ERRORS.noVote)
  if (!rules.options(vote.step).includes(String(raw.key))) {
    throw conflict(PLAY_ERRORS.invalidSettings)
  }
  const picks = { ...vote.picks, [accountId]: String(raw.key) }
  await store(context, withVote(session.settings, { ...vote, picks }))

  return { isStarting: false }
}

/**
 * Close the step: the host any time, anyone once the clock ran out, the server clock itself
 * @param {VoteContext} context - Game
 * @return {Promise<VoteOutcome>} - Outcome
 */

const close = async (context: VoteContext): Promise<VoteOutcome> => {
  const { session, vote, accountId, raw, rules, isSystem } = context
  if (!isSystem) requireSeat(session, accountId)
  const isStale = !vote || raw.step !== vote.step
  const isOver = vote && Date.now() >= vote.endsAt - CLOCK_SLACK_MS
  if (isStale || !(isSystem || session.hostId === accountId || isOver)) {
    return { isStarting: false }
  }

  const present = new Set(session.seats.filter(isPresent).map((seat) => seat.accountId))
  const picks = Object.fromEntries(
    Object.entries(vote.picks).filter(([voter]) => present.has(voter))
  )
  const chosen = {
    ...vote.chosen,
    [vote.step]: rules.winner(vote.step, picks, session.hostId, session.settings),
  }
  const steps = rules.steps(chosen)
  const next = steps[steps.indexOf(vote.step) + 1]
  if (next) {
    await store(context, withVote(session.settings, voteAt(next, Date.now(), chosen)))

    return { isStarting: false }
  }

  // Last step: the winners become the rules, the game starts
  const asked = rules.settings(chosen, session.settings)
  const settled = engineOf(session.game).readSettings(asked, session.settings)
  await store(context, withVote(settled as Prisma.JsonValue, null))

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
 * Run the server's clock on the step on screen, so a vote never waits on a player's screen
 * @param {string} sessionId - Game
 * @return {Promise<void>} - Clock set, or dropped when no vote is open
 */

const armVote = async (sessionId: string): Promise<void> => {
  const row = await prisma.playSession.findUnique({
    where: { id: sessionId },
    select: { settings: true },
  })
  const vote = row ? voteOf(row.settings) : null
  if (!vote) return clearDeadline(sessionId)

  // Slack lets the players' own clocks close it first
  scheduleDeadline(sessionId, new Date(vote.endsAt + CLOCK_SLACK_MS), () =>
    runVote(sessionId, null, { action: GolfVoteActions.Close, step: vote.step })
  )
}

/**
 * Play one action of the vote, for a player or for the server clock
 * @param {string} sessionId - Game
 * @param {string | null} accountId - Player, null for the server clock
 * @param {Record<string, unknown>} raw - Body with action, key and step
 * @return {Promise<void>} - Done, the game started when the last step closed
 */

const runVote = async (
  sessionId: string,
  accountId: string | null,
  raw: Record<string, unknown>
): Promise<void> => {
  const action = ACTIONS[raw.action as GolfVoteAction]
  if (!action) throw conflict(PLAY_ERRORS.unknownAction)

  const { outcome, hostId } = await prisma.$transaction(async (tx) => {
    const session = await lockSession(tx, sessionId)
    if (session.status !== PlayStatuses.Lobby) throw conflict(PLAY_ERRORS.notInLobby)
    const rules = voteRulesOf(session.game)
    if (!rules) throw conflict(PLAY_ERRORS.noVote)

    return {
      outcome: await action({
        tx,
        session,
        accountId: accountId ?? session.hostId,
        raw,
        rules,
        vote: voteOf(session.settings),
        isSystem: accountId === null,
      }),
      hostId: session.hostId,
    }
  })
  await signalPlay(sessionId)
  // A pick leaves the clock as it is
  if (raw.action !== GolfVoteActions.Pick) await armVote(sessionId)
  if (outcome.isStarting) await startSession(sessionId, hostId)
}

/**
 * Play one action of the launch vote of a lobby
 * @param {string} sessionId - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with action, key and step
 * @return {Promise<void>} - Done, the game started when the last step closed
 */

export const voteInLobby = (
  sessionId: string,
  accountId: string,
  raw: Record<string, unknown>
): Promise<void> => runVote(sessionId, accountId, raw)
