import bots from '@/configurations/play/bots.json'
import {
  readBounds,
  readNode,
  readNumber,
  readStringList,
} from '@/declarations/configurations/readers'
import type { Bounds } from '@/declarations/configurations/readers'
import { PlayBotKinds, PlayGames } from '@/utils/constants/play'
import type { PlayBotKindName, PlayGameName } from '@/utils/constants/play'

// Games whose bots sleep
const ASLEEP_GAMES: readonly PlayGameName[] = [PlayGames.Golf]

/**
 * Bots of a game are awake
 * @param {PlayGameName} game - Game
 * @return {boolean} - Awake
 */

export const areBotsAwake = (game: PlayGameName): boolean => !ASLEEP_GAMES.includes(game)

// Raw nodes
const ludo = readNode(bots.ludo, 'play/bots.ludo')
const bomb = readNode(bots.bomb, 'play/bots.bomb')
const baccalaureat = readNode(bots.baccalaureat, 'play/bots.baccalaureat')
const golf = readNode(bots.golf, 'play/bots.golf')
const naval = readNode(bots.naval, 'play/bots.naval')

// Levels in menu order
const LEVELS = Object.values(PlayBotKinds)

/**
 * Number read per level
 * @param {unknown} value - Raw node
 * @param {string} path - Config path
 * @param {number} fallback - Fallback value
 * @return {Record<PlayBotKindName, number>} - Per level
 */

const perLevel = (
  value: unknown,
  path: string,
  fallback: number
): Record<PlayBotKindName, number> => {
  const node = readNode(value, path)

  return Object.fromEntries(
    LEVELS.map((level) => [
      level,
      readNumber(node[level], { path: `${path}.${level}`, fallback, min: 0 }),
    ])
  ) as Record<PlayBotKindName, number>
}

/**
 * Milliseconds range
 * @param {unknown} value - Raw node
 * @param {string} path - Config path
 * @return {Bounds} - Range
 */

const delay = (value: unknown, path: string): Bounds =>
  readBounds(value, { path, fallback: { min: 1000, max: 2500 } })

// Writing moment per level
const writeAt = readNode(baccalaureat.writeAt, 'play/bots.baccalaureat.writeAt')

/**
 * Bot tuning per game and level
 * @type {object}
 */

export const PLAY_BOT_SETTINGS = {
  // Share of seats for bots
  seatShare: readNumber(bots.seatShare, { path: 'play/bots.seatShare', fallback: 0.5, min: 0 }),
  callsigns: readStringList(bots.callsigns, { path: 'play/bots.callsigns', fallback: ['Alpha'] }),
  ludo: { thinkMs: delay(ludo.thinkMs, 'play/bots.ludo.thinkMs') },
  naval: {
    thinkMs: delay(naval.thinkMs, 'play/bots.naval.thinkMs'),
    mistakeRate: perLevel(naval.mistakeRate, 'play/bots.naval.mistakeRate', 0.2),
  },
  bomb: {
    thinkMs: delay(bomb.thinkMs, 'play/bots.bomb.thinkMs'),
    failRate: perLevel(bomb.failRate, 'play/bots.bomb.failRate', 0.1),
  },
  baccalaureat: {
    holeRate: perLevel(baccalaureat.holeRate, 'play/bots.baccalaureat.holeRate', 0.3),
    writeAt: Object.fromEntries(
      LEVELS.map((level) => [
        level,
        readBounds(writeAt[level], {
          path: `play/bots.baccalaureat.writeAt.${level}`,
          fallback: { min: 0.6, max: 0.85 },
        }),
      ])
    ) as Record<PlayBotKindName, Bounds>,
    typoRate: perLevel(baccalaureat.typoRate, 'play/bots.baccalaureat.typoRate', 0.06),
    blunderRate: perLevel(baccalaureat.blunderRate, 'play/bots.baccalaureat.blunderRate', 0.02),
    voteMs: delay(baccalaureat.voteMs, 'play/bots.baccalaureat.voteMs'),
  },
  golf: {
    thinkMs: delay(golf.thinkMs, 'play/bots.golf.thinkMs'),
    candidates: readNumber(golf.candidates, {
      path: 'play/bots.golf.candidates',
      fallback: 48,
      min: 8,
    }),
    angleNoise: perLevel(golf.angleNoise, 'play/bots.golf.angleNoise', 0.07),
    powerNoise: perLevel(golf.powerNoise, 'play/bots.golf.powerNoise', 0.12),
  },
}

/**
 * Level names shown to the host
 * @type {Record<PlayBotKindName, string>}
 */

export const PLAY_BOT_LEVEL_LABELS: Record<PlayBotKindName, string> = {
  EASY: 'Facile',
  MEDIUM: 'Moyen',
  HARD: 'Difficile',
}

/**
 * Robot portrait per level
 * @type {Record<PlayBotKindName, string>}
 */

export const PLAY_BOT_AVATARS: Record<PlayBotKindName, string> = {
  EASY: '/play/bots/easy.svg',
  MEDIUM: '/play/bots/medium.svg',
  HARD: '/play/bots/hard.svg',
}

/**
 * Levels offered per game, one for Ludo
 * @param {PlayGameName} game - Game
 * @return {PlayBotKindName[]} - Levels
 */

export const botLevelsOf = (game: PlayGameName): PlayBotKindName[] =>
  game === PlayGames.Ludo ? [PlayBotKinds.Medium] : LEVELS

/**
 * Bot copy
 * @type {Record<string, string>}
 */

export const PLAY_BOT_COPY = {
  add: 'Ajouter un bot',
  fill: 'Compléter avec des bots',
  badge: 'Bot',
  level: 'Niveau du bot',
  added: 'Bot ajouté',
  filled: 'Table complétée',
}

/**
 * Seat note of a bot
 * @param {PlayBotKindName} level - Level
 * @return {string} - Note
 */

export const botSeatNote = (level: PlayBotKindName): string =>
  `${PLAY_BOT_COPY.badge} ${PLAY_BOT_LEVEL_LABELS[level].toLowerCase()}`
