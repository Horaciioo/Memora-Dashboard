import type { Prisma } from '@prisma/client'

import { invalidInput } from '@/core/lib/errors'
import { clampToRange, readBodyInteger, readBodyList } from '@/core/lib/play'
import { BOMB_SETTINGS, PLAY_ERRORS } from '@/declarations/play'
import type { BombDifficulty } from '@/declarations/play'

/**
 * Host choices of a Bomb Party game
 * @typedef {Object} BombGameSettings
 */

export interface BombGameSettings {
  difficulty: BombDifficulty
  // Custom difficulty threshold
  wordsPerPrompt: number
  startLives: number
  maxLives: number
  minTurnSeconds: number
  promptAge: number
  bonusAlphabet: string[]
}

// Levels a host may pick
const DIFFICULTIES: BombDifficulty[] = [
  ...(Object.keys(BOMB_SETTINGS.wordsPerPrompt) as BombDifficulty[]),
  'custom',
]

// Bounds of each numeric choice
const BOMB_RANGES = {
  wordsPerPrompt: BOMB_SETTINGS.customWordsPerPrompt,
  startLives: BOMB_SETTINGS.startLives,
  maxLives: BOMB_SETTINGS.maxLives,
  minTurnSeconds: BOMB_SETTINGS.minTurnSeconds,
  promptAge: BOMB_SETTINGS.promptAge,
}

/**
 * Default Bomb Party choices
 * @return {BombGameSettings} - Settings
 */

export const bombDefaults = (): BombGameSettings => ({
  difficulty: BOMB_SETTINGS.difficulty,
  wordsPerPrompt: BOMB_SETTINGS.customWordsPerPrompt.initial,
  startLives: BOMB_SETTINGS.startLives.initial,
  maxLives: BOMB_SETTINGS.maxLives.initial,
  minTurnSeconds: BOMB_SETTINGS.minTurnSeconds.initial,
  promptAge: BOMB_SETTINGS.promptAge.initial,
  bonusAlphabet: BOMB_SETTINGS.bonusAlphabet,
})

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {BombGameSettings} - Settings
 */

export const bombSettingsOf = (stored: Prisma.JsonValue): BombGameSettings => ({
  ...bombDefaults(),
  ...(stored as Partial<BombGameSettings> | null),
})

/**
 * Words a prompt must fit
 * @param {BombGameSettings} settings - Game settings
 * @return {number} - Threshold
 */

export const wordsNeeded = (settings: BombGameSettings): number =>
  settings.difficulty === 'custom'
    ? settings.wordsPerPrompt
    : BOMB_SETTINGS.wordsPerPrompt[settings.difficulty]

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readBombSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = bombSettingsOf(stored)
  const ranged = (field: keyof typeof BOMB_RANGES) =>
    clampToRange(readBodyInteger(raw, field), current[field], BOMB_RANGES[field])

  // Known letters only, alphabet order
  const asked = readBodyList(raw, 'bonusAlphabet')?.map((letter) => letter.toUpperCase())
  const bonusAlphabet = asked
    ? BOMB_SETTINGS.alphabet.filter((letter) => asked.includes(letter))
    : current.bonusAlphabet
  if (!bonusAlphabet.length) {
    throw invalidInput(
      [{ field: 'bonusAlphabet', message: PLAY_ERRORS.bonusEmpty }],
      PLAY_ERRORS.bonusEmpty
    )
  }

  // Ceiling never under the start
  const startLives = ranged('startLives')
  const settings: BombGameSettings = {
    difficulty: DIFFICULTIES.find((entry) => entry === raw.difficulty) ?? current.difficulty,
    wordsPerPrompt: ranged('wordsPerPrompt'),
    startLives,
    maxLives: Math.max(startLives, ranged('maxLives')),
    minTurnSeconds: ranged('minTurnSeconds'),
    promptAge: ranged('promptAge'),
    bonusAlphabet,
  }

  return settings as unknown as Prisma.InputJsonObject
}
