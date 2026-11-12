import echo from '@/configurations/play/echo.json'
import { readBounds, readInteger, readNode } from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'

// Raw nodes
const scoring = readNode(echo.scoring, 'play/echo.scoring')

// Seat bounds
const minPlayers = readInteger(echo.minPlayers, {
  path: 'play/echo.minPlayers',
  fallback: 1,
  min: 1,
})

/**
 * Echo settings
 * @type {Object}
 */

export const ECHO_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(echo.maxPlayers, {
    path: 'play/echo.maxPlayers',
    fallback: 12,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(echo.countdownSeconds, {
    path: 'play/echo.countdownSeconds',
    fallback: 3,
    min: 0,
  }),
  // Prime order of the deck, symbols per card minus one
  order: readInteger(echo.order, { path: 'play/echo.order', fallback: 5, min: 2 }),
  rounds: readRange(echo.rounds, 'play/echo.rounds', { initial: 12, min: 3, max: 30 }),
  roundSeconds: readRange(echo.roundSeconds, 'play/echo.roundSeconds', {
    initial: 15,
    min: 8,
    max: 40,
  }),
  revealSeconds: readInteger(echo.revealSeconds, {
    path: 'play/echo.revealSeconds',
    fallback: 3,
    min: 1,
  }),
  lockMs: readInteger(echo.lockMs, { path: 'play/echo.lockMs', fallback: 1500, min: 0 }),
  // Size of a symbol against the others on a card
  scale: readBounds(echo.scale, { path: 'play/echo.scale', fallback: { min: 0.62, max: 1.3 } }),
  scoring: {
    base: readInteger(scoring.base, { path: 'play/echo.scoring.base', fallback: 10, min: 1 }),
    speedBonus: readInteger(scoring.speedBonus, {
      path: 'play/echo.scoring.speedBonus',
      fallback: 10,
      min: 0,
    }),
    firstBonus: readInteger(scoring.firstBonus, {
      path: 'play/echo.scoring.firstBonus',
      fallback: 5,
      min: 0,
    }),
  },
  feedSize: readInteger(echo.feedSize, { path: 'play/echo.feedSize', fallback: 40, min: 1 }),
}
