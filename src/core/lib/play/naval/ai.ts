import { indexOf } from '@/core/lib/play/naval/fleet'
import type { Rng } from '@/core/lib/play/naval/fleet'
import { turnsOf, weaponOf, zoneOf } from '@/core/lib/play/naval/weapons'
import { NavalShapes, PlayBotKinds } from '@/utils/constants/play'
import type { NavalWeaponName, PlayBotKindName } from '@/utils/constants/play'

/**
 * What a captain knows of one sea
 * @typedef {Object} NavalKnowledge
 * @property {number} size - Squares per side
 * @property {Set<number>} fired - Squares fired at
 * @property {Set<number>} wounds - Squares hit on ships still afloat
 * @property {number[]} remaining - Lengths of the ships afloat
 * @property {Set<number>} [spotted] - Ship squares lit by a flare, not struck
 * @property {number} [reachScale] - Theatre weapon reach multiplier
 */

export interface NavalKnowledge {
  size: number
  fired: Set<number>
  wounds: Set<number>
  remaining: number[]
  spotted?: Set<number>
  reachScale?: number
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
 * Likelihood of each square from the ships that could lie there, flat arrays for the wide seas
 * @param {NavalKnowledge} knowledge - Knowledge
 * @return {Float64Array} - Weight per square
 */

const densityOf = ({ size, fired, wounds, remaining }: NavalKnowledge): Float64Array => {
  const density = new Float64Array(size * size)
  // Known water and sunk ships block, wounds attract
  const wall = new Uint8Array(size * size)
  const wound = new Uint8Array(size * size)
  for (const cell of fired) if (!wounds.has(cell)) wall[cell] = 1
  for (const cell of wounds) wound[cell] = 1
  for (const length of new Set(remaining)) {
    const copies = remaining.filter((entry) => entry === length).length
    for (const stride of [1, size]) {
      const isHorizontal = stride === 1
      for (let y = 0; y < size - (isHorizontal ? 0 : length - 1); y += 1) {
        for (let x = 0; x < size - (isHorizontal ? length - 1 : 0); x += 1) {
          const first = indexOf(x, y, size)
          let blocked = false
          let hits = 0
          for (let step = 0; step < length && !blocked; step += 1) {
            blocked = wall[first + step * stride] === 1
            hits += wound[first + step * stride]
          }
          if (blocked) continue
          const weight = (1 + hits * WOUND_WEIGHT) * copies
          for (let step = 0; step < length; step += 1) {
            if (!fired.has(first + step * stride)) density[first + step * stride] += weight
          }
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
  const best = free.reduce((top, square) => Math.max(top, density[square]), 0)

  return draw(
    free.filter((square) => density[square] === best),
    rng
  )
}

/**
 * Heading a captain gives the weapon drawn for it
 * @param {NavalWeaponName} weapon - Weapon drawn
 * @param {Rng} [rng] - Random source
 * @return {NavalArmsChoice} - Weapon and orientation
 */

export const chooseHeading = (
  weapon: NavalWeaponName,
  rng: Rng = Math.random
): NavalArmsChoice => ({
  weapon,
  orientation: Math.floor(rng() * turnsOf(weaponOf(weapon))),
})

/**
 * Whether a weapon aimed at a square still has something to strike
 * @param {NavalKnowledge} knowledge - What is known
 * @param {NavalArmsChoice} arms - Weapon and heading
 * @param {number} square - Square aimed at
 * @return {boolean} - Something new inside the zone
 */

const hasTarget = (knowledge: NavalKnowledge, arms: NavalArmsChoice, square: number): boolean => {
  const { size, fired, spotted, reachScale } = knowledge
  const weapon = weaponOf(arms.weapon, reachScale)
  const origin = { x: square % size, y: Math.floor(square / size) }

  return zoneOf(weapon, origin, arms.orientation, size).some((cell) => {
    const at = indexOf(cell.x, cell.y, size)

    return !fired.has(at) && !(weapon.shape === NavalShapes.Square && spotted?.has(at))
  })
}

/**
 * Heading and square a captain gives the weapon drawn, never a strike that hits nothing new
 * @param {Object} input - Choice
 * @param {NavalKnowledge} input.knowledge - What is known
 * @param {PlayBotKindName} input.level - Skill
 * @param {number} input.mistakeRate - Share of blind shots
 * @param {NavalWeaponName} input.weapon - Weapon drawn
 * @param {Rng} [input.rng] - Random source
 * @return {{ arms: NavalArmsChoice; square: number } | null} - Strike, none when nothing is left
 */

export const chooseStrike = ({
  knowledge,
  level,
  mistakeRate,
  weapon,
  rng = Math.random,
}: {
  knowledge: NavalKnowledge
  level: PlayBotKindName
  mistakeRate: number
  weapon: NavalWeaponName
  rng?: Rng
}): { arms: NavalArmsChoice; square: number } | null => {
  const arms = chooseHeading(weapon, rng)
  const wanted = chooseSquare({ knowledge, level, mistakeRate, rng })
  if (wanted !== null && hasTarget(knowledge, arms, wanted)) return { arms, square: wanted }

  // The best square lights nothing for this weapon, any other square that does will do
  const squares = Array.from({ length: knowledge.size * knowledge.size }, (_, at) => at)
  const open = squares.filter((square) => hasTarget(knowledge, arms, square))
  if (!open.length) return null

  return { arms, square: open[Math.floor(rng() * open.length)] }
}
