import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play'
import { SUSPENS_SETTINGS } from '@/declarations/play'

/**
 * Host choices of a Suspens game
 * @typedef {Object} SuspensGameSettings
 */

export interface SuspensGameSettings {
  laps: number
  errors: number
  turnSeconds: number
  pickSeconds: number
}

/**
 * Default Suspens choices
 * @return {SuspensGameSettings} - Settings
 */

export const suspensDefaults = (): SuspensGameSettings => ({
  laps: SUSPENS_SETTINGS.laps.initial,
  errors: SUSPENS_SETTINGS.errors.initial,
  turnSeconds: SUSPENS_SETTINGS.turnSeconds.initial,
  pickSeconds: SUSPENS_SETTINGS.pickSeconds.initial,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {SuspensGameSettings} - Settings
 */

export const suspensSettingsOf = (stored: Prisma.JsonValue): SuspensGameSettings => ({
  ...suspensDefaults(),
  ...(stored as Partial<SuspensGameSettings> | null),
})

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readSuspensSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = suspensSettingsOf(stored)
  const ranged = (field: 'laps' | 'errors' | 'turnSeconds' | 'pickSeconds') =>
    clampToRange(readBodyInteger(raw, field), current[field], SUSPENS_SETTINGS[field])
  const settings: SuspensGameSettings = {
    laps: ranged('laps'),
    errors: ranged('errors'),
    turnSeconds: ranged('turnSeconds'),
    pickSeconds: ranged('pickSeconds'),
  }

  return settings as unknown as Prisma.InputJsonObject
}
