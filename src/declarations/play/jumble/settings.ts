import jumble from '@/configurations/play/jumble.json'
import {
  readBounds,
  readInteger,
  readNode,
  readNumber,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const scoring = readNode(jumble.scoring, 'play/jumble.scoring')

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
  lengths: readBounds(jumble.lengths, {
    path: 'play/jumble.lengths',
    fallback: { min: 5, max: 12 },
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
