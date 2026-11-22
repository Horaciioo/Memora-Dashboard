import 'server-only'

import { conflict, forbidden } from '@/core/lib/errors'
import { BaccalaureatPhases, roundPhase } from '@/core/lib/play/baccalaureat'
import { after } from '@/core/lib/play/clock'
import { BACCALAUREAT_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import { IDLE_STEP } from '@/core/engines/play/steps'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'
import {
  castVote,
  reviewedRoundId,
  scoreIfJudged,
  scoreRound,
} from '@/core/services/play/baccalaureat/BaccalaureatReviewService'
import {
  callStop,
  closeRound,
  closingAt,
  latestRound,
  openRound,
  writeAnswers,
} from '@/core/services/play/baccalaureat/BaccalaureatRoundService'
import {
  baccalaureatDefaults,
  baccalaureatSettingsOf,
  readBaccalaureatSettings,
} from '@/core/lib/play/baccalaureat/settings'
import { baccalaureatStats } from '@/core/services/play/baccalaureat/BaccalaureatStatsService'
import {
  baccalaureatBoards,
  baccalaureatView,
} from '@/core/services/play/baccalaureat/BaccalaureatViewService'

// Most phases one settle walks through
const MAX_SETTLE_STEPS = 6

/**
 * Advance the latest round by one timed phase
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

const settleOnce = async (session: EngineSession): Promise<EngineStep> => {
  const round = await latestRound(session.id)
  if (!round) return IDLE_STEP

  const now = new Date()
  const phase = roundPhase(round, now)

  // Timed transitions per phase
  if (phase === BaccalaureatPhases.Countdown || phase === BaccalaureatPhases.Writing) {
    const closesAt = closingAt(round)
    if (now < closesAt) return { ...IDLE_STEP, deadline: closesAt }
    const reviewEndsAt = await closeRound(round.id)
    // Closed by another settle, follow its review clock
    if (!reviewEndsAt) {
      const fresh = await latestRound(session.id)

      return { ...IDLE_STEP, deadline: fresh?.reviewEndsAt ?? null }
    }
    // Nothing to judge, count at once
    await scoreIfJudged(session, round.id)

    return { changed: true, finished: false, deadline: reviewEndsAt }
  }
  if (phase === BaccalaureatPhases.Review) {
    if (round.reviewEndsAt && now < round.reviewEndsAt)
      return { ...IDLE_STEP, deadline: round.reviewEndsAt }

    return { ...IDLE_STEP, changed: await scoreRound(session, round.id) }
  }
  // The host is slow, the table moves on by itself
  if (phase === BaccalaureatPhases.Scored && round.scoredAt) {
    if (round.index + 1 >= baccalaureatSettingsOf(session.settings).rounds) return IDLE_STEP
    const nextAt = nextRoundAt(round.scoredAt)
    if (now < nextAt) return { ...IDLE_STEP, deadline: nextAt }
    const opened = await openRound(session, round.index + 1).catch(() => null)

    return opened ?? IDLE_STEP
  }

  return IDLE_STEP
}

/**
 * Moment the next letter opens by itself
 * @param {Date} scoredAt - Round counted
 * @return {Date} - Opening time
 */

const nextRoundAt = (scoredAt: Date): Date => after(scoredAt, BACCALAUREAT_SETTINGS.nextSeconds)

/**
 * Game over once the last round is counted
 * @param {EngineSession} session - Game
 * @param {boolean} changed - Something moved
 * @return {Promise<EngineStep>} - Step
 */

const closeIfLast = async (session: EngineSession, changed: boolean): Promise<EngineStep> => {
  const round = await latestRound(session.id)
  const isLast =
    round !== null &&
    roundPhase(round) === BaccalaureatPhases.Scored &&
    round.index + 1 >= baccalaureatSettingsOf(session.settings).rounds

  // Next letter waits a few seconds, then opens without the host
  const deadline =
    round?.scoredAt && !isLast && roundPhase(round) === BaccalaureatPhases.Scored
      ? nextRoundAt(round.scoredAt)
      : null

  return { changed: changed || isLast, finished: isLast, deadline }
}

/**
 * Host only gate
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @return {void}
 */

const hostOnly = (session: EngineSession, accountId: string): void => {
  if (session.hostId !== accountId) throw forbidden(PLAY_ERRORS.notHost)
}

// Player actions
const ACTIONS: Record<
  string,
  (session: EngineSession, accountId: string, raw: Record<string, unknown>) => Promise<EngineStep>
> = {
  write: writeAnswers,
  stop: (session, accountId) => callStop(session, accountId),
  // Last vote may count the round
  vote: async (session, accountId, raw) =>
    closeIfLast(session, (await castVote(session, accountId, raw)).changed),
  // Host closes the review now
  count: async (session, accountId) => {
    hostOnly(session, accountId)
    const changed = await scoreRound(session, await reviewedRoundId(session))

    return closeIfLast(session, changed)
  },
  // Host opens the next letter
  next: async (session, accountId) => {
    hostOnly(session, accountId)
    const round = await latestRound(session.id)
    if (round && roundPhase(round) !== BaccalaureatPhases.Scored)
      throw conflict(PLAY_ERRORS.notScored)

    return openRound(session)
  },
}

/**
 * Baccalaureat rules
 * @type {PlayEngine}
 */

export const BACCALAUREAT_ENGINE: PlayEngine = {
  defaults: () => baccalaureatDefaults() as unknown as ReturnType<PlayEngine['defaults']>,
  readSettings: readBaccalaureatSettings,
  start: openRound,
  act: async (session, accountId, raw) => {
    const action = ACTIONS[typeof raw.type === 'string' ? raw.type : '']
    if (!action) throw conflict(PLAY_ERRORS.unknownAction)

    return action(session, accountId, raw)
  },
  settle: async (session) => {
    let step = IDLE_STEP
    // Walk every phase overdue
    for (let index = 0; index < MAX_SETTLE_STEPS; index += 1) {
      const next = await settleOnce(session)
      step = { changed: step.changed || next.changed, finished: false, deadline: next.deadline }
      if (!next.changed) break
    }
    if (step.deadline) return step

    return closeIfLast(session, step.changed)
  },
  view: baccalaureatView,
  viewFor: baccalaureatBoards,
  extraStats: baccalaureatStats,
}
