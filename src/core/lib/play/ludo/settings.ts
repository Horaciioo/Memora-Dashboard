import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play/parse'
import { LUDO_SETTINGS, LudoEndings } from '@/declarations/play/ludo/settings'
import type { LudoEndingName, LudoExitRule, LudoRuleName } from '@/declarations/play/ludo/settings'

/**
 * Host choices of a Ludo game
 * @typedef {Object} LudoGameSettings
 */

export interface LudoGameSettings {
  pawns: number
  turnSeconds: number
  exit: LudoExitRule
  // Faces of the exit rule, kept with it
  exitFaces: number[]
  ending: LudoEndingName
  rules: Record<LudoRuleName, boolean>
}

// Rules a host may switch
const RULE_NAMES = Object.keys(LUDO_SETTINGS.rules) as LudoRuleName[]
const EXIT_RULES = Object.keys(LUDO_SETTINGS.exits) as LudoExitRule[]

/**
 * Default Ludo choices
 * @return {LudoGameSettings} - Settings
 */

export const ludoDefaults = (): LudoGameSettings => ({
  pawns: LUDO_SETTINGS.pawns.initial,
  turnSeconds: LUDO_SETTINGS.turnSeconds.initial,
  exit: LUDO_SETTINGS.exit,
  exitFaces: LUDO_SETTINGS.exits[LUDO_SETTINGS.exit],
  ending: LUDO_SETTINGS.ending,
  rules: { ...LUDO_SETTINGS.rules },
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {LudoGameSettings} - Settings
 */

export const ludoSettingsOf = (stored: Prisma.JsonValue): LudoGameSettings => {
  const defaults = ludoDefaults()
  const saved = (stored ?? {}) as Partial<LudoGameSettings>
  const exit = EXIT_RULES.find((rule) => rule === saved.exit) ?? defaults.exit

  return {
    ...defaults,
    ...saved,
    exit,
    exitFaces: LUDO_SETTINGS.exits[exit],
    rules: { ...defaults.rules, ...saved.rules },
  }
}

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readLudoSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = ludoSettingsOf(stored)
  const asked = (raw.rules ?? {}) as Record<string, unknown>
  const exit = EXIT_RULES.find((rule) => rule === raw.exit) ?? current.exit

  const settings: LudoGameSettings = {
    pawns: clampToRange(readBodyInteger(raw, 'pawns'), current.pawns, LUDO_SETTINGS.pawns),
    turnSeconds: clampToRange(
      readBodyInteger(raw, 'turnSeconds'),
      current.turnSeconds,
      LUDO_SETTINGS.turnSeconds
    ),
    exit,
    exitFaces: LUDO_SETTINGS.exits[exit],
    ending: Object.values(LudoEndings).find((ending) => ending === raw.ending) ?? current.ending,
    rules: Object.fromEntries(
      RULE_NAMES.map((name) => [
        name,
        typeof asked[name] === 'boolean' ? asked[name] : current.rules[name],
      ])
    ) as Record<LudoRuleName, boolean>,
  }

  return settings as unknown as Prisma.InputJsonObject
}
