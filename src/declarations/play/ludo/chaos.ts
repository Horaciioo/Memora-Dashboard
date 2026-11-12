import ludo from '@/configurations/play/ludo.json'
import { readInteger, readNode } from '@/declarations/configurations/readers'

/**
 * Chaos bonuses
 * @type {readonly string[]}
 */

export const LUDO_BONUSES = ['ghost', 'double', 'boost', 'chameleon'] as const

/**
 * Chaos maluses
 * @type {readonly string[]}
 */

export const LUDO_MALUSES = ['duel', 'faulty', 'stall', 'blind'] as const

export type LudoBonusName = (typeof LUDO_BONUSES)[number]
export type LudoMalusName = (typeof LUDO_MALUSES)[number]
export type LudoEffectName = LudoBonusName | LudoMalusName

// Raw nodes
const chaos = readNode(ludo.chaos, 'play/ludo.chaos')
const node = (key: string) => readNode(chaos[key], `play/ludo.chaos.${key}`)
const ghost = node('ghost')
const faulty = node('faulty')

/**
 * Squares of a quarter, read as offsets
 * @param {unknown} raw - Offsets
 * @param {string} path - Config path
 * @return {number[]} - Offsets
 */

const readOffsets = (raw: unknown, path: string): number[] =>
  (Array.isArray(raw) ? raw : []).map((offset, index) =>
    readInteger(offset, { path: `${path}.${index}`, fallback: 3, min: 1, max: 8 })
  )

/**
 * Chaos settings
 * @type {Object}
 */

export const LUDO_CHAOS = {
  jokers: readInteger(chaos.jokers, { path: 'play/ludo.chaos.jokers', fallback: 1, min: 0 }),
  // Offsets of action squares in each quarter
  bonusSquares: readOffsets(chaos.bonusSquares, 'play/ludo.chaos.bonusSquares'),
  malusSquares: readOffsets(chaos.malusSquares, 'play/ludo.chaos.malusSquares'),
  ghostTurns: readInteger(ghost.turns, {
    path: 'play/ludo.chaos.ghost.turns',
    fallback: 4,
    min: 1,
  }),
  ghostGap: readInteger(ghost.gap, { path: 'play/ludo.chaos.ghost.gap', fallback: 3, min: 0 }),
  chameleonTurns: readInteger(node('chameleon').turns, {
    path: 'play/ludo.chaos.chameleon.turns',
    fallback: 2,
    min: 1,
  }),
  boostMin: readInteger(node('boost').min, {
    path: 'play/ludo.chaos.boost.min',
    fallback: 4,
    min: 2,
    max: 6,
  }),
  faultyTurns: readInteger(faulty.turns, {
    path: 'play/ludo.chaos.faulty.turns',
    fallback: 3,
    min: 1,
  }),
  faultyMax: readInteger(faulty.max, {
    path: 'play/ludo.chaos.faulty.max',
    fallback: 3,
    min: 1,
    max: 6,
  }),
  blindTurns: readInteger(node('blind').turns, {
    path: 'play/ludo.chaos.blind.turns',
    fallback: 3,
    min: 1,
  }),
  // Beats of the screen, in milliseconds
  duelMs: readInteger(chaos.duelMs, { path: 'play/ludo.chaos.duelMs', fallback: 900, min: 100 }),
  effectMs: readInteger(chaos.effectMs, {
    path: 'play/ludo.chaos.effectMs',
    fallback: 1600,
    min: 200,
  }),
}
