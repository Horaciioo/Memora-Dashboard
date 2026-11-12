import { paintStone, stoneOutline } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { fbm, pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, haze, shade, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline } from '@/composites/play/naval/world/pen'

// Squares between two points of the cliff foot
const STEP = 0.35
// Rock layers drawn on the wall
const STRATA = [0.18, 0.34, 0.52, 0.7, 0.86]

/**
 * Foot of the cliff facing the grid: a ragged line along the band, never inside the grid
 * @param {DecorScene} scene - Scene
 * @return {Outline} - Foot points, north to south or west to east
 */

const footOf = ({ board, place, seed }: DecorScene): Outline => {
  const isWest = place.x < board.width / 2
  const edge = isWest ? board.left : board.left + board.size
  const length = board.height + 40
  return Array.from({ length: Math.ceil(length / STEP) + 1 }, (_, index) => {
    const y = -20 + index * STEP
    const bite = 0.5 + fbm(y / 5, 3, seed, 4) * place.room * 0.55
    return [isWest ? edge - bite : edge + bite, y]
  })
}

/**
 * The massif: footprint from its foot to past the board edge
 * @param {DecorScene} scene - Scene
 * @param {Outline} foot - Foot line
 * @return {Outline} - Footprint
 */

const massifOf = ({ board, place }: DecorScene, foot: Outline): Outline => {
  const isWest = place.x < board.width / 2
  const outer = isWest ? -4 : board.width + 4

  return [...foot, [outer, foot.at(-1)?.[1] ?? 0], [outer, foot[0][1]]]
}

/**
 * Wall details between the foot and the lifted rim: strata, then caves at the waterline
 * @param {DecorScene} scene - Scene
 * @param {Outline} foot - Foot line
 * @param {Lift} lift - Rim shift
 * @return {void}
 */

const paintWall = ({ pen, look, seed }: DecorScene, foot: Outline, lift: Lift): void => {
  const { land } = look
  const rng = pieceRng(seed + 3)
  pen.strokeStyle = land.strata
  pen.lineWidth = 0.07
  for (const share of STRATA) {
    pen.beginPath()
    foot.forEach(([x, y], index) => {
      const wobble = (fbm(y / 2, share * 9, seed, 2) - 0.5) * 0.12
      const px = x + lift[0] * (share + wobble)
      const py = y + lift[1] * (share + wobble)
      if (index) pen.lineTo(px, py)
      else pen.moveTo(px, py)
    })
    pen.stroke()
  }
  for (let index = 0; index < foot.length; index += 1) {
    if (rng() > 0.09) continue
    const [x, y] = foot[index]
    const size = 0.25 + rng() * 0.45
    const cave = pen.createRadialGradient(x + lift[0] * 0.1, y + lift[1] * 0.1, 0, x, y, size)
    cave.addColorStop(0, land.cave)
    cave.addColorStop(1, shade(land.rockDark, -0.1))
    pen.fillStyle = cave
    pen.beginPath()
    pen.ellipse(
      x + lift[0] * 0.12,
      y + lift[1] * 0.12,
      size * 0.55,
      size,
      Math.atan2(lift[1], lift[0]),
      0,
      Math.PI * 2
    )
    pen.fill()
  }
}

/**
 * Plateau on top: lit rock, grass patches, cracks
 * @param {DecorScene} scene - Scene
 * @param {Outline} top - Plateau footprint
 * @return {void}
 */

const paintPlateau = ({ pen, look, seed, place }: DecorScene, top: Outline): void => {
  const { land, sun } = look
  const rng = pieceRng(seed + 7)
  pen.save()
  trace(pen, top)
  pen.clip()
  for (let index = 0; index < 320; index += 1) {
    const x = place.x + (rng() - 0.5) * place.room * 2.6
    const y = rng() * 120 - 10
    const radius = 0.4 + rng() * 1.3
    pen.fillStyle = shade(
      [land.grassDark, land.grass, land.grassDark, land.scree][index % 4],
      (rng() - 0.5) * 0.12
    )
    pen.globalAlpha = 0.45
    pen.beginPath()
    pen.ellipse(x, y, radius, radius * 0.7, rng() * Math.PI, 0, Math.PI * 2)
    pen.fill()
  }
  pen.globalAlpha = 0.5
  pen.strokeStyle = land.strata
  pen.lineWidth = 0.06
  for (let index = 0; index < 50; index += 1) {
    const x = place.x + (rng() - 0.5) * place.room * 2
    const y = rng() * 120 - 10
    pen.beginPath()
    pen.moveTo(x, y)
    pen.lineTo(x - sun[1] * 1.2 + (rng() - 0.5), y + sun[0] * 1.2 + (rng() - 0.5))
    pen.stroke()
  }
  pen.restore()
}

/**
 * Cliff massif in a side band: shadow on the water, foam at its foot, a tall wall with caves, a green plateau
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintCliff: DecorPainter = (scene) => {
  const { pen, board, look, place, seed } = scene
  const { land, water, sun } = look
  const foot = footOf(scene)
  const massif = massifOf(scene, foot)
  const height = 4.6 * scene.piece.scale
  const lift = liftOf(board, place.x, place.y, height)
  const isWest = place.x < board.width / 2
  // Long shadow towards the grid when the sun stands opposite
  const reach = Math.max(0.4, (isWest ? -sun[0] : sun[0]) * 2)
  haze(pen, massif, { colour: look.light.shade, blur: 1.2, dx: isWest ? reach : -reach, dy: 0 })
  haze(pen, massif, { colour: water.foam, blur: 0.5 })
  const rng = pieceRng(seed + 11)
  for (let index = 0; index < foot.length; index += 4) {
    const [x, y] = foot[index]
    const out = (isWest ? 1 : -1) * (0.2 + rng() * 0.5)
    paintStone(scene, {
      outline: stoneOutline(x + out, y, 0.18 + rng() * 0.22, rng),
      x: x + out,
      y,
      height: 0.3,
    })
  }
  extrude(pen, {
    outline: massif,
    lift,
    side: shade(land.rock, -0.08),
    top: sunlit(pen, {
      x: place.x + lift[0],
      y: place.y,
      radius: place.room,
      sun,
      colour: land.grass,
      strength: 0.15,
    }),
  })
  paintWall(scene, foot, lift)
  const top = massif.map(([x, y]): [number, number] => [x + lift[0], y + lift[1]])
  paintPlateau(scene, top)
  pen.strokeStyle = shade(land.rockLight, 0.25)
  pen.lineWidth = 0.08
  pen.beginPath()
  foot.forEach(([x, y], index) =>
    index ? pen.lineTo(x + lift[0], y + lift[1]) : pen.moveTo(x + lift[0], y + lift[1])
  )
  pen.stroke()
}
