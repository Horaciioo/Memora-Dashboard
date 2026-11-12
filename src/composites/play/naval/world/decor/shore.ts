import type { DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { fbm } from '@/composites/play/naval/world/noise'
import { extrude, haze, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline } from '@/composites/play/naval/world/pen'

// Squares between two points of a shore line
const STEP = 0.3

/**
 * Sand shore along a side band: a bay hollowed around the piece, past the board on the far side
 * @param {DecorScene} scene - Scene
 * @param {Object} bay - Water edge and hollow
 * @return {Outline} - Land footprint
 */

export const shoreOf = (
  { board, place, seed }: DecorScene,
  { edge, hollow }: { edge: number; hollow: number }
): Outline => {
  const isWest = place.x < board.left
  const isNorth = place.isAcross && place.y < board.top
  const isSouth = place.isAcross && !isNorth
  const length = (place.isAcross ? board.width : board.height) + 40
  const line = Array.from({ length: Math.ceil(length / STEP) + 1 }, (_, index) => {
    const along = -20 + index * STEP
    const centre = place.isAcross ? place.x : place.y
    const bay = hollow * Math.exp(-(((along - centre) / 5) ** 2))
    const away = edge + bay + (fbm(along / 4, 7, seed, 3) - 0.5) * 0.8
    if (isNorth) return [along, board.top - away] as [number, number]
    if (isSouth) return [along, board.top + board.size + away] as [number, number]

    return [isWest ? board.left - away : board.left + board.size + away, along] as [number, number]
  })
  const far = isWest || isNorth ? -6 : (place.isAcross ? board.height : board.width) + 6
  const [first, last] = [line[0], line.at(-1) ?? line[0]]

  return place.isAcross
    ? [...line, [last[0], far], [first[0], far]]
    : [...line, [far, last[1]], [far, first[1]]]
}

/**
 * Beach laid on the water: lagoon glow, foam, wet band, warm sand lit by the sun
 * @param {DecorScene} scene - Scene
 * @param {Outline} land - Footprint
 * @return {Lift} - Lift of the sand
 */

export const paintSand = (scene: DecorScene, land: Outline): Lift => {
  const { pen, board, look, place } = scene
  const { water, sun } = look
  haze(pen, land, { colour: water.lagoon, blur: 1.8 })
  haze(pen, land, { colour: water.shallow, blur: 0.6 })
  haze(pen, land, { colour: water.foam, blur: 0.14 })
  pen.strokeStyle = look.land.wet
  pen.lineWidth = 0.4
  pen.lineJoin = 'round'
  trace(pen, land)
  pen.stroke()
  const lift = liftOf(board, place.x, place.y, 0.2)
  extrude(pen, {
    outline: land,
    lift,
    side: look.land.sandDark,
    top: sunlit(pen, {
      x: place.x,
      y: place.y,
      radius: 6,
      sun,
      colour: look.land.sand,
      strength: 0.08,
    }),
  })

  return lift
}
