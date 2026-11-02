import { ASSISTANT_HELLOS } from '@/declarations/assistant/copy'
import type { AssistantHello } from '@/declarations/assistant/copy'

/**
 * Line that fits some hours only
 * @typedef {Object} HourBound
 * @property {readonly [number, number]} [hours] - [from, to[ in 24h, may wrap past midnight
 */

export interface HourBound {
  hours?: readonly [number, number]
}

/**
 * Line fitting the hour, one drawn among them
 * @param {readonly T[]} lines - Candidates
 * @param {number} hour - Hour of the day, 0 to 23
 * @param {number} [roll] - Draw between 0 and 1
 * @return {T} - Line drawn
 */

export const pickForHour = <T extends HourBound>(
  lines: readonly T[],
  hour: number,
  roll = Math.random()
): T => {
  const fitting = lines.filter(({ hours }) => {
    if (!hours) return true

    const [from, to] = hours

    // A window may wrap past midnight
    return from <= to ? hour >= from && hour < to : hour >= from || hour < to
  })

  return fitting[Math.floor(roll * fitting.length)]
}

/**
 * Welcome fitting the hour
 * @param {number} hour - Hour of the day, 0 to 23
 * @param {number} [roll] - Draw between 0 and 1
 * @return {AssistantHello} - Welcome
 */

export const pickHello = (hour: number, roll?: number): AssistantHello =>
  pickForHour(ASSISTANT_HELLOS, hour, roll)
