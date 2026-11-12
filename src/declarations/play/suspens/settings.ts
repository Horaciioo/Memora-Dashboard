import suspens from '@/configurations/play/suspens.json'
import {
  readBounds,
  readInteger,
  readNode,
  readString,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'
import { SUSPENS_PARTS } from '@/declarations/play/suspens/parts'

// Raw nodes
const scoring = readNode(suspens.scoring, 'play/suspens.scoring')

// Seat bounds
const minPlayers = readInteger(suspens.minPlayers, {
  path: 'play/suspens.minPlayers',
  fallback: 2,
  min: 2,
})

// Letter sets
const alphabet = readString(suspens.alphabet, {
  path: 'play/suspens.alphabet',
  fallback: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
}).toUpperCase()

// Errors never outnumber the parts of the drawing
const errors = readRange(suspens.errors, 'play/suspens.errors', { initial: 6, min: 6, max: 10 })

/**
 * Suspens settings
 * @type {Object}
 */

export const SUSPENS_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(suspens.maxPlayers, {
    path: 'play/suspens.maxPlayers',
    fallback: 8,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(suspens.countdownSeconds, {
    path: 'play/suspens.countdownSeconds',
    fallback: 3,
    min: 0,
  }),
  // Turns of the table, everyone sets a word once per lap
  laps: readRange(suspens.laps, 'play/suspens.laps', { initial: 1, min: 1, max: 3 }),
  errors: {
    ...errors,
    max: Math.min(errors.max, SUSPENS_PARTS.length),
    initial: Math.min(errors.initial, SUSPENS_PARTS.length),
  },
  turnSeconds: readRange(suspens.turnSeconds, 'play/suspens.turnSeconds', {
    initial: 20,
    min: 8,
    max: 60,
  }),
  pickSeconds: readRange(suspens.pickSeconds, 'play/suspens.pickSeconds', {
    initial: 40,
    min: 15,
    max: 90,
  }),
  revealSeconds: readInteger(suspens.revealSeconds, {
    path: 'play/suspens.revealSeconds',
    fallback: 5,
    min: 1,
  }),
  // Letters a chosen word may have
  wordLength: readBounds(suspens.wordLength, {
    path: 'play/suspens.wordLength',
    fallback: { min: 4, max: 14 },
  }),
  scoring: {
    cell: readInteger(scoring.cell, { path: 'play/suspens.scoring.cell', fallback: 2, min: 0 }),
    solve: readInteger(scoring.solve, { path: 'play/suspens.scoring.solve', fallback: 6, min: 0 }),
    setterPerError: readInteger(scoring.setterPerError, {
      path: 'play/suspens.scoring.setterPerError',
      fallback: 2,
      min: 0,
    }),
    setterHang: readInteger(scoring.setterHang, {
      path: 'play/suspens.scoring.setterHang',
      fallback: 8,
      min: 0,
    }),
  },
  alphabet: [...alphabet],
  // Letters from the most to the least common in French, the bots start with the first
  frequency: [
    ...readString(suspens.frequency, {
      path: 'play/suspens.frequency',
      fallback: 'EAISNRTOLUDCMPGBVHFQYXJKWZ',
    }).toUpperCase(),
  ].filter((letter) => alphabet.includes(letter)),
  feedSize: readInteger(suspens.feedSize, {
    path: 'play/suspens.feedSize',
    fallback: 40,
    min: 1,
  }),
}
