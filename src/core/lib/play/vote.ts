import type { Prisma } from '@prisma/client'

import {
  golfDeal,
  golfSettingsOf,
  golfVoteOptions,
  golfVoteSettings,
  golfVoteSteps,
  winningCard,
} from '@/core/lib/play/golf'
import type { GolfVoteStep } from '@/declarations/play/golf/vote'
import { GOLF_VOTE_TIMING } from '@/declarations/play/golf/vote'
import { PLAY_VOTE_SETTINGS, PLAY_VOTE_STEPS } from '@/declarations/play/votes'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Launch vote of a lobby, kept in its settings
 * @typedef {Object} PlayVoteState
 * @property {string} step - Step on screen
 * @property {number} endsAt - Server ms the step closes
 * @property {Record<string, string>} picks - Card of each voter on this step
 * @property {Record<string, string>} chosen - Winners of the closed steps
 */

export interface PlayVoteState {
  step: string
  endsAt: number
  picks: Record<string, string>
  chosen: Record<string, string>
  // Server ms a closing draw started, the vote is over
  dealtAt?: number
}

/**
 * How one game runs its launch vote
 * @typedef {Object} PlayVoteRules
 */

export interface PlayVoteRules {
  // Steps still to ask, a game may skip some for the table size
  steps: (chosen: Record<string, string>, seated: number) => string[]
  options: (step: string) => string[]
  // Card most picked, the host breaking ties
  winner: (
    step: string,
    picks: Record<string, string>,
    hostId: string,
    stored: Prisma.JsonValue
  ) => string
  // Raw settings for the game's reader
  settings: (
    chosen: Record<string, string>,
    stored: Prisma.JsonValue,
    seated: number
  ) => Record<string, unknown>
  // Draw shown before the start, settings fixed and its length
  deal?: (settled: Prisma.JsonValue) => { settings: Prisma.InputJsonObject; ms: number } | null
}

/**
 * Card most picked, the host's on a tie, the fallback when nobody voted
 * @param {string[]} options - Cards in order
 * @param {Record<string, string>} picks - Card of each voter
 * @param {string} hostId - Host
 * @param {string} [fallback] - Card kept without votes, the first by default
 * @return {string} - Card key
 */

export const mostPicked = (
  options: string[],
  picks: Record<string, string>,
  hostId: string,
  fallback?: string
): string => {
  const votes = Object.values(picks).filter((key) => options.includes(key))
  if (!votes.length) return fallback ?? options[0]
  const count = (key: string) => votes.filter((vote) => vote === key).length
  const top = Math.max(...options.map(count))
  const tied = options.filter((key) => count(key) === top)

  return tied.includes(picks[hostId]) ? picks[hostId] : tied[0]
}

/**
 * Vote rules read from the declared steps of a game
 * @param {PlayGameName} game - Game
 * @return {PlayVoteRules | null} - Rules, none without a vote
 */

const declaredRules = (game: PlayGameName): PlayVoteRules | null => {
  const steps = PLAY_VOTE_STEPS[game]
  const toSettings = PLAY_VOTE_SETTINGS[game]
  if (!steps || !toSettings) return null
  const specOf = (step: string) => steps.find((entry) => entry.key === step)
  const optionsOf = (step: string) => specOf(step)?.choices.map((choice) => choice.key) ?? []

  return {
    steps: (_, seated) =>
      steps.filter((entry) => entry.isAsked?.(seated) ?? true).map((entry) => entry.key),
    options: optionsOf,
    winner: (step, picks, hostId) =>
      mostPicked(optionsOf(step), picks, hostId, specOf(step)?.initial),
    settings: (chosen, _, seated) => toSettings(chosen, seated),
  }
}

// Golf keeps its own cards and fallbacks
const GOLF_RULES: PlayVoteRules = {
  steps: (chosen) => golfVoteSteps(chosen.mode),
  options: (step) => golfVoteOptions(step as GolfVoteStep),
  winner: (step, picks, hostId, stored) =>
    winningCard(step as GolfVoteStep, picks, hostId, golfSettingsOf(stored)),
  settings: (chosen, stored) => golfVoteSettings(chosen, golfSettingsOf(stored)),
  deal: golfDeal,
}

/**
 * Launch vote rules of a game
 * @param {PlayGameName} game - Game
 * @return {PlayVoteRules | null} - Rules, none when the host launches alone
 */

export const voteRulesOf = (game: PlayGameName): PlayVoteRules | null =>
  game === PlayGames.Golf ? GOLF_RULES : declaredRules(game)

/**
 * Vote opened at a step
 * @param {string} step - Step
 * @param {number} now - Server ms
 * @param {Record<string, string>} [chosen] - Winners so far
 * @return {PlayVoteState} - Vote
 */

export const voteAt = (
  step: string,
  now: number,
  chosen: Record<string, string> = {}
): PlayVoteState => ({ step, endsAt: now + GOLF_VOTE_TIMING.limit, picks: {}, chosen })

/**
 * Open vote of stored settings
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {PlayVoteState | null} - Vote, none when closed
 */

export const voteOf = (stored: Prisma.JsonValue): PlayVoteState | null => {
  const vote = (stored as { vote?: PlayVoteState } | null)?.vote

  return vote && typeof vote.endsAt === 'number' ? vote : null
}
