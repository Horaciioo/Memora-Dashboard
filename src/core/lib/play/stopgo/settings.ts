import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play/parse'
import { STOPGO_SETTINGS } from '@/declarations/play/stopgo/settings'

/**
 * Host choices of a Stop & Go race
 * @typedef {Object} StopGoGameSettings
 * @property {number} target - Distance to reach
 * @property {number} turnSeconds - Clock of a turn
 * @property {boolean} safeties - Safeties shuffled in the deck
 */

export interface StopGoGameSettings {
  target: number
  turnSeconds: number
  safeties: boolean
}

/**
 * Default race choices
 * @return {StopGoGameSettings} - Settings
 */

export const stopGoDefaults = (): StopGoGameSettings => ({
  target: STOPGO_SETTINGS.target,
  turnSeconds: STOPGO_SETTINGS.turnSeconds.initial,
  safeties: STOPGO_SETTINGS.safeties,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {StopGoGameSettings} - Settings
 */

export const stopGoSettingsOf = (stored: Prisma.JsonValue): StopGoGameSettings => ({
  ...stopGoDefaults(),
  ...(stored as Partial<StopGoGameSettings> | null),
})

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readStopGoSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = stopGoSettingsOf(stored)
  const asked = readBodyInteger(raw, 'target')
  const settings: StopGoGameSettings = {
    target: STOPGO_SETTINGS.targets.includes(asked ?? 0) ? asked! : current.target,
    turnSeconds: clampToRange(
      readBodyInteger(raw, 'turnSeconds'),
      current.turnSeconds,
      STOPGO_SETTINGS.turnSeconds
    ),
    safeties: typeof raw.safeties === 'boolean' ? raw.safeties : current.safeties,
  }

  return settings as unknown as Prisma.InputJsonObject
}
