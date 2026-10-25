import 'server-only'

import { conflict, forbidden } from '@/core/lib/errors'
import { BaccalaureatPhases, roundPhase } from '@/core/lib/play/baccalaureat'
import { PLAY_ERRORS } from '@/declarations/play'
import { IDLE_STEP } from '@/core/engines/play/steps'
import type { EngineSession, EngineStep, PlayEngine } from '@/types/play'
import {
  castVote,
  reviewedRoundId,
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
import { baccalaureatView } from '@/core/services/play/baccalaureat/BaccalaureatViewService'

// Most phases one settle walks through
const MAX_SETTLE_STEPS = 4

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

    return { changed: Boolean(reviewEndsAt), finished: false, deadline: reviewEndsAt }
  }
  if (phase === BaccalaureatPhases.Review) {
    if (round.reviewEndsAt && now < round.reviewEndsAt)
      return { ...IDLE_STEP, deadline: round.reviewEndsAt }

    return { ...IDLE_STEP, changed: await scoreRound(session, round.id) }
  }

  return IDLE_STEP
}

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

  return { changed: changed || isLast, finished: isLast, deadline: null }
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
  vote: castVote,
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
  extraStats: baccalaureatStats,
}
