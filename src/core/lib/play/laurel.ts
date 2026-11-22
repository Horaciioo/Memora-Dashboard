import { LAUREL } from '@/declarations/play/laurel'
import { LEVEL_FRAME, LEVEL_SKINS } from '@/declarations/play/skins'

export type LeafShade = 'old' | 'mid' | 'new'

export interface LeafPair {
  slot: number
  x: number
  y: number
  // Direction along the stem, degrees
  direction: number
  length: number
  outer: LeafShade
  inner: LeafShade
  berry: [number, number] | null
  glint: [number, number] | null
}

export interface Wreath {
  pairs: LeafPair[]
  tip: { x: number; y: number; rotation: number; length: number }
  stem: string
}

// Drawing precision
const DECIMALS = 1
const { centre, radius, arc, slots, lastStage } = LAUREL
const turn = (arc.to - arc.from) / (slots - 1)
const angleOf = (slot: number): number => arc.from + slot * turn

const round = (value: number): number => Number(value.toFixed(DECIMALS))

/**
 * Point on a circle
 * @param {number} distance - Centre distance
 * @param {number} degrees - Angle
 * @return {[number, number]} - Coordinates
 */

export const polar = (distance: number, degrees: number): [number, number] => {
  const angle = (degrees * Math.PI) / 180

  return [round(centre + distance * Math.cos(angle)), round(centre + distance * Math.sin(angle))]
}

/**
 * Wreath stage reached at a level
 * @param {number} level - Player level
 * @return {number} - Stage, 0 to 39
 */

export const laurelStageOf = (level: number): number => {
  const index = Math.max(0, LEVEL_SKINS.filter((skin) => level >= skin.from).length - 1)
  const into = Math.max(0, level - Math.max(1, LEVEL_SKINS[index].from))
  const { span, step } = LEVEL_FRAME

  return index * (span / step) + Math.floor(Math.min(into, span - 1) / step)
}

/**
 * Leaf pairs grown at a stage
 * @param {number} stage - Wreath stage
 * @return {number} - Pair count
 */

export const leafCountOf = (stage: number): number =>
  stage <= 0 ? 0 : Math.min(slots, Math.ceil((stage * slots) / lastStage))

const shadeOf = (slot: number, count: number): LeafShade => {
  const age = slot / Math.max(count - 1, 1)

  return age < LAUREL.shades.old ? 'old' : age < LAUREL.shades.mid ? 'mid' : 'new'
}

const lighter: Record<LeafShade, LeafShade> = { old: 'mid', mid: 'new', new: 'new' }

const lengthAt = (slot: number, stage: number): number => {
  const { base, swell, floor, mature } = LAUREL.length
  const growth = floor + (1 - floor) * Math.min(1, stage / mature)

  return growth * (base + swell * Math.sin((Math.PI * (slot + 1)) / (slots + 1)))
}

/**
 * Pair at one slot
 * @param {number} slot - Slot index
 * @param {number} count - Pairs grown
 * @param {number} stage - Wreath stage
 * @return {LeafPair} - Placement
 */

const pairAt = (slot: number, count: number, stage: number): LeafPair => {
  const angle = angleOf(slot)
  const [x, y] = polar(radius, angle)
  const shade = shadeOf(slot, count)
  const { berries } = LAUREL.from
  const { glint } = LAUREL
  const every = glint.every[stage >= LAUREL.from.sway ? 1 : 0]

  return {
    slot,
    x,
    y,
    direction: angle + 90,
    length: lengthAt(slot, stage),
    outer: shade,
    inner: lighter[shade],
    berry: stage >= berries && slot % 2 === 1 ? polar(radius, angle + turn / 2) : null,
    glint:
      stage >= berries && slot % every === 1
        ? polar(radius + glint.radius, angle + glint.turn)
        : null,
  }
}

/**
 * Branch drawn at a stage
 * @param {number} stage - Wreath stage
 * @return {Wreath | null} - Half wreath
 */

export const wreathOf = (stage: number): Wreath | null => {
  const count = leafCountOf(stage)

  if (!count) return null

  const { stem, tip } = LAUREL
  const last = angleOf(count - 1)
  const [fromX, fromY] = polar(radius, arc.from - stem.before)
  const [toX, toY] = polar(radius, last + stem.after)
  const wide = last + stem.after - (arc.from - stem.before) > 180 ? 1 : 0
  const [tipX, tipY] = polar(radius, last + tip.turn)

  return {
    pairs: Array.from({ length: count }, (_, slot) => pairAt(slot, count, stage)),
    tip: {
      x: tipX,
      y: tipY,
      rotation: last + tip.turn + 90 - tip.lean,
      length: lengthAt(0, stage) * (LAUREL.length.tip / LAUREL.length.base),
    },
    stem: `M${fromX} ${fromY}A${radius} ${radius} 0 ${wide} 1 ${toX} ${toY}`,
  }
}

/**
 * Sparkle path
 * @param {number} x - Centre x
 * @param {number} y - Centre y
 * @param {number} size - Arm length
 * @return {string} - Path data
 */

export const sparklePath = (x: number, y: number, size: number): string =>
  `M${x} ${y - size}Q${x} ${y} ${x + size} ${y}Q${x} ${y} ${x} ${y + size}Q${x} ${y} ${x - size} ${y}Q${x} ${y} ${x} ${y - size}Z`

/**
 * Sway strength at a stage
 * @param {number} stage - Wreath stage
 * @return {number} - 0 none to 3
 */

export const swayOf = (stage: number): number =>
  LAUREL.sway.find((step) => stage >= step.from)?.level ?? 0

/**
 * Orbiting sparkles at a stage
 * @param {number} stage - Wreath stage
 * @return {number} - Count
 */

export const orbitCountOf = (stage: number): number =>
  LAUREL.orbits.find((step) => stage >= step.from)?.count ?? 0

/**
 * Leaf drawing paths
 * @param {number} length - Leaf length
 * @return {Record<string, string>} - Path data
 */

export const leafPaths = (length: number): Record<string, string> => {
  const width = length * 0.27
  const at = (along: number, across: number): string =>
    `${round(length * along)} ${round(width * across)}`
  const lower = `C${at(0.66, 0.7)} ${at(0.2, 0.95)} 0 0Z`

  return {
    outline: `M0 0C${at(0.18, -1.15)} ${at(0.62, -1.05)} ${at(1, -0.12)}${lower}`,
    shadow: `M0 0L${at(0.93, -0.05)}${lower}`,
    sheen: `M${at(0.1, -0.2)}Q${at(0.5, -1.02)} ${at(0.9, -0.2)}Q${at(0.5, -0.5)} ${at(0.1, -0.2)}Z`,
    rib: `M1 0L${at(0.93, -0.05)}`,
    veins: [0.26, 0.44, 0.62]
      .map(
        (along) =>
          `M${at(along, -0.05 * along)}l${round(length * 0.15)} ${round(-width * 0.62)}M${at(along, -0.05 * along)}l${round(length * 0.15)} ${round(width * 0.55)}`
      )
      .join(''),
    reflect: `M${at(0.14, -0.5)}Q${at(0.45, -1)} ${at(0.78, -0.45)}`,
  }
}
