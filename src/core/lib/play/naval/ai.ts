import { indexOf } from '@/core/lib/play/naval/fleet'
import type { Rng } from '@/core/lib/play/naval/fleet'
import { canWield, turnsOf } from '@/core/lib/play/naval/weapons'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { NavalShapes, NavalWeapons, PlayBotKinds } from '@/utils/constants/play'
import type { NavalWeaponName, PlayBotKindName } from '@/utils/constants/play'

/**
 * What a captain knows of one sea
 * @typedef {Object} NavalKnowledge
 * @property {number} size - Squares per side
 * @property {Set<number>} fired - Squares fired at
 * @property {Set<number>} wounds - Squares hit on ships still afloat
 * @property {number[]} remaining - Lengths of the ships afloat
 * @property {Set<number>} [spotted] - Ship squares lit by a flare, not struck
 */

export interface NavalKnowledge {
  size: number
  fired: Set<number>
  wounds: Set<number>
  remaining: number[]
  spotted?: Set<number>
}

/**
 * Weapon and heading a captain picks
 * @typedef {Object} NavalArmsChoice
 */

export interface NavalArmsChoice {
  weapon: NavalWeaponName
  orientation: number
}

// Weight of a ship laid over a wound
const WOUND_WEIGHT = 40

// Straight lines from a square, orthogonal
const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/**
 * Squares still to fire at
 * @param {NavalKnowledge} knowledge - Knowledge
 * @return {number[]} - Free squares
 */

const freeSquares = ({ size, fired }: NavalKnowledge): number[] =>
  Array.from({ length: size * size }, (_, index) => index).filter((index) => !fired.has(index))

/**
 * Likelihood of each square from the ships that could lie there
 * @param {NavalKnowledge} knowledge - Knowledge
 * @return {number[]} - Weight per square
 */

const densityOf = ({ size, fired, wounds, remaining }: NavalKnowledge): number[] => {
  const density = Array.from({ length: size * size }, () => 0)
  for (const length of remaining) {
    for (const isHorizontal of [true, false]) {
      for (let y = 0; y < size - (isHorizontal ? 0 : length - 1); y += 1) {
        for (let x = 0; x < size - (isHorizontal ? length - 1 : 0); x += 1) {
          const cells = Array.from({ length }, (_, step) =>
            indexOf(x + (isHorizontal ? step : 0), y + (isHorizontal ? 0 : step), size)
          )
          // Walls of known water and sunk ships are out
          if (cells.some((cell) => fired.has(cell) && !wounds.has(cell))) continue
          const weight = 1 + cells.filter((cell) => wounds.has(cell)).length * WOUND_WEIGHT
          for (const cell of cells) if (!fired.has(cell)) density[cell] += weight
        }
      }
    }
  }

  return density
}

/**
 * Squares touching a wound
 * @param {NavalKnowledge} knowledge - Knowledge
 * @return {number[]} - Free squares beside wounds
 */

const besideWounds = (knowledge: NavalKnowledge): number[] => {
  const { size, fired, wounds } = knowledge
  const squares = new Set<number>()
  for (const wound of wounds) {
    const x = wound % size
    const y = Math.floor(wound / size)
    for (const [dx, dy] of STEPS) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
      if (!fired.has(indexOf(nx, ny, size))) squares.add(indexOf(nx, ny, size))
    }
  }

  return [...squares]
}

/**
 * Item drawn from a list
 * @param {number[]} items - Items
 * @param {Rng} rng - Random source
 * @return {number} - Item
 */

const draw = (items: number[], rng: Rng): number => items[Math.floor(rng() * items.length)]

/**
 * Square a captain fires at
 * @param {Object} input - Choice
 * @param {NavalKnowledge} input.knowledge - What is known
 * @param {PlayBotKindName} input.level - Skill
 * @param {number} input.mistakeRate - Chance of a careless shot
 * @param {Rng} [input.rng] - Random source
 * @return {number | null} - Square index, none when all is fired
 */

export const chooseSquare = ({
  knowledge,
  level,
  mistakeRate,
  rng = Math.random,
}: {
  knowledge: NavalKnowledge
  level: PlayBotKindName
  mistakeRate: number
  rng?: Rng
}): number | null => {
  const free = freeSquares(knowledge)
  if (!free.length) return null
  if (level === PlayBotKinds.Easy || rng() < mistakeRate) return draw(free, rng)

  // A lit ship is a sure hit
  const lit = [...(knowledge.spotted ?? [])].filter((square) => !knowledge.fired.has(square))
  if (lit.length) return draw(lit, rng)

  // Medium follows wounds, then hunts on a chessboard
  if (level === PlayBotKinds.Medium) {
    const near = besideWounds(knowledge)
    if (near.length) return draw(near, rng)
    const parity = free.filter((square) => {
      const { size } = knowledge

      return ((square % size) + Math.floor(square / size)) % 2 === 0
    })

    return draw(parity.length ? parity : free, rng)
  }

  // Hard fires where most ships could still lie
  const density = densityOf(knowledge)
  const best = Math.max(...free.map((square) => density[square]))

  return draw(
    free.filter((square) => density[square] === best),
    rng
  )
}

/**
 * Weapon a captain fires, the cannon when nothing better is held
 * @param {Object} input - Choice
 * @param {NavalKnowledge} input.knowledge - What is known
 * @param {PlayBotKindName} input.level - Skill
 * @param {{ ammo: number; offer: string[] }} input.arms - Ammo and weapons drawn
 * @param {Rng} [input.rng] - Random source
 * @return {NavalArmsChoice} - Weapon and orientation
 */

export const chooseWeapon = ({
  knowledge,
  level,
  arms,
  rng = Math.random,
}: {
  knowledge: NavalKnowledge
  level: PlayBotKindName
  arms: { ammo: number; offer: string[] }
  rng?: Rng
}): NavalArmsChoice => {
  const held = NAVAL_WEAPONS.filter((weapon) => canWield(weapon.name, arms) && weapon.cost > 0)
  const isTracking = knowledge.wounds.size > 0 || (knowledge.spotted?.size ?? 0) > 0
  const cannon = { weapon: NavalWeapons.Cannon, orientation: 0 }
  if (!held.length) return cannon

  // Easy spends at random, the others hunt with zones and track with the cannon
  const pick =
    level === PlayBotKinds.Easy
      ? held[Math.floor(rng() * held.length)]
      : isTracking
        ? held.find((weapon) => weapon.shape === NavalShapes.Cross)
        : (held.find((weapon) => weapon.shape === NavalShapes.Square) ??
          held.toSorted((a, b) => b.cost - a.cost)[0])
  if (!pick) return cannon

  return { weapon: pick.name, orientation: Math.floor(rng() * turnsOf(pick)) }
}
