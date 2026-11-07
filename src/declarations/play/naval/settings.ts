import naval from '@/configurations/play/naval.json'
import {
  readBoolean,
  readChoice,
  readInteger,
  readNode,
} from '@/declarations/configurations/readers'
import { readRange } from '@/declarations/play/settings'
import { NavalModes } from '@/utils/constants/play'
import type { NavalModeName } from '@/utils/constants/play'

// Raw nodes
const modes = readNode(naval.modes, 'play/naval.modes')
const formats = readNode(naval.formats, 'play/naval.formats')
const rules = readNode(naval.rules, 'play/naval.rules')
const winnerXp = readNode(naval.winnerXp, 'play/naval.winnerXp')

/**
 * Seats a mode accepts
 * @typedef {Object} NavalSeats
 * @property {number} min - Fewest players
 * @property {number} max - Most players
 */

export interface NavalSeats {
  min: number
  max: number
}

/**
 * Seat bounds of each mode
 * @type {Record<NavalModeName, NavalSeats>}
 */

const SEATS = Object.fromEntries(
  Object.values(NavalModes).map((mode) => {
    const node = readNode(modes[mode], `play/naval.modes.${mode}`)

    return [
      mode,
      {
        min: readInteger(node.min, { path: `play/naval.modes.${mode}.min`, fallback: 2, min: 2 }),
        max: readInteger(node.max, { path: `play/naval.modes.${mode}.max`, fallback: 8, min: 2 }),
      },
    ]
  })
) as Record<NavalModeName, NavalSeats>

/**
 * Sea and fleet of a format
 * @typedef {Object} NavalFormat
 * @property {number} size - Squares per side
 * @property {number[]} fleet - Ship lengths
 */

export interface NavalFormat {
  size: number
  fleet: number[]
}

/**
 * Format read from the config
 * @param {string} key - Format key
 * @param {NavalFormat} fallback - Fallback format
 * @return {NavalFormat} - Format
 */

const readFormat = (key: string, fallback: NavalFormat): NavalFormat => {
  const node = readNode(formats[key], `play/naval.formats.${key}`)
  const fleet = Array.isArray(node.fleet) ? (node.fleet as unknown[]) : fallback.fleet
  const size = readInteger(node.size, {
    path: `play/naval.formats.${key}.size`,
    fallback: fallback.size,
    min: 6,
    max: 12,
  })

  return {
    size,
    fleet: fleet.map((length, index) =>
      readInteger(length, {
        path: `play/naval.formats.${key}.fleet.${index}`,
        fallback: 2,
        min: 1,
        max: size,
      })
    ),
  }
}

/**
 * Formats a host can pick
 * @type {Object}
 */

const FORMATS = {
  compact: readFormat('compact', { size: 8, fleet: [4, 3, 3, 2, 2] }),
  classic: readFormat('classic', { size: 10, fleet: [5, 4, 3, 3, 2] }),
}

export type NavalFormatName = keyof typeof FORMATS

/**
 * Switchable house rules
 * @type {Record<string, boolean>}
 */

const RULES = {
  hitReplay: readBoolean(rules.hitReplay, { path: 'play/naval.rules.hitReplay', fallback: true }),
  spacedShips: readBoolean(rules.spacedShips, {
    path: 'play/naval.rules.spacedShips',
    fallback: false,
  }),
}

export type NavalRuleName = keyof typeof RULES

/**
 * Naval battle settings
 * @type {Object}
 */

export const NAVAL_SETTINGS = {
  minPlayers: readInteger(naval.minPlayers, { path: 'play/naval.minPlayers', fallback: 2, min: 2 }),
  maxPlayers: readInteger(naval.maxPlayers, { path: 'play/naval.maxPlayers', fallback: 8, min: 2 }),
  seats: SEATS,
  mode: readChoice<NavalModeName>(naval.mode, {
    path: 'play/naval.mode',
    fallback: NavalModes.Duel,
    allowed: Object.values(NavalModes),
  }),
  formats: FORMATS,
  format: readChoice<NavalFormatName>(naval.format, {
    path: 'play/naval.format',
    fallback: 'compact',
    allowed: Object.keys(FORMATS) as NavalFormatName[],
  }),
  rules: RULES,
  countdownSeconds: readInteger(naval.countdownSeconds, {
    path: 'play/naval.countdownSeconds',
    fallback: 4,
    min: 0,
  }),
  placementSeconds: readRange(naval.placementSeconds, 'play/naval.placementSeconds', {
    initial: 75,
    min: 30,
    max: 180,
  }),
  turnSeconds: readRange(naval.turnSeconds, 'play/naval.turnSeconds', {
    initial: 25,
    min: 10,
    max: 60,
  }),
  graceSeconds: readInteger(naval.graceSeconds, {
    path: 'play/naval.graceSeconds',
    fallback: 1,
    min: 0,
  }),
  strikesToForfeit: readInteger(naval.strikesToForfeit, {
    path: 'play/naval.strikesToForfeit',
    fallback: 3,
    min: 1,
  }),
  flightMs: readInteger(naval.flightMs, { path: 'play/naval.flightMs', fallback: 1500, min: 200 }),
  impactMs: readInteger(naval.impactMs, { path: 'play/naval.impactMs', fallback: 900, min: 100 }),
  sunkMs: readInteger(naval.sunkMs, { path: 'play/naval.sunkMs', fallback: 1500, min: 100 }),
  roundPauseSeconds: readInteger(naval.roundPauseSeconds, {
    path: 'play/naval.roundPauseSeconds',
    fallback: 5,
    min: 0,
  }),
  alertSeconds: readInteger(naval.alertSeconds, {
    path: 'play/naval.alertSeconds',
    fallback: 5,
    min: 0,
  }),
  // Winner XP over a normal game
  winnerXp: {
    [NavalModes.Duel]: 1,
    [NavalModes.Melee]: readInteger(winnerXp.melee, {
      path: 'play/naval.winnerXp.melee',
      fallback: 2,
      min: 1,
    }),
    [NavalModes.Bracket]: readInteger(winnerXp.bracket, {
      path: 'play/naval.winnerXp.bracket',
      fallback: 3,
      min: 1,
    }),
  } as Record<NavalModeName, number>,
}
