import votes from '@/configurations/play/votes.json'
import { readInteger, readNode } from '@/declarations/configurations/readers'
import type { PlayVoteStepSpec } from '@/declarations/play/votes'

/**
 * Numbers a launch vote offers, from the votes config
 * @param {string} game - Game key
 * @param {string} key - Setting key
 * @param {number[]} fallback - Numbers kept when the config is wrong
 * @return {number[]} - Cards, ascending
 */

export const voteCountsOf = (game: string, key: string, fallback: number[]): number[] => {
  const path = `play/votes.${game}.${key}`
  const raw = readNode(votes, 'play/votes')[game] as Record<string, unknown> | undefined
  const list = Array.isArray(raw?.[key]) ? (raw[key] as unknown[]) : fallback

  return list.map((count, index) =>
    readInteger(count, { path: `${path}.${index}`, fallback: fallback[0], min: 0 })
  )
}

/**
 * Words of a number step
 * @typedef {Object} CountCopy
 */

export interface CountCopy {
  title: string
  lead: string
  // Card name and line for a number
  label: (count: number) => string
  hint: (count: number) => string
}

/**
 * Step of numbers, the card kept without votes is the game's default
 * @param {string} key - Step key
 * @param {number[]} counts - Cards
 * @param {number} initial - Default number
 * @param {CountCopy} copy - Words
 * @return {PlayVoteStepSpec} - Step
 */

export const countStep = (
  key: string,
  counts: number[],
  initial: number,
  { title, lead, label, hint }: CountCopy
): PlayVoteStepSpec => ({
  key,
  title,
  lead,
  initial: String(initial),
  choices: counts.map((count) => ({
    key: String(count),
    label: label(count),
    hint: hint(count),
  })),
})
