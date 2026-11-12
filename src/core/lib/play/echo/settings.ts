import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play'
import { ECHO_SETTINGS } from '@/declarations/play'

/**
 * Host choices of an Echo game
 * @typedef {Object} EchoGameSettings
 */

export interface EchoGameSettings {
  rounds: number
  roundSeconds: number
}

/**
 * Default Echo choices
 * @return {EchoGameSettings} - Settings
 */

export const echoDefaults = (): EchoGameSettings => ({
  rounds: ECHO_SETTINGS.rounds.initial,
  roundSeconds: ECHO_SETTINGS.roundSeconds.initial,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {EchoGameSettings} - Settings
 */

export const echoSettingsOf = (stored: Prisma.JsonValue): EchoGameSettings => ({
  ...echoDefaults(),
  ...(stored as Partial<EchoGameSettings> | null),
})

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readEchoSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = echoSettingsOf(stored)
  const settings: EchoGameSettings = {
    rounds: clampToRange(readBodyInteger(raw, 'rounds'), current.rounds, ECHO_SETTINGS.rounds),
    roundSeconds: clampToRange(
      readBodyInteger(raw, 'roundSeconds'),
      current.roundSeconds,
      ECHO_SETTINGS.roundSeconds
    ),
  }

  return settings as unknown as Prisma.InputJsonObject
}
