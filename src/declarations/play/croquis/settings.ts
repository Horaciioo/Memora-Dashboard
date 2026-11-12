import croquis from '@/configurations/play/croquis.json'
import { readInteger, readNode, readNumber } from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const scoring = readNode(croquis.scoring, 'play/croquis.scoring')
const canvas = readNode(croquis.canvas, 'play/croquis.canvas')
const limits = readNode(croquis.limits, 'play/croquis.limits')

// Seat bounds
const minPlayers = readInteger(croquis.minPlayers, {
  path: 'play/croquis.minPlayers',
  fallback: 2,
  min: 2,
})

/**
 * Croquis settings
 * @type {Object}
 */

export const CROQUIS_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(croquis.maxPlayers, {
    path: 'play/croquis.maxPlayers',
    fallback: 10,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(croquis.countdownSeconds, {
    path: 'play/croquis.countdownSeconds',
    fallback: 3,
    min: 0,
  }),
  // Turns of the table, everyone draws once per lap
  laps: readRange(croquis.laps, 'play/croquis.laps', { initial: 1, min: 1, max: 3 }),
  roundSeconds: readRange(croquis.roundSeconds, 'play/croquis.roundSeconds', {
    initial: 75,
    min: 30,
    max: 150,
  }),
  revealSeconds: readInteger(croquis.revealSeconds, {
    path: 'play/croquis.revealSeconds',
    fallback: 4,
    min: 1,
  }),
  // Share of the round after which the first letter shows
  hintRatio: readNumber(croquis.hintRatio, {
    path: 'play/croquis.hintRatio',
    fallback: 0.5,
    min: 0.1,
    max: 0.9,
  }),
  wordLength: readInteger(croquis.wordLength, {
    path: 'play/croquis.wordLength',
    fallback: 30,
    min: 10,
  }),
  scoring: {
    base: readInteger(scoring.base, { path: 'play/croquis.scoring.base', fallback: 10, min: 1 }),
    speedBonus: readInteger(scoring.speedBonus, {
      path: 'play/croquis.scoring.speedBonus',
      fallback: 10,
      min: 0,
    }),
    firstBonus: readInteger(scoring.firstBonus, {
      path: 'play/croquis.scoring.firstBonus',
      fallback: 5,
      min: 0,
    }),
    drawerPerGuess: readInteger(scoring.drawerPerGuess, {
      path: 'play/croquis.scoring.drawerPerGuess',
      fallback: 6,
      min: 0,
    }),
    drawerAllBonus: readInteger(scoring.drawerAllBonus, {
      path: 'play/croquis.scoring.drawerAllBonus',
      fallback: 6,
      min: 0,
    }),
  },
  // Logical drawing surface, strokes live inside it
  canvas: {
    width: readInteger(canvas.width, {
      path: 'play/croquis.canvas.width',
      fallback: 800,
      min: 100,
    }),
    height: readInteger(canvas.height, {
      path: 'play/croquis.canvas.height',
      fallback: 600,
      min: 100,
    }),
  },
  // Caps keeping a board light
  limits: {
    strokes: readInteger(limits.strokes, {
      path: 'play/croquis.limits.strokes',
      fallback: 150,
      min: 1,
    }),
    pointsPerStroke: readInteger(limits.pointsPerStroke, {
      path: 'play/croquis.limits.pointsPerStroke',
      fallback: 600,
      min: 2,
    }),
    points: readInteger(limits.points, {
      path: 'play/croquis.limits.points',
      fallback: 4000,
      min: 2,
    }),
  },
  feedSize: readInteger(croquis.feedSize, {
    path: 'play/croquis.feedSize',
    fallback: 40,
    min: 1,
  }),
}
