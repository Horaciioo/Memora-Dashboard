import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play/parse'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { NavalFormatName, NavalRuleName, NavalSeats } from '@/declarations/play/naval/settings'
import { NavalModes } from '@/utils/constants/play'
import type { NavalModeName } from '@/utils/constants/play'

/**
 * Host choices of a naval battle
 * @typedef {Object} NavalGameSettings
 */

export interface NavalGameSettings {
  mode: NavalModeName
  format: NavalFormatName
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
 */

export interface NavalSea {
  size: number
  fleet: number[]
  isSpaced: boolean
}

// Names a body may use
const RULE_NAMES = Object.keys(NAVAL_SETTINGS.rules) as NavalRuleName[]
const FORMAT_NAMES = Object.keys(NAVAL_SETTINGS.formats) as NavalFormatName[]

/**
 * Default naval choices
 * @return {NavalGameSettings} - Settings
 */

export const navalDefaults = (): NavalGameSettings => ({
  mode: NAVAL_SETTINGS.mode,
  format: NAVAL_SETTINGS.format,
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
  const saved = (stored ?? {}) as Partial<NavalGameSettings>

  return {
    ...defaults,
    ...saved,
    mode: Object.values(NavalModes).find((mode) => mode === saved.mode) ?? defaults.mode,
    format: FORMAT_NAMES.find((format) => format === saved.format) ?? defaults.format,
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
    format: FORMAT_NAMES.find((format) => format === raw.format) ?? current.format,
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
 * Sea of a game
 * @param {NavalGameSettings} settings - Settings
 * @return {NavalSea} - Sea
 */

export const navalSea = ({ format, rules }: NavalGameSettings): NavalSea => ({
  ...NAVAL_SETTINGS.formats[format],
  isSpaced: rules.spacedShips,
})

/**
 * Seats a game accepts
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {NavalSeats} - Bounds
 */

export const navalSeatsOf = (stored: Prisma.JsonValue): NavalSeats =>
  NAVAL_SETTINGS.seats[navalSettingsOf(stored).mode]
