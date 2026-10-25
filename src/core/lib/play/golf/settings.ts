import type { Prisma } from '@prisma/client'

import { clampToRange, readBodyInteger, readBodyList } from '@/core/lib/play/parse'
import type { GolfHoleLayout } from '@/core/lib/play/golf/types'
import { GOLF_COURSES, GOLF_RANDOM_COURSE } from '@/declarations/play/golf/courses'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Host choices of a golf game
 * @typedef {Object} GolfGameSettings
 */

export interface GolfGameSettings {
  // Course key, or random
  course: string
  // Course drawn for a random game
  drawn?: string
  holes: number
  holeSeconds: number
  maxStrokes: number
  collisions: boolean
  // Powers the orbs can give, none turns them off
  powers: GolfPowerName[]
}

// Bounds of each numeric choice
const GOLF_RANGES = {
  holeSeconds: GOLF_SETTINGS.holeSeconds,
  maxStrokes: GOLF_SETTINGS.maxStrokes,
}

/**
 * Course known, the default otherwise
 * @param {unknown} course - Asked course
 * @return {string} - Course key
 */

const courseOf = (course: unknown): string =>
  typeof course === 'string' && GOLF_COURSES.has(course)
    ? course
    : GOLF_COURSES.has(GOLF_SETTINGS.course)
      ? GOLF_SETTINGS.course
      : GOLF_COURSES.keys[0]

/**
 * Course choice known, random included
 * @param {unknown} course - Asked course
 * @return {string} - Course key or random
 */

const choiceOf = (course: unknown): string =>
  course === GOLF_RANDOM_COURSE ? GOLF_RANDOM_COURSE : courseOf(course)

/**
 * Holes a course offers, the longest course when random
 * @param {string} course - Course choice
 * @return {{ min: number, max: number }} - Bounds
 */

export const holeRange = (course: string): { min: number; max: number } => {
  const lengths =
    course === GOLF_RANDOM_COURSE
      ? GOLF_COURSES.list.map((entry) => entry.holes.length)
      : [GOLF_COURSES.get(courseOf(course)).holes.length]

  return {
    min: GOLF_SETTINGS.holes.min,
    max: Math.min(GOLF_SETTINGS.holes.max, Math.max(...lengths)),
  }
}

/**
 * Course really played
 * @param {GolfGameSettings} settings - Game settings
 * @return {string} - Course key
 */

export const playedCourse = (settings: GolfGameSettings): string =>
  courseOf(settings.course === GOLF_RANDOM_COURSE ? settings.drawn : settings.course)

/**
 * Settings with a course drawn for a random game
 * @param {GolfGameSettings} settings - Game settings
 * @param {() => number} [random] - Random source
 * @return {GolfGameSettings} - Settings to play
 */

export const drawCourse = (
  settings: GolfGameSettings,
  random: () => number = Math.random
): GolfGameSettings =>
  settings.course === GOLF_RANDOM_COURSE
    ? { ...settings, drawn: GOLF_COURSES.keys[Math.floor(random() * GOLF_COURSES.keys.length)] }
    : settings

/**
 * Default golf choices
 * @return {GolfGameSettings} - Settings
 */

export const golfDefaults = (): GolfGameSettings => {
  const course = courseOf(null)

  return {
    course,
    holes: Math.min(GOLF_SETTINGS.holes.initial, holeRange(course).max),
    holeSeconds: GOLF_SETTINGS.holeSeconds.initial,
    maxStrokes: GOLF_SETTINGS.maxStrokes.initial,
    collisions: GOLF_SETTINGS.collisions,
    powers: GOLF_POWERS.keys,
  }
}

/**
 * Stored settings, typed
 * @param {Prisma.JsonValue} stored - Stored settings
 * @return {GolfGameSettings} - Settings
 */

export const golfSettingsOf = (stored: Prisma.JsonValue): GolfGameSettings => ({
  ...golfDefaults(),
  ...(stored as Partial<GolfGameSettings> | null),
})

/**
 * Holes played by a game
 * @param {GolfGameSettings} settings - Game settings
 * @return {GolfHoleLayout[]} - Holes in order
 */

export const holesOf = (settings: GolfGameSettings): GolfHoleLayout[] =>
  GOLF_COURSES.get(playedCourse(settings)).holes.slice(0, settings.holes)

/**
 * Settings asked by the host
 * @param {Record<string, unknown>} raw - Body
 * @param {Prisma.JsonValue} stored - Current settings
 * @return {Prisma.InputJsonObject} - Checked settings
 */

export const readGolfSettings = (
  raw: Record<string, unknown>,
  stored: Prisma.JsonValue
): Prisma.InputJsonObject => {
  const current = golfSettingsOf(stored)
  const course = choiceOf(raw.course ?? current.course)
  const ranged = (field: keyof typeof GOLF_RANGES) =>
    clampToRange(readBodyInteger(raw, field), current[field], GOLF_RANGES[field])

  // Known powers only, registry order
  const asked = readBodyList(raw, 'powers')
  const settings: GolfGameSettings = {
    course,
    holes: clampToRange(readBodyInteger(raw, 'holes'), current.holes, holeRange(course)),
    holeSeconds: ranged('holeSeconds'),
    maxStrokes: ranged('maxStrokes'),
    collisions: typeof raw.collisions === 'boolean' ? raw.collisions : current.collisions,
    powers: asked ? GOLF_POWERS.keys.filter((power) => asked.includes(power)) : current.powers,
  }

  return settings as unknown as Prisma.InputJsonObject
}
