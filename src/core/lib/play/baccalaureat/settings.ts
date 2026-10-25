import type { Prisma } from '@prisma/client'

import { invalidInput } from '@/core/lib/errors'
import { readBodyInteger, readBodyList } from '@/core/lib/play'
import {
  BACCALAUREAT_CATEGORIES,
  BACCALAUREAT_SETTINGS,
  PLAY_ERRORS,
  fillPlayMessage,
  isBaccalaureatCategory,
} from '@/declarations/play'

/**
 * One category of a game
 * @typedef {Object} BaccalaureatCategory
 * @property {string} id - Catalogue key or custom id
 * @property {string} label - Display name
 */

export interface BaccalaureatCategory {
  id: string
  label: string
}

/**
 * Host choices of a Baccalaureat game
 * @typedef {Object} BaccalaureatGameSettings
 */

export interface BaccalaureatGameSettings {
  categories: BaccalaureatCategory[]
  letters: string[]
  rounds: number
  roundSeconds: number
  stop: boolean
}

// Prefix of host-written categories
const CUSTOM_PREFIX = 'custom-'

/**
 * Custom category check
 * @param {string} id - Category id
 * @return {boolean} - Written by the host
 */

export const isCustomCategory = (id: string): boolean => id.startsWith(CUSTOM_PREFIX)

/**
 * Catalogue entry as a game category
 * @param {string} key - Catalogue key
 * @return {BaccalaureatCategory} - Category
 */

const catalogued = (key: keyof typeof BACCALAUREAT_CATEGORIES): BaccalaureatCategory => ({
  id: key,
  label: BACCALAUREAT_CATEGORIES[key].label,
})

/**
 * Reject a setting
 * @param {string} field - Field
 * @param {string} message - Message
 * @return {never} - Throws
 */

const refuse = (field: string, message: string): never => {
  throw invalidInput([{ field, message }], message)
}

/**
 * Clamp into a range
 * @param {number | undefined} value - Asked value
 * @param {number} fallback - Current value
 * @param {{ min: number, max: number }} range - Bounds
 * @return {number} - Bounded value
 */

const within = (
  value: number | undefined,
  fallback: number,
  range: { min: number; max: number }
): number => Math.min(range.max, Math.max(range.min, value ?? fallback))

/**
 * Default Baccalaureat choices
 * @return {BaccalaureatGameSettings} - Settings
 */

export const baccalaureatDefaults = (): BaccalaureatGameSettings => ({
  categories: BACCALAUREAT_SETTINGS.defaultCategories
    .filter(isBaccalaureatCategory)
    .map(catalogued),
  letters: BACCALAUREAT_SETTINGS.letters,
  rounds: BACCALAUREAT_SETTINGS.rounds.initial,
  roundSeconds: BACCALAUREAT_SETTINGS.roundSeconds.initial,
  stop: BACCALAUREAT_SETTINGS.stop.enabled,
})

/**
 * Categories asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {BaccalaureatCategory[]} current - Current ones
 * @return {BaccalaureatCategory[]} - Checked categories
 */

const readCategories = (
  raw: Record<string, unknown>,
  current: BaccalaureatCategory[]
): BaccalaureatCategory[] => {
  const keys = readBodyList(raw, 'categories')
  const customs = readBodyList(raw, 'customCategories')
  if (!keys && !customs) return current

  // Custom labels, deduplicated
  const labels = [
    ...new Set(
      (
        customs ?? current.filter((entry) => isCustomCategory(entry.id)).map((entry) => entry.label)
      ).filter(Boolean)
    ),
  ]
  if (labels.length > BACCALAUREAT_SETTINGS.customCategories) {
    refuse(
      'customCategories',
      fillPlayMessage(PLAY_ERRORS.customCount, { max: BACCALAUREAT_SETTINGS.customCategories })
    )
  }

  const picked =
    keys ?? current.filter((entry) => !isCustomCategory(entry.id)).map((entry) => entry.id)
  const categories = [
    ...[...new Set(picked)].filter(isBaccalaureatCategory).map(catalogued),
    ...labels.map((label, index) => ({
      id: `${CUSTOM_PREFIX}${index + 1}`,
      label: label.slice(0, BACCALAUREAT_SETTINGS.categoryLength),
    })),
  ]

  // Count inside the configured range
  const { min, max } = BACCALAUREAT_SETTINGS.categories
  if (categories.length < min || categories.length > max) {
    refuse('categories', fillPlayMessage(PLAY_ERRORS.categoryCount, { min, max }))
  }

  return categories
}

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readBaccalaureatSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = {
    ...baccalaureatDefaults(),
    ...(stored as Partial<BaccalaureatGameSettings> | null),
  }
  const rounds = within(
    readBodyInteger(raw, 'rounds'),
    current.rounds,
    BACCALAUREAT_SETTINGS.rounds
  )

  // Letters of the alphabet only
  const asked = readBodyList(raw, 'letters')?.map((letter) => letter.toUpperCase())
  const letters = asked
    ? [...new Set(asked)].filter((letter) => BACCALAUREAT_SETTINGS.alphabet.includes(letter))
    : current.letters
  if (letters.length < rounds) refuse('letters', PLAY_ERRORS.letterCount)

  const settings: BaccalaureatGameSettings = {
    categories: readCategories(raw, current.categories),
    letters,
    rounds,
    roundSeconds: within(
      readBodyInteger(raw, 'roundSeconds'),
      current.roundSeconds,
      BACCALAUREAT_SETTINGS.roundSeconds
    ),
    stop: typeof raw.stop === 'boolean' ? raw.stop : current.stop,
  }

  return settings as unknown as Prisma.InputJsonObject
}

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {BaccalaureatGameSettings} - Settings
 */

export const baccalaureatSettingsOf = (stored: Prisma.JsonValue): BaccalaureatGameSettings => ({
  ...baccalaureatDefaults(),
  ...(stored as Partial<BaccalaureatGameSettings> | null),
})
