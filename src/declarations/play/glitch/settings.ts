import glitch from '@/configurations/play/glitch.json'
import {
  readBounds,
  readInteger,
  readNode,
  readNumber,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const scene = readNode(glitch.scene, 'play/glitch.scene')
const scoring = readNode(glitch.scoring, 'play/glitch.scoring')

// Seat bounds
const minPlayers = readInteger(glitch.minPlayers, {
  path: 'play/glitch.minPlayers',
  fallback: 1,
  min: 1,
})

/**
 * Glitch settings
 * @type {Object}
 */

export const GLITCH_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(glitch.maxPlayers, {
    path: 'play/glitch.maxPlayers',
    fallback: 12,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(glitch.countdownSeconds, {
    path: 'play/glitch.countdownSeconds',
    fallback: 3,
    min: 0,
  }),
  rounds: readRange(glitch.rounds, 'play/glitch.rounds', { initial: 6, min: 3, max: 20 }),
  roundSeconds: readRange(glitch.roundSeconds, 'play/glitch.roundSeconds', {
    initial: 60,
    min: 20,
    max: 180,
  }),
  differences: readRange(glitch.differences, 'play/glitch.differences', {
    initial: 5,
    min: 3,
    max: 10,
  }),
  revealSeconds: readInteger(glitch.revealSeconds, {
    path: 'play/glitch.revealSeconds',
    fallback: 5,
    min: 1,
  }),
  lockMs: readInteger(glitch.lockMs, { path: 'play/glitch.lockMs', fallback: 1500, min: 0 }),
  // Slack around a difference that still counts as a hit, in picture units
  tolerance: readNumber(glitch.tolerance, {
    path: 'play/glitch.tolerance',
    fallback: 2.5,
    min: 0,
    max: 10,
  }),
  // Least distance between two differences, in picture units
  spread: readNumber(glitch.spread, { path: 'play/glitch.spread', fallback: 19, min: 0, max: 60 }),
  scene: {
    width: readInteger(scene.width, { path: 'play/glitch.scene.width', fallback: 100, min: 40 }),
    height: readInteger(scene.height, { path: 'play/glitch.scene.height', fallback: 75, min: 30 }),
    cols: readInteger(scene.cols, { path: 'play/glitch.scene.cols', fallback: 7, min: 3 }),
    rows: readInteger(scene.rows, { path: 'play/glitch.scene.rows', fallback: 5, min: 3 }),
    items: readBounds(scene.items, {
      path: 'play/glitch.scene.items',
      fallback: { min: 16, max: 24 },
    }),
    size: readBounds(scene.size, {
      path: 'play/glitch.scene.size',
      fallback: { min: 4.2, max: 5.8 },
    }),
  },
  scoring: {
    perFind: readInteger(scoring.perFind, {
      path: 'play/glitch.scoring.perFind',
      fallback: 2,
      min: 0,
    }),
    finishBonus: readInteger(scoring.finishBonus, {
      path: 'play/glitch.scoring.finishBonus',
      fallback: 12,
      min: 0,
    }),
    finishStep: readInteger(scoring.finishStep, {
      path: 'play/glitch.scoring.finishStep',
      fallback: 3,
      min: 0,
    }),
    finishFloor: readInteger(scoring.finishFloor, {
      path: 'play/glitch.scoring.finishFloor',
      fallback: 2,
      min: 0,
    }),
    speedBonus: readInteger(scoring.speedBonus, {
      path: 'play/glitch.scoring.speedBonus',
      fallback: 10,
      min: 0,
    }),
  },
  feedSize: readInteger(glitch.feedSize, { path: 'play/glitch.feedSize', fallback: 40, min: 1 }),
}
