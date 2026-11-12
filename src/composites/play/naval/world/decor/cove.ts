import {
  circle,
  paintBox,
  paintLamp,
  paintRoof,
  rect,
} from '@/composites/play/naval/world/decor/blocks'
import { paintBoat } from '@/composites/play/naval/world/decor/boat'
import { paintCanopy } from '@/composites/play/naval/world/decor/island'
import { paintPalm } from '@/composites/play/naval/world/decor/palm'
import { paintBarrel, paintCrate } from '@/composites/play/naval/world/decor/props'
import { paintSand, shoreOf } from '@/composites/play/naval/world/decor/shore'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { stageActor } from '@/composites/play/naval/world/life'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, shade, shift, trace } from '@/composites/play/naval/world/pen'
import type { Lift } from '@/composites/play/naval/world/pen'

// Squares from the grid to the water line, the bay hollow, the sand depth
const SHORE = 0.9
const HOLLOW = 1.1
const BEACH = 2.6

/**
 * Point of the cove, counted from the grid edge outwards and along the side
 * @param {DecorScene} scene - Scene
 * @param {number} away - Squares off the grid
 * @param {number} along - Squares along, from the piece
 * @return {{ x: number; y: number }} - Point
 */

const spotOf = ({ board, place }: DecorScene, away: number, along: number) =>
  place.x < board.left
    ? { x: board.left - away, y: place.y + along }
    : { x: board.left + board.size + away, y: place.y + along }

/**
 * Patched canvas tent, its guy ropes pegged in the sand
 * @param {DecorScene} scene - Scene
 * @param {Object} tent - Corner and sand lift
 * @return {void}
 */

const paintTent = (
  scene: DecorScene,
  { x, y, base }: { x: number; y: number; base: Lift }
): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  pen.strokeStyle = land.rope
  pen.lineWidth = 0.025
  pen.beginPath()
  for (const [dx, dy] of [
    [-0.35, -0.3],
    [1.95, -0.3],
    [-0.35, 1.5],
    [1.95, 1.5],
  ]) {
    pen.moveTo(x + 0.8 + base[0], y + 0.6 + base[1])
    pen.lineTo(x + dx + base[0], y + dy + base[1])
  }
  pen.stroke()
  const roof = paintBox(pen, {
    board,
    outline: rect(x, y, 1.6, 1.2),
    base,
    height: 0.6,
    side: land.canvasDark,
    top: land.canvas,
    shadow: look.light.shade,
    sun,
  })
  paintRoof(pen, { x, y, width: 1.6, height: 1.2, lift: roof, colour: land.canvas })
  pen.fillStyle = land.canvasDark
  pen.fillRect(x + 0.2 + roof[0], y + 0.08 + roof[1], 0.24, 0.2)
  pen.fillRect(x + 0.75 + roof[0], y + 0.55 + roof[1], 0.2, 0.22)
}

/**
 * Camp fire: a ring of stones, crossed logs, embers glowing
 * @param {DecorScene} scene - Scene
 * @param {Object} fire - Centre
 * @return {void}
 */

const paintFire = (scene: DecorScene, { x, y }: { x: number; y: number }): void => {
  const { pen, look } = scene
  const { land } = look
  pen.fillStyle = shade(land.sandDark, -0.2)
  pen.beginPath()
  pen.arc(x, y, 0.3, 0, Math.PI * 2)
  pen.fill()
  for (let stone = 0; stone < 8; stone += 1) {
    const angle = (stone / 8) * Math.PI * 2
    pen.fillStyle = shade(land.rock, (stone % 3) * 0.08)
    pen.beginPath()
    pen.arc(x + Math.cos(angle) * 0.3, y + Math.sin(angle) * 0.26, 0.07, 0, Math.PI * 2)
    pen.fill()
  }
  pen.strokeStyle = land.woodDark
  pen.lineWidth = 0.06
  pen.beginPath()
  pen.moveTo(x - 0.18, y - 0.12)
  pen.lineTo(x + 0.18, y + 0.12)
  pen.moveTo(x - 0.18, y + 0.12)
  pen.lineTo(x + 0.18, y - 0.12)
  pen.stroke()
  paintLamp(pen, { x, y, radius: 0.5, colour: land.fire })
  scene.light?.({ x, y, radius: 1.1, colour: land.fire, beat: 'flicker' })
}

/**
 * Lantern on its post, lit at the end of the day
 * @param {DecorScene} scene - Scene
 * @param {Object} post - Foot and lift
 * @return {void}
 */

const paintLantern = (scene: DecorScene, { x, y }: { x: number; y: number }): void => {
  const { pen, board, look } = scene
  const { land } = look
  const top = liftOf(board, x, y, 0.8)
  pen.strokeStyle = land.woodDark
  pen.lineWidth = 0.05
  pen.beginPath()
  pen.moveTo(x, y)
  pen.lineTo(x + top[0], y + top[1])
  pen.stroke()
  pen.fillStyle = land.lamp
  pen.fillRect(x + top[0] - 0.06, y + top[1] - 0.06, 0.12, 0.12)
  paintLamp(pen, { x: x + top[0], y: y + top[1], radius: 0.45, colour: land.lamp })
  scene.light?.({ x: x + top[0], y: y + top[1], radius: 0.7, colour: land.lamp, beat: 'flicker' })
}

/**
 * Treasure chest left open, gold catching the low sun
 * @param {DecorScene} scene - Scene
 * @param {Object} chest - Centre
 * @return {void}
 */

const paintChest = (scene: DecorScene, { x, y }: { x: number; y: number }): void => {
  const { pen, board, look } = scene
  const { land } = look
  const box = rect(x - 0.22, y - 0.14, 0.44, 0.28)
  extrude(pen, {
    outline: box,
    lift: liftOf(board, x, y, 0.18),
    side: land.woodDark,
    top: land.gold,
  })
  pen.fillStyle = land.wood
  trace(pen, rect(x - 0.22, y - 0.34, 0.44, 0.18))
  pen.fill()
  pen.strokeStyle = land.iron
  pen.lineWidth = 0.03
  pen.stroke()
}

/**
 * Jungle behind the beach: a raised green wall of round crowns
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

const paintJungle = (scene: DecorScene): void => {
  const { pen, board, look, place } = scene
  const green = shoreOf(scene, { edge: SHORE + BEACH, hollow: HOLLOW })
  const lift = liftOf(board, place.x, place.y, 0.8)
  extrude(pen, { outline: green, lift, side: look.land.leafDark, top: look.land.leaf })
  const centre = spotOf(scene, SHORE + BEACH + 2.2, 0)
  paintCanopy(scene, shift(green, lift), {
    x: centre.x + lift[0],
    y: centre.y + lift[1],
    rx: 2.4,
    ry: board.size * 0.7,
  })
}

/**
 * Pirate cove: sandy bay, jungle, palms flying black flags, camp with tent, fire, lanterns and loot
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintCove: DecorPainter = (scene) => {
  const { pen, look, seed } = scene
  const { land } = look
  const rng = pieceRng(seed)
  const base = paintSand(scene, shoreOf(scene, { edge: SHORE, hollow: HOLLOW }))
  const at = (away: number, along: number) => spotOf(scene, away, along)
  paintBoat(scene, {
    ...at(1.2, 2.6),
    length: 1.3,
    angle: 0.5,
    hull: land.wood,
    trim: land.woodDark,
    hasOars: true,
  })
  paintJungle(scene)
  paintTent(scene, { ...at(3.3, -1.6), base })
  paintFire(scene, at(2.2 + base[0], 0.2))
  for (const [away, along] of [
    [1.8, -1.5],
    [2.1, 1.4],
  ])
    paintLantern(scene, at(away, along))
  paintChest(scene, at(2.9, 0.9))
  const loot = Array.from({ length: 9 }, () => ({
    ...at(1.5 + rng() * 1.8, -3.5 + rng() * 7.5),
    rng: rng(),
  }))
  for (const item of loot.toSorted((a, b) => a.y - b.y)) {
    const spot = { x: item.x, y: item.y, base, size: 0.13 + item.rng * 0.06 }
    if (item.rng < 0.55) paintBarrel(scene, { ...spot, isLying: item.rng < 0.2 })
    else paintCrate(scene, { ...spot, turn: item.rng * 3 })
  }
  pen.strokeStyle = land.rope
  pen.lineWidth = 0.035
  for (let coil = 0; coil < 3; coil += 1) {
    const spot = at(1.4 + coil * 0.5, -2.4 + coil * 2.1)
    for (const radius of [0.08, 0.13, 0.18]) {
      trace(pen, circle(spot.x + base[0], spot.y + base[1], radius))
      pen.stroke()
    }
  }
  const palms = Array.from({ length: 6 }, (_, index) =>
    at(SHORE + BEACH - 0.5 + rng() * 0.6, -6 + index * 2.4)
  )
  palms.forEach((foot, index) => {
    const isFlagged = index % 2 === 1
    paintPalm(scene, {
      ...foot,
      size: 0.6 + rng() * 0.2,
      rng,
      lean: [scene.place.x < scene.board.left ? 0.6 : -0.6, -0.2],
      hasNuts: index % 3 === 0,
    })
    if (!isFlagged) return
    const top = liftOf(scene.board, foot.x, foot.y, 0.9)
    stageActor(scene, {
      kind: 'flag',
      x: foot.x + top[0] + 0.25,
      y: foot.y + top[1],
      size: 0.32,
      cloth: land.flag,
      mark: land.mark,
      seed: index * 1.3,
    })
  })
}
