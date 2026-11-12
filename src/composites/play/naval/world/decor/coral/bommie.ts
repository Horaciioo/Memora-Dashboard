import { CORAL_KINDS, CORAL_PAINTERS } from '@/composites/play/naval/world/decor/coral/heads'
import type { CoralHead, CoralKind } from '@/composites/play/naval/world/decor/coral/heads'
import { blob, grow, haze, mix, shade, trace } from '@/composites/play/naval/world/pen'
import type { Pen } from '@/composites/play/naval/world/pen'
import type { NavalMapLook } from '@/declarations/play/naval/maps'

// Colour keys of the corals, in a map's land
const CORAL_COLOURS = [
  'coralPink',
  'coralViolet',
  'coralOrange',
  'coralYellow',
  'coralTeal',
  'coralRed',
]
// Heads per square of rock
const HEADS_PER_AREA = 34
// Wide shapes first, the small ones on top
const DRAW_ORDER: Record<CoralKind, number> = {
  table: 0,
  soft: 1,
  brain: 2,
  staghorn: 3,
  tubes: 4,
  fan: 5,
  anemone: 6,
}

/**
 * Coral mound on the floor
 * @typedef {Object} Bommie
 * @property {number} radius - Squares
 * @property {number} veil - Water over it, zero clear
 */

export interface Bommie {
  x: number
  y: number
  radius: number
  veil: number
  rng: () => number
  seed: number
}

/**
 * Heads growing on a mound, the widest first
 * @param {NavalMapLook} look - Look
 * @param {Bommie} mound - Mound
 * @return {CoralHead[]} - Heads
 */

const headsOf = (look: NavalMapLook, { x, y, radius, rng, seed }: Bommie): CoralHead[] => {
  const colours = CORAL_COLOURS.map((key) => look.land[key]).filter(Boolean)

  return Array.from(
    { length: Math.max(6, Math.round(radius * radius * HEADS_PER_AREA)) },
    (_, index) => {
      const angle = rng() * Math.PI * 2
      const reach = Math.sqrt(rng()) * 0.9

      return {
        x: x + Math.cos(angle) * radius * reach,
        y: y + Math.sin(angle) * radius * reach * 0.85,
        size: radius * (0.22 + rng() * 0.24) * (1.15 - reach * 0.45),
        colour: shade(colours[Math.floor(rng() * colours.length)], (rng() - 0.5) * 0.25),
        kind: CORAL_KINDS[Math.floor(rng() * CORAL_KINDS.length)],
        turn: rng() * Math.PI * 2,
        seed: seed + index,
        sun: look.sun,
      }
    }
  ).toSorted((a, b) => DRAW_ORDER[a.kind] - DRAW_ORDER[b.kind])
}

/**
 * Coral mound: pale sand around it, a dark rock base, heads of every shape, the water veil
 * @param {Pen} pen - Pen in squares
 * @param {NavalMapLook} look - Look
 * @param {Bommie} mound - Mound
 * @return {void}
 */

export const paintBommie = (pen: Pen, look: NavalMapLook, mound: Bommie): void => {
  const { land, water, sun } = look
  const { x, y, radius, veil, seed } = mound
  const base = blob({ x, y, rx: radius, ry: radius * 0.85, seed, rough: 0.55 })
  pen.globalAlpha = 0.55
  haze(pen, base, { colour: land.floor, blur: radius * 0.6 })
  pen.globalAlpha = 1
  haze(pen, base, {
    colour: look.light.shade,
    blur: radius * 0.25,
    dx: -sun[0] * radius * 0.25,
    dy: -sun[1] * radius * 0.25,
  })
  pen.fillStyle = mix(land.floor, water.mid, 0.45)
  trace(pen, base)
  pen.fill()
  pen.save()
  for (const head of headsOf(look, mound)) {
    // Contact shade lifts each head off the floor
    pen.fillStyle = look.light.shade
    pen.beginPath()
    pen.arc(
      head.x - sun[0] * head.size * 0.3,
      head.y - sun[1] * head.size * 0.3,
      head.size * 1.05,
      0,
      Math.PI * 2
    )
    pen.fill()
    CORAL_PAINTERS[head.kind](pen, head)
  }
  pen.restore()
  pen.globalAlpha = veil
  haze(pen, grow(base, 1.15), { colour: water.shallow, blur: radius * 0.45 })
  pen.globalAlpha = 1
}
