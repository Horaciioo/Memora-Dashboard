import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play'
import { JUMBLE_SETTINGS } from '@/declarations/play'
import type { JumbleLevel } from '@/declarations/play/jumble/settings'

/**
 * Host choices of a Jumble game
 * @typedef {Object} JumbleGameSettings
 */

export interface JumbleGameSettings {
  rounds: number
  roundSeconds: number
  hasHint: boolean
  // Word length band
  difficulty: JumbleLevel
}

// Levels a host may pick
const LEVELS = Object.keys(JUMBLE_SETTINGS.difficulties) as JumbleLevel[]

/**
 * Default Jumble choices
 * @return {JumbleGameSettings} - Settings
 */

export const jumbleDefaults = (): JumbleGameSettings => ({
  rounds: JUMBLE_SETTINGS.rounds.initial,
  roundSeconds: JUMBLE_SETTINGS.roundSeconds.initial,
  hasHint: true,
  difficulty: JUMBLE_SETTINGS.difficulty,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {JumbleGameSettings} - Settings
 */

export const jumbleSettingsOf = (stored: Prisma.JsonValue): JumbleGameSettings => ({
  ...jumbleDefaults(),
  ...(stored as Partial<JumbleGameSettings> | null),
})

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readJumbleSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = jumbleSettingsOf(stored)
  const settings: JumbleGameSettings = {
    rounds: clampToRange(readBodyInteger(raw, 'rounds'), current.rounds, JUMBLE_SETTINGS.rounds),
    roundSeconds: clampToRange(
      readBodyInteger(raw, 'roundSeconds'),
      current.roundSeconds,
      JUMBLE_SETTINGS.roundSeconds
    ),
    hasHint: typeof raw.hasHint === 'boolean' ? raw.hasHint : current.hasHint,
    difficulty: LEVELS.find((level) => level === raw.difficulty) ?? current.difficulty,
  }

  return settings as unknown as Prisma.InputJsonObject
}
