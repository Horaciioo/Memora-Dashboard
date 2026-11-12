import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play'
import { CROQUIS_LEVELS, CROQUIS_SETTINGS } from '@/declarations/play'
import type { CroquisLevel } from '@/declarations/play'

/**
 * Host choices of a Croquis game
 * @typedef {Object} CroquisGameSettings
 */

export interface CroquisGameSettings {
  laps: number
  roundSeconds: number
  difficulty: CroquisLevel
  hasHint: boolean
}

/**
 * Level read from a raw value
 * @param {unknown} value - Asked level
 * @param {CroquisLevel} fallback - Level kept when the value is not one
 * @return {CroquisLevel} - Level
 */

const levelOf = (value: unknown, fallback: CroquisLevel): CroquisLevel =>
  CROQUIS_LEVELS.find((level) => level === value) ?? fallback

/**
 * Default Croquis choices
 * @return {CroquisGameSettings} - Settings
 */

export const croquisDefaults = (): CroquisGameSettings => ({
  laps: CROQUIS_SETTINGS.laps.initial,
  roundSeconds: CROQUIS_SETTINGS.roundSeconds.initial,
  difficulty: 'MEDIUM',
  hasHint: true,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {CroquisGameSettings} - Settings
 */

export const croquisSettingsOf = (stored: Prisma.JsonValue): CroquisGameSettings => ({
  ...croquisDefaults(),
  ...(stored as Partial<CroquisGameSettings> | null),
})

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readCroquisSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = croquisSettingsOf(stored)
  const settings: CroquisGameSettings = {
    laps: clampToRange(readBodyInteger(raw, 'laps'), current.laps, CROQUIS_SETTINGS.laps),
    roundSeconds: clampToRange(
      readBodyInteger(raw, 'roundSeconds'),
      current.roundSeconds,
      CROQUIS_SETTINGS.roundSeconds
    ),
    difficulty: levelOf(raw.difficulty, current.difficulty),
    hasHint: typeof raw.hasHint === 'boolean' ? raw.hasHint : current.hasHint,
  }

  return settings as unknown as Prisma.InputJsonObject
}
