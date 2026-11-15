import type { StopGoSoundName } from '@/declarations/play/stopgo/sounds'

/**
 * Mark worn by a car for a moment
 * @type {readonly string[]}
 */

export const STOPGO_MARKS = ['hit', 'heal', 'shield', 'sweep'] as const

export type StopGoMarkKind = (typeof STOPGO_MARKS)[number]

/**
 * Where a card flies
 * @type {readonly string[]}
 */

export const STOPGO_FLIGHTS = ['toTargets', 'toSelf', 'toDiscard'] as const

export type StopGoFlightKind = (typeof STOPGO_FLIGHTS)[number]

/**
 * What a moment of the race shows and plays
 * @typedef {Object} StopGoFxSpec
 */

export interface StopGoFxSpec {
  sound?: StopGoSoundName
  flight?: StopGoFlightKind
  mark?: StopGoMarkKind
  // Card flies face down
  isBack?: boolean
}

/**
 * One entry per moment, durations live in stopgo.json
 * @type {Record<string, StopGoFxSpec>}
 */

export const STOPGO_FX: Record<string, StopGoFxSpec> = {
  drive: { sound: 'card', flight: 'toSelf' },
  start: { sound: 'engine', flight: 'toSelf' },
  attack: { sound: 'attack', flight: 'toTargets' },
  remedy: { sound: 'remedy', flight: 'toSelf' },
  shield: { sound: 'joker', flight: 'toDiscard', mark: 'shield' },
  counter: { sound: 'joker', flight: 'toSelf', mark: 'shield' },
  draw: { sound: 'draw' },
  mystery: { sound: 'attack', flight: 'toTargets', isBack: true },
  reveal: { sound: 'joker' },
  discard: { sound: 'card' },
  shuffle: { sound: 'draw' },
  finish: { sound: 'finish' },
  hit: { mark: 'hit' },
  heal: { mark: 'heal' },
}
