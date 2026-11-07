import type { Bounds } from '@/declarations/configurations/readers'

/**
 * Random value in a range
 * @param {Bounds} range - Range
 * @return {number} - Value
 */

export const between = ({ min, max }: Bounds): number => min + Math.random() * (max - min)

/**
 * Date after a human pause
 * @param {Date} from - Start
 * @param {Bounds} pauseMs - Pause range
 * @return {Date} - Move time
 */

export const pauseAfter = (from: Date, pauseMs: Bounds): Date =>
  new Date(from.getTime() + between(pauseMs))

/**
 * Latest of some dates
 * @param {Date[]} dates - Dates
 * @return {Date} - Latest
 */

export const latest = (...dates: Date[]): Date =>
  new Date(Math.max(...dates.map((date) => date.getTime())))

/**
 * Stable draw from a seed
 * @param {string} seed - Seed text
 * @return {number} - Value in [0, 1)
 */

export const seeded = (seed: string): number => {
  let hash = 2166136261
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)

  return (hash >>> 0) / 2 ** 32
}

/**
 * Bell noise around zero
 * @param {number} spread - Standard deviation
 * @return {number} - Noise
 */

export const noise = (spread: number): number =>
  spread * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())

/**
 * Random item
 * @param {T[]} items - Items
 * @return {T | undefined} - Item
 */

export const pickOne = <T>(items: T[]): T | undefined =>
  items[Math.floor(Math.random() * items.length)]
