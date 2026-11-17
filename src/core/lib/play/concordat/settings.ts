import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger } from '@/core/lib/play/parse'
import {
  CONCORDAT_PROTECTION,
  CONCORDAT_SETTINGS,
  CONCORDAT_START_TROOPS,
  CONCORDAT_TEAMS,
} from '@/declarations/play/concordat/settings'
import { CONCORDAT_WEAPONS } from '@/utils/constants/concordat'
import type {
  ConcordatDifficultyName,
  ConcordatModeName,
  ConcordatSizeName,
  ConcordatSpeedName,
  ConcordatStyleChoice,
  ConcordatWeaponName,
} from '@/utils/constants/concordat'

/**
 * Host choices of a Concordat game
 * @typedef {Object} ConcordatGameSettings
 * @property {number | null} seed - Map seed, null for a draw at launch
 */

export interface ConcordatGameSettings {
  size: ConcordatSizeName
  style: ConcordatStyleChoice
  speed: ConcordatSpeedName
  difficulty: ConcordatDifficultyName
  durationMinutes: number
  protectionMinutes: number
  // Displayed troops of each seat at the start
  startTroops: number
  mode: ConcordatModeName
  teams: number
  weapons: ConcordatWeaponName[]
  seed: number | null
}

// Largest accepted seed
const MAX_SEED = 2_000_000_000

/**
 * Default Concordat choices
 * @return {ConcordatGameSettings} - Settings
 */

export const concordatDefaults = (): ConcordatGameSettings => ({
  size: CONCORDAT_SETTINGS.initialSize,
  style: CONCORDAT_SETTINGS.initialStyle,
  speed: CONCORDAT_SETTINGS.initialSpeed,
  difficulty: CONCORDAT_SETTINGS.initialDifficulty,
  durationMinutes: CONCORDAT_SETTINGS.unlimited,
  protectionMinutes: CONCORDAT_PROTECTION.initial,
  startTroops: CONCORDAT_START_TROOPS.initial,
  mode: CONCORDAT_SETTINGS.initialMode,
  teams: CONCORDAT_TEAMS.initial,
  weapons: [...CONCORDAT_WEAPONS],
  seed: null,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {ConcordatGameSettings} - Settings
 */

export const concordatSettingsOf = (stored: Prisma.JsonValue): ConcordatGameSettings => ({
  ...concordatDefaults(),
  ...(stored as Partial<ConcordatGameSettings> | null),
})

// One of the allowed values, else the current one
const pickOne = <T extends string>(asked: unknown, allowed: readonly T[], current: T): T =>
  allowed.includes(asked as T) ? (asked as T) : current

// Unlimited, else a length within the range
const readDuration = (asked: number | undefined, current: number): number =>
  asked === CONCORDAT_SETTINGS.unlimited
    ? asked
    : clampToRange(
        asked,
        current || CONCORDAT_SETTINGS.duration.initial,
        CONCORDAT_SETTINGS.duration
      )

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readConcordatSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = concordatSettingsOf(stored)
  const seed = 'seed' in raw ? readBodyInteger(raw, 'seed') : undefined
  const settings: ConcordatGameSettings = {
    size: pickOne(raw.size, CONCORDAT_SETTINGS.sizes, current.size),
    style: pickOne(raw.style, CONCORDAT_SETTINGS.styleChoices, current.style),
    speed: pickOne(raw.speed, CONCORDAT_SETTINGS.speeds, current.speed),
    difficulty: pickOne(raw.difficulty, CONCORDAT_SETTINGS.difficulties, current.difficulty),
    durationMinutes: readDuration(readBodyInteger(raw, 'durationMinutes'), current.durationMinutes),
    protectionMinutes: clampToRange(
      readBodyInteger(raw, 'protectionMinutes'),
      current.protectionMinutes,
      CONCORDAT_PROTECTION
    ),
    startTroops: clampToRange(
      readBodyInteger(raw, 'startTroops'),
      current.startTroops,
      CONCORDAT_START_TROOPS
    ),
    mode: pickOne(raw.mode, CONCORDAT_SETTINGS.modes, current.mode),
    teams: clampToRange(readBodyInteger(raw, 'teams'), current.teams, CONCORDAT_TEAMS),
    weapons: Array.isArray(raw.weapons)
      ? CONCORDAT_WEAPONS.filter((weapon) => (raw.weapons as unknown[]).includes(weapon))
      : current.weapons,
    // An empty seed asks for a draw
    seed:
      'seed' in raw
        ? seed !== undefined && seed >= 0 && seed <= MAX_SEED
          ? seed
          : null
        : current.seed,
  }

  return settings as unknown as Prisma.InputJsonObject
}
