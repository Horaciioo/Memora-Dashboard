import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play'
import { GLITCH_SETTINGS } from '@/declarations/play'

/**
 * Host choices of a Glitch game
 * @typedef {Object} GlitchGameSettings
 */

export interface GlitchGameSettings {
  rounds: number
  roundSeconds: number
  differences: number
}

/**
 * Default Glitch choices
 * @return {GlitchGameSettings} - Settings
 */

export const glitchDefaults = (): GlitchGameSettings => ({
  rounds: GLITCH_SETTINGS.rounds.initial,
  roundSeconds: GLITCH_SETTINGS.roundSeconds.initial,
  differences: GLITCH_SETTINGS.differences.initial,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {GlitchGameSettings} - Settings
 */

export const glitchSettingsOf = (stored: Prisma.JsonValue): GlitchGameSettings => ({
  ...glitchDefaults(),
  ...(stored as Partial<GlitchGameSettings> | null),
})

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readGlitchSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = glitchSettingsOf(stored)
  const settings: GlitchGameSettings = {
    rounds: clampToRange(readBodyInteger(raw, 'rounds'), current.rounds, GLITCH_SETTINGS.rounds),
    roundSeconds: clampToRange(
      readBodyInteger(raw, 'roundSeconds'),
      current.roundSeconds,
      GLITCH_SETTINGS.roundSeconds
    ),
    differences: clampToRange(
      readBodyInteger(raw, 'differences'),
      current.differences,
      GLITCH_SETTINGS.differences
    ),
  }

  return settings as unknown as Prisma.InputJsonObject
}
