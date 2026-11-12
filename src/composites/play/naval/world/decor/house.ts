import { circle, paintBox, rect } from '@/composites/play/naval/world/decor/blocks'
import type { DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { extrude, shade, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline } from '@/composites/play/naval/world/pen'

// Squares between two rows of tiles
const TILE_ROW = 0.09

/**
 * White house of the village
 * @typedef {Object} HouseStand
 * @property {Lift} base - Lift of its terrace
 * @property {number} height - Walls, squares
 * @property {'hip' | 'flat'} roof - Tiled or terrace
 */

export interface HouseStand {
  x: number
  y: number
  width: number
  depth: number
  base: Lift
  height: number
  roof: 'hip' | 'flat'
  rng: () => number
}

/**
 * One slope of a tiled roof: lit by its facing, its rows of tiles
 * @param {DecorScene} scene - Scene
 * @param {Object} slope - Outline, facing and eave
 * @return {void}
 */

const paintSlope = (
  { pen, look }: DecorScene,
  {
    outline,
    facing,
    eave,
  }: { outline: Outline; facing: [number, number]; eave: [[number, number], [number, number]] }
): void => {
  const { land, sun } = look
  const light = facing[0] * sun[0] + facing[1] * sun[1]
  pen.fillStyle = shade(land.tile, light * 0.22)
  trace(pen, outline)
  pen.fill()
  pen.save()
  trace(pen, outline)
  pen.clip()
  pen.strokeStyle = shade(land.tileDark, light * 0.1)
  pen.lineWidth = 0.018
  pen.beginPath()
  const [[ax, ay], [bx, by]] = eave
  for (let row = 0; row < 8; row += 1) {
    const dx = -facing[0] * row * TILE_ROW
    const dy = -facing[1] * row * TILE_ROW
    pen.moveTo(ax + dx - facing[1] * 2, ay + dy + facing[0] * 2)
    pen.lineTo(bx + dx + facing[1] * 2, by + dy - facing[0] * 2)
  }
  pen.stroke()
  pen.restore()
}

/**
 * Hipped roof of terracotta tiles over a lifted box
 * @param {DecorScene} scene - Scene
 * @param {Object} roof - Box, its lift and the ridge rise
 * @return {void}
 */

const paintHipRoof = (
  scene: DecorScene,
  {
    x,
    y,
    width,
    depth,
    lift,
    rise,
  }: { x: number; y: number; width: number; depth: number; lift: Lift; rise: Lift }
): void => {
  const [dx, dy] = lift
  const half = Math.min(width, depth) / 2
  const isWide = width >= depth
  const ridge: [[number, number], [number, number]] = isWide
    ? [
        [x + half + dx + rise[0], y + depth / 2 + dy + rise[1]],
        [x + width - half + dx + rise[0], y + depth / 2 + dy + rise[1]],
      ]
    : [
        [x + width / 2 + dx + rise[0], y + half + dy + rise[1]],
        [x + width / 2 + dx + rise[0], y + depth - half + dy + rise[1]],
      ]
  const [nw, ne, se, sw]: Array<[number, number]> = [
    [x + dx, y + dy],
    [x + width + dx, y + dy],
    [x + width + dx, y + depth + dy],
    [x + dx, y + depth + dy],
  ]
  const [start, end] = ridge
  const slopes = isWide
    ? [
        { outline: [nw, ne, end, start], facing: [0, -1], eave: [nw, ne] },
        { outline: [sw, se, end, start], facing: [0, 1], eave: [se, sw] },
        { outline: [nw, sw, start], facing: [-1, 0], eave: [sw, nw] },
        { outline: [ne, se, end], facing: [1, 0], eave: [ne, se] },
      ]
    : [
        { outline: [nw, sw, end, start], facing: [-1, 0], eave: [sw, nw] },
        { outline: [ne, se, end, start], facing: [1, 0], eave: [ne, se] },
        { outline: [nw, ne, start], facing: [0, -1], eave: [nw, ne] },
        { outline: [sw, se, end], facing: [0, 1], eave: [se, sw] },
      ]
  for (const slope of slopes) {
    paintSlope(scene, slope as Parameters<typeof paintSlope>[1])
  }
  scene.pen.strokeStyle = shade(scene.look.land.tileLight, 0.1)
  scene.pen.lineWidth = 0.04
  scene.pen.beginPath()
  scene.pen.moveTo(...start)
  scene.pen.lineTo(...end)
  scene.pen.stroke()
}

/**
 * Flat white roof terrace: parapet, a blue door to the stairs, a water tank sometimes
 * @param {DecorScene} scene - Scene
 * @param {Object} roof - Box, its lift and source
 * @return {void}
 */

const paintTerrace = (
  { pen, look }: DecorScene,
  {
    x,
    y,
    width,
    depth,
    lift,
    rng,
  }: { x: number; y: number; width: number; depth: number; lift: Lift; rng: () => number }
): void => {
  const { land } = look
  const [dx, dy] = lift
  pen.strokeStyle = shade(land.whitewash, 0.4)
  pen.lineWidth = 0.05
  pen.strokeRect(x + dx + 0.03, y + dy + 0.03, width - 0.06, depth - 0.06)
  pen.strokeStyle = land.whitewashShade
  pen.lineWidth = 0.02
  pen.strokeRect(x + dx + 0.07, y + dy + 0.07, width - 0.14, depth - 0.14)
  const door = rng() < 0.5 ? x + 0.12 : x + width - 0.34
  pen.fillStyle = land.shutter
  pen.fillRect(door + dx, y + dy + 0.12, 0.22, 0.16)
  if (rng() < 0.4) return
  pen.fillStyle = land.whitewashShade
  pen.beginPath()
  pen.arc(x + width * 0.62 + dx, y + depth * 0.58 + dy, 0.1, 0, Math.PI * 2)
  pen.fill()
}

/**
 * White house: crisp shadow, limewashed walls, tiled or terrace roof
 * @param {DecorScene} scene - Scene
 * @param {HouseStand} house - House
 * @return {void}
 */

export const paintHouse = (scene: DecorScene, house: HouseStand): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const { x, y, width, depth, base, height, roof, rng } = house
  const lift = paintBox(pen, {
    board,
    outline: rect(x, y, width, depth),
    base,
    height,
    side: land.whitewashShade,
    top: land.whitewash,
    shadow: look.light.shade,
    sun,
  })
  if (roof === 'flat') return paintTerrace(scene, { x, y, width, depth, lift, rng })
  paintHipRoof(scene, {
    x,
    y,
    width,
    depth,
    lift,
    rise: liftOf(board, x, y, Math.min(width, depth) * 0.35),
  })
}

/**
 * Bougainvillea spilling over a wall: leaves, then pink and violet bracts
 * @param {DecorScene} scene - Scene
 * @param {Object} bush - Centre, spread and source
 * @return {void}
 */

export const paintBougainvillea = (
  { pen, look }: DecorScene,
  { x, y, spread, rng }: { x: number; y: number; spread: number; rng: () => number }
): void => {
  const { land } = look
  const blooms = [land.leafDark, land.leaf, land.bloom, land.bloomViolet, land.bloom]
  for (let index = 0; index < 34; index += 1) {
    const angle = rng() * Math.PI * 2
    const reach = Math.sqrt(rng()) * spread
    pen.fillStyle = shade(blooms[index % blooms.length], (rng() - 0.5) * 0.2)
    pen.beginPath()
    pen.arc(
      x + Math.cos(angle) * reach,
      y + Math.sin(angle) * reach * 0.8,
      spread * (0.12 + rng() * 0.1),
      0,
      Math.PI * 2
    )
    pen.fill()
  }
}

/**
 * Tree of the hills: a dark cypress spire or a silver olive crown, its shadow long
 * @param {DecorScene} scene - Scene
 * @param {Object} tree - Foot, kind, base
 * @return {void}
 */

export const paintTree = (
  { pen, board, look }: DecorScene,
  { x, y, base, kind }: { x: number; y: number; base: Lift; kind: 'cypress' | 'olive' }
): void => {
  const { land, sun } = look
  const foot = { x: x + base[0], y: y + base[1] }
  const isCypress = kind === 'cypress'
  const height = isCypress ? 0.9 : 0.7
  const radius = isCypress ? 0.2 : 0.38
  const top = liftOf(board, foot.x, foot.y, height)
  pen.fillStyle = look.light.shade
  pen.beginPath()
  pen.ellipse(
    foot.x - sun[0] * height * 0.5,
    foot.y - sun[1] * height * 0.5,
    radius,
    radius + height * 0.35,
    Math.atan2(sun[0], -sun[1]),
    0,
    Math.PI * 2
  )
  pen.fill()
  const colour = isCypress ? land.cypress : land.olive
  if (isCypress) {
    // Spire seen from above, narrowing to its tip
    for (let step = 0; step <= 10; step += 1) {
      const share = step / 10
      pen.fillStyle = shade(colour, -0.2 + share * 0.35)
      pen.beginPath()
      pen.arc(
        foot.x + top[0] * share,
        foot.y + top[1] * share,
        radius * (1 - share * 0.8),
        0,
        Math.PI * 2
      )
      pen.fill()
    }
    return
  }
  const crown = circle(foot.x + top[0], foot.y + top[1], radius)
  extrude(pen, {
    outline: crown,
    lift: [0, 0],
    side: shade(colour, -0.25),
    top: shade(colour, 0.08),
  })
  pen.fillStyle = shade(colour, 0.3)
  for (let leaf = 0; leaf < 6; leaf += 1) {
    pen.beginPath()
    pen.arc(
      foot.x + top[0] + Math.cos(leaf * 1.7) * radius * 0.5 + sun[0] * 0.08,
      foot.y + top[1] + Math.sin(leaf * 1.7) * radius * 0.5 + sun[1] * 0.08,
      radius * 0.22,
      0,
      Math.PI * 2
    )
    pen.fill()
  }
}
