import baccalaureat from '@/configurations/play/baccalaureat.json'
import play from '@/configurations/play/play.json'
import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
  readNumber,
  readString,
  readStringList,
} from '@/declarations/configurations/readers'
import { BACCALAUREAT_CATEGORIES } from '@/declarations/play/baccalaureat/categories'
import { BACCALAUREAT_PACKS } from '@/declarations/play/baccalaureat/packs'

/**
 * Setting the host picks inside bounds
 * @typedef {Object} PlayRange
 * @property {number} initial - Default value
 * @property {number} min - Lowest
 * @property {number} max - Highest
 */

export interface PlayRange {
  initial: number
  min: number
  max: number
}

/**
 * Read a host range
 * @param {unknown} value - Raw node
 * @param {string} path - Config path
 * @param {PlayRange} fallback - Fallback range
 * @return {PlayRange} - Bounded range
 */

const readRange = (value: unknown, path: string, fallback: PlayRange): PlayRange => {
  const node = readNode(value, path)
  const min = readInteger(node.min, { path: `${path}.min`, fallback: fallback.min, min: 1 })
  const max = readInteger(node.max, { path: `${path}.max`, fallback: fallback.max, min })
  const initial = readInteger(node.default, {
    path: `${path}.default`,
    fallback: fallback.initial,
    min,
    max,
  })

  return { initial, min, max }
}

// Raw nodes
const xp = readNode(play.xp, 'play/play.xp')
const levels = readNode(play.levels, 'play/play.levels')
const tournament = readNode(play.tournament, 'play/play.tournament')
const rewards = readNode(play.rewards, 'play/play.rewards')
const admin = readNode(play.admin, 'play/play.admin')
const stop = readNode(baccalaureat.stop, 'play/baccalaureat.stop')
const points = readNode(baccalaureat.points, 'play/baccalaureat.points')
const flash = readNode(baccalaureat.flash, 'play/baccalaureat.flash')

// Tournament game bounds
const minGames = readInteger(tournament.minGames, {
  path: 'play/play.tournament.minGames',
  fallback: 2,
  min: 2,
})

/**
 * Settings shared by every game
 * @type {Object}
 */

export const PLAY_SETTINGS = {
  xp: {
    win: readInteger(xp.win, { path: 'play/play.xp.win', fallback: 150, min: 0 }),
    draw: readInteger(xp.draw, { path: 'play/play.xp.draw', fallback: 100, min: 0 }),
    loss: readInteger(xp.loss, { path: 'play/play.xp.loss', fallback: 50, min: 0 }),
  },
  levels: {
    max: readInteger(levels.max, { path: 'play/play.levels.max', fallback: 100, min: 1 }),
    base: readInteger(levels.base, { path: 'play/play.levels.base', fallback: 40, min: 1 }),
    growth: readNumber(levels.growth, { path: 'play/play.levels.growth', fallback: 1, min: 1 }),
  },
  tournament: {
    minGames,
    maxGames: readInteger(tournament.maxGames, {
      path: 'play/play.tournament.maxGames',
      fallback: 7,
      min: minGames,
    }),
    bonusPerGame: readNumber(tournament.bonusPerGame, {
      path: 'play/play.tournament.bonusPerGame',
      fallback: 0.5,
      min: 0,
    }),
  },
  rewards: {
    minPlayers: readInteger(rewards.minPlayers, {
      path: 'play/play.rewards.minPlayers',
      fallback: 2,
      min: 1,
    }),
    minSeconds: readInteger(rewards.minSeconds, {
      path: 'play/play.rewards.minSeconds',
      fallback: 60,
      min: 0,
    }),
  },
  lobbyIdleMinutes: readInteger(play.lobbyIdleMinutes, {
    path: 'play/play.lobbyIdleMinutes',
    fallback: 30,
    min: 1,
  }),
  seatColors: readInteger(play.seatColors, { path: 'play/play.seatColors', fallback: 12, min: 2 }),
  admin: {
    maxXpChange: readInteger(admin.maxXpChange, {
      path: 'play/play.admin.maxXpChange',
      fallback: 10000,
      min: 1,
    }),
    maxCounter: readInteger(admin.maxCounter, {
      path: 'play/play.admin.maxCounter',
      fallback: 100000,
      min: 1,
    }),
  },
  leaderboardSize: readInteger(play.leaderboardSize, {
    path: 'play/play.leaderboardSize',
    fallback: 20,
    min: 1,
  }),
}

// Seat bounds
const minPlayers = readInteger(baccalaureat.minPlayers, {
  path: 'play/baccalaureat.minPlayers',
  fallback: 2,
  min: 1,
})

// Letter sets
const alphabet = readString(baccalaureat.alphabet, {
  path: 'play/baccalaureat.alphabet',
  fallback: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
})

/**
 * Baccalaureat settings
 * @type {Object}
 */

export const BACCALAUREAT_SETTINGS = {
  minPlayers,
  maxPlayers: readInteger(baccalaureat.maxPlayers, {
    path: 'play/baccalaureat.maxPlayers',
    fallback: 6,
    min: minPlayers,
  }),
  countdownSeconds: readInteger(baccalaureat.countdownSeconds, {
    path: 'play/baccalaureat.countdownSeconds',
    fallback: 5,
    min: 0,
  }),
  roundSeconds: readRange(baccalaureat.roundSeconds, 'play/baccalaureat.roundSeconds', {
    initial: 120,
    min: 30,
    max: 600,
  }),
  rounds: readRange(baccalaureat.rounds, 'play/baccalaureat.rounds', {
    initial: 5,
    min: 1,
    max: 26,
  }),
  categories: readRange(baccalaureat.categories, 'play/baccalaureat.categories', {
    initial: 6,
    min: 3,
    max: 12,
  }),
  customCategories: readInteger(baccalaureat.customCategories, {
    path: 'play/baccalaureat.customCategories',
    fallback: 4,
    min: 0,
  }),
  categoryLength: readInteger(baccalaureat.categoryLength, {
    path: 'play/baccalaureat.categoryLength',
    fallback: 32,
    min: 1,
  }),
  wordLength: readInteger(baccalaureat.wordLength, {
    path: 'play/baccalaureat.wordLength',
    fallback: 40,
    min: 1,
  }),
  stop: {
    enabled: readBoolean(stop.enabled, { path: 'play/baccalaureat.stop.enabled', fallback: true }),
    graceSeconds: readInteger(stop.graceSeconds, {
      path: 'play/baccalaureat.stop.graceSeconds',
      fallback: 10,
      min: 0,
    }),
  },
  submitGraceSeconds: readInteger(baccalaureat.submitGraceSeconds, {
    path: 'play/baccalaureat.submitGraceSeconds',
    fallback: 2,
    min: 0,
  }),
  reviewSeconds: readInteger(baccalaureat.reviewSeconds, {
    path: 'play/baccalaureat.reviewSeconds',
    fallback: 60,
    min: 5,
  }),
  rejectShare: readNumber(baccalaureat.rejectShare, {
    path: 'play/baccalaureat.rejectShare',
    fallback: 0.5,
    min: 0,
    max: 1,
  }),
  points: {
    solo: readInteger(points.solo, { path: 'play/baccalaureat.points.solo', fallback: 15, min: 0 }),
    unique: readInteger(points.unique, {
      path: 'play/baccalaureat.points.unique',
      fallback: 10,
      min: 0,
    }),
    shared: readInteger(points.shared, {
      path: 'play/baccalaureat.points.shared',
      fallback: 5,
      min: 0,
    }),
    stopBonus: readInteger(points.stopBonus, {
      path: 'play/baccalaureat.points.stopBonus',
      fallback: 5,
      min: 0,
    }),
  },
  jokersPerPlayer: readInteger(baccalaureat.jokersPerPlayer, {
    path: 'play/baccalaureat.jokersPerPlayer',
    fallback: 1,
    min: 0,
  }),
  flash: {
    roundSeconds: readInteger(flash.roundSeconds, {
      path: 'play/baccalaureat.flash.roundSeconds',
      fallback: 30,
      min: 1,
    }),
    pack: readChoice(flash.pack, {
      path: 'play/baccalaureat.flash.pack',
      fallback: 'flash',
      allowed: Object.keys(BACCALAUREAT_PACKS) as (keyof typeof BACCALAUREAT_PACKS)[],
    }),
  },
  alphabet: [...alphabet.toUpperCase()],
  letters: [
    ...readString(baccalaureat.letters, {
      path: 'play/baccalaureat.letters',
      fallback: alphabet,
    }).toUpperCase(),
  ].filter((letter) => alphabet.includes(letter)),
  defaultCategories: readStringList(baccalaureat.defaultCategories, {
    path: 'play/baccalaureat.defaultCategories',
    fallback: ['firstName', 'country', 'city', 'animal', 'job', 'fruitVegetable'],
    allowed: Object.keys(BACCALAUREAT_CATEGORIES),
  }),
}
