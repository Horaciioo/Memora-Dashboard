import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { stageActor } from '@/composites/play/naval/world/life'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { blob, extrude, grow, haze, shade, sunlit } from '@/composites/play/naval/world/pen'

/**
 * Starfish lying on the sand, five soft arms
 * @param {DecorScene} scene - Scene
 * @param {Object} star - Centre, size, colour, turn
 * @return {void}
 */

const paintStar = (
  { pen }: DecorScene,
  { x, y, size, colour, turn }: { x: number; y: number; size: number; colour: string; turn: number }
): void => {
  pen.fillStyle = colour
  pen.beginPath()
  for (let point = 0; point < 10; point += 1) {
    const angle = turn + (point / 10) * Math.PI * 2
    const reach = point % 2 ? size * 0.38 : size
    const [px, py] = [x + Math.cos(angle) * reach, y + Math.sin(angle) * reach]
    if (point) pen.lineTo(px, py)
    else pen.moveTo(px, py)
  }
  pen.closePath()
  pen.fill()
  pen.fillStyle = shade(colour, 0.3)
  pen.beginPath()
  pen.arc(x, y, size * 0.16, 0, Math.PI * 2)
  pen.fill()
}

/**
 * Shell: a small ribbed fan
 * @param {DecorScene} scene - Scene
 * @param {Object} shell - Centre, size, colour, turn
 * @return {void}
 */

const paintShell = (
  { pen }: DecorScene,
  { x, y, size, colour, turn }: { x: number; y: number; size: number; colour: string; turn: number }
): void => {
  pen.fillStyle = colour
  pen.beginPath()
  pen.moveTo(x, y)
  pen.arc(x, y, size, turn, turn + Math.PI * 0.9)
  pen.closePath()
  pen.fill()
  pen.strokeStyle = shade(colour, -0.25)
  pen.lineWidth = size * 0.1
  pen.beginPath()
  for (let rib = 1; rib < 5; rib += 1) {
    const angle = turn + (rib / 5) * Math.PI * 0.9
    pen.moveTo(x, y)
    pen.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size)
  }
  pen.stroke()
}

/**
 * Sandbar: white sand barely out of the water, starfish and shells, sparkles around it
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintSandbar: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, water, sun } = look
  const rng = pieceRng(seed)
  const rx = Math.min(place.room * 0.45, 2.2) * piece.scale * (place.isAcross ? 1.3 : 0.8)
  const ry = Math.min(place.room * 0.45, 2.2) * piece.scale * (place.isAcross ? 0.6 : 1)
  const sand = blob({ x: place.x, y: place.y, rx, ry, seed, rough: 0.45 })
  haze(pen, grow(sand, 1.8), { colour: water.lagoon, blur: rx * 0.5 })
  haze(pen, grow(sand, 1.3), { colour: land.floor, blur: rx * 0.25 })
  haze(pen, sand, { colour: water.foam, blur: 0.12 })
  const lift = liftOf(board, place.x, place.y, 0.12)
  extrude(pen, {
    outline: sand,
    lift,
    side: land.sandDark,
    top: sunlit(pen, {
      x: place.x,
      y: place.y,
      radius: rx,
      sun,
      colour: land.sand,
      strength: 0.08,
    }),
  })
  const things = Array.from({ length: 7 }, (_, index) => {
    const angle = rng() * Math.PI * 2
    const reach = Math.sqrt(rng()) * 0.7

    return {
      x: place.x + lift[0] + Math.cos(angle) * rx * reach,
      y: place.y + lift[1] + Math.sin(angle) * ry * reach,
      size: 0.1 + rng() * 0.08,
      colour: [land.coralOrange, land.shell, land.coralPink, land.shell][index % 4],
      turn: rng() * Math.PI * 2,
      isStar: index % 2 === 0,
    }
  })
  for (const thing of things) (thing.isStar ? paintStar : paintShell)(scene, thing)
  stageActor(scene, {
    kind: 'glints',
    x: place.x,
    y: place.y,
    rx: rx * 1.6,
    ry: ry * 1.6,
    count: 8,
    colour: water.foam,
    seed: seed % 53,
  })
}
