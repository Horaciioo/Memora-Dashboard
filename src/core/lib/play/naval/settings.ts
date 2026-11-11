import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play/parse'
import { NAVAL_MAPS, NAVAL_RANDOM_MAP } from '@/declarations/play/naval/maps'
import type { NavalRamp } from '@/declarations/play/naval/maps'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { NavalRuleName, NavalSeats } from '@/declarations/play/naval/settings'
import { NavalModes } from '@/utils/constants/play'
import type { NavalModeName } from '@/utils/constants/play'

/**
 * Host choices of a naval battle
 * @typedef {Object} NavalGameSettings
 */

export interface NavalGameSettings {
  mode: NavalModeName
  // Map key, its theatre sets the sea
  map: string
  turnSeconds: number
  placementSeconds: number
  rules: Record<NavalRuleName, boolean>
}

/**
 * Sea a fleet sails on
 * @typedef {Object} NavalSea
 * @property {number} size - Squares per side
 * @property {number[]} fleet - Ship lengths
 * @property {boolean} isSpaced - Ships never touch
 * @property {number} reachScale - Weapon reach multiplier
 * @property {NavalRamp} ramp - Strong weapons growth
 */

export interface NavalSea {
  size: number
  fleet: number[]
  isSpaced: boolean
  reachScale: number
  ramp: NavalRamp
}

// Names a body may use
const RULE_NAMES = Object.keys(NAVAL_SETTINGS.rules) as NavalRuleName[]

/**
 * Map a stored value points at, old sea formats mapped to the nearest map
 * @param {unknown} map - Stored map
 * @param {unknown} format - Stored format of an old game
 * @return {string | undefined} - Map key
 */

const mapNamed = (map: unknown, format?: unknown): string | undefined =>
  NAVAL_MAPS.keys.find((key) => key === map) ??
  NAVAL_MAPS.keys.find((key) => format && NAVAL_MAPS.get(key).legacyFormat === format)

/**
 * Map a host or a vote asks, the random card drawn here
 * @param {unknown} raw - Asked map
 * @param {() => number} [rng] - Random source
 * @return {string | undefined} - Map key
 */

export const askedMap = (raw: unknown, rng: () => number = Math.random): string | undefined =>
  raw === NAVAL_RANDOM_MAP
    ? NAVAL_MAPS.keys[Math.floor(rng() * NAVAL_MAPS.keys.length)]
    : mapNamed(raw)

/**
 * Default naval choices
 * @return {NavalGameSettings} - Settings
 */

export const navalDefaults = (): NavalGameSettings => ({
  mode: NAVAL_SETTINGS.mode,
  map: NAVAL_SETTINGS.map,
  turnSeconds: NAVAL_SETTINGS.turnSeconds.initial,
  placementSeconds: NAVAL_SETTINGS.placementSeconds.initial,
  rules: { ...NAVAL_SETTINGS.rules },
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {NavalGameSettings} - Settings
 */

export const navalSettingsOf = (stored: Prisma.JsonValue): NavalGameSettings => {
  const defaults = navalDefaults()
  const saved = (stored ?? {}) as Partial<NavalGameSettings> & { format?: unknown }

  return {
    ...defaults,
    ...saved,
    mode: Object.values(NavalModes).find((mode) => mode === saved.mode) ?? defaults.mode,
    map: mapNamed(saved.map, saved.format) ?? defaults.map,
    rules: { ...defaults.rules, ...saved.rules },
  }
}

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readNavalSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = navalSettingsOf(stored)
  const asked = (raw.rules ?? {}) as Record<string, unknown>

  const settings: NavalGameSettings = {
    mode: Object.values(NavalModes).find((mode) => mode === raw.mode) ?? current.mode,
    map: askedMap(raw.map) ?? current.map,
    turnSeconds: clampToRange(
      readBodyInteger(raw, 'turnSeconds'),
      current.turnSeconds,
      NAVAL_SETTINGS.turnSeconds
    ),
    placementSeconds: clampToRange(
      readBodyInteger(raw, 'placementSeconds'),
      current.placementSeconds,
      NAVAL_SETTINGS.placementSeconds
    ),
    rules: Object.fromEntries(
      RULE_NAMES.map((name) => [
        name,
        typeof asked[name] === 'boolean' ? asked[name] : current.rules[name],
      ])
    ) as Record<NavalRuleName, boolean>,
  }

  return settings as unknown as Prisma.InputJsonObject
}

/**
 * Sea of a game, read from the theatre of its map
 * @param {NavalGameSettings} settings - Settings
 * @return {NavalSea} - Sea
 */

export const navalSea = ({ map, rules }: NavalGameSettings): NavalSea => {
  const { size, fleet, reachScale, ramp } = (
    NAVAL_MAPS.has(map) ? NAVAL_MAPS.get(map) : NAVAL_MAPS.list[0]
  ).theatre

  return { size, fleet, isSpaced: rules.spacedShips, reachScale, ramp }
}

/**
 * Seats a game accepts
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {NavalSeats} - Bounds
 */

export const navalSeatsOf = (stored: Prisma.JsonValue): NavalSeats =>
  NAVAL_SETTINGS.seats[navalSettingsOf(stored).mode]
