import jumble from '@/configurations/play/jumble.json'
import {
  readBounds,
  readChoice,
  readInteger,
  readNode,
  readNumber,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const scoring = readNode(jumble.scoring, 'play/jumble.scoring')

// Word length band of each level, shorter words are easier
const LEVEL_FALLBACKS = {
  easy: { min: 3, max: 6 },
  medium: { min: 4, max: 7 },
  hard: { min: 5, max: 10 },
  extreme: { min: 7, max: 12 },
} as const

const difficulties = readNode(jumble.difficulties, 'play/jumble.difficulties')

/**
 * Word lengths of each level
 * @type {Record<JumbleLevel, Bounds>}
 */

const LEVEL_LENGTHS = Object.fromEntries(
  Object.entries(LEVEL_FALLBACKS).map(([level, fallback]) => [
    level,
    readBounds(difficulties[level], { path: `play/jumble.difficulties.${level}`, fallback }),
  ])
) as Record<keyof typeof LEVEL_FALLBACKS, { min: number; max: number }>

export type JumbleLevel = keyof typeof LEVEL_LENGTHS

// Seat bounds
const minPlayers = readInteger(jumble.minPlayers, {
  path: 'play/jumble.minPlayers',
  fallback: 1,
  min: 1,
})

/**
 * Jumble settings
 * @type {Object}
 */

export const JUMBLE_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(jumble.maxPlayers, {
    path: 'play/jumble.maxPlayers',
    fallback: 12,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(jumble.countdownSeconds, {
    path: 'play/jumble.countdownSeconds',
    fallback: 3,
    min: 0,
  }),
  rounds: readRange(jumble.rounds, 'play/jumble.rounds', { initial: 10, min: 3, max: 30 }),
  roundSeconds: readRange(jumble.roundSeconds, 'play/jumble.roundSeconds', {
    initial: 25,
    min: 10,
    max: 60,
  }),
  revealSeconds: readInteger(jumble.revealSeconds, {
    path: 'play/jumble.revealSeconds',
    fallback: 3,
    min: 1,
  }),
  hintRatio: readNumber(jumble.hintRatio, {
    path: 'play/jumble.hintRatio',
    fallback: 0.5,
    min: 0.1,
    max: 0.9,
  }),
  // Word length a bot reads at its base pace
  paceLength: readInteger(jumble.paceLength, {
    path: 'play/jumble.paceLength',
    fallback: 5,
    min: 1,
  }),
  difficulties: LEVEL_LENGTHS,
  difficulty: readChoice<JumbleLevel>(jumble.difficulty, {
    path: 'play/jumble.difficulty',
    fallback: 'easy',
    allowed: Object.keys(LEVEL_LENGTHS) as JumbleLevel[],
  }),
  lengths: readBounds(jumble.lengths, {
    path: 'play/jumble.lengths',
    fallback: { min: 3, max: 12 },
  }),
  scoring: {
    base: readInteger(scoring.base, { path: 'play/jumble.scoring.base', fallback: 10, min: 1 }),
    speedBonus: readInteger(scoring.speedBonus, {
      path: 'play/jumble.scoring.speedBonus',
      fallback: 10,
      min: 0,
    }),
    flashRatio: readNumber(scoring.flashRatio, {
      path: 'play/jumble.scoring.flashRatio',
      fallback: 0.2,
      min: 0,
      max: 1,
    }),
    flashBonus: readInteger(scoring.flashBonus, {
      path: 'play/jumble.scoring.flashBonus',
      fallback: 5,
      min: 0,
    }),
    streakStep: readInteger(scoring.streakStep, {
      path: 'play/jumble.scoring.streakStep',
      fallback: 2,
      min: 0,
    }),
    streakMax: readInteger(scoring.streakMax, {
      path: 'play/jumble.scoring.streakMax',
      fallback: 3,
      min: 0,
    }),
  },
  wordLength: readInteger(jumble.wordLength, {
    path: 'play/jumble.wordLength',
    fallback: 30,
    min: 2,
  }),
  feedSize: readInteger(jumble.feedSize, { path: 'play/jumble.feedSize', fallback: 40, min: 1 }),
}
