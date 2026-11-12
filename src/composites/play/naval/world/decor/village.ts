import { paintBox, rect } from '@/composites/play/naval/world/decor/blocks'
import {
  paintBougainvillea,
  paintHouse,
  paintTree,
} from '@/composites/play/naval/world/decor/house'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, shade, sunlit } from '@/composites/play/naval/world/pen'
import type { Lift } from '@/composites/play/naval/world/pen'

// Squares of one terrace of the hill, and its rise
const TERRACE_DEPTH = 1.9
const TERRACE_RISE = 0.42
const TERRACES = 5

/**
 * One terrace: its retaining wall and dry garden ground
 * @param {DecorScene} scene - Scene
 * @param {Object} terrace - Front row and height
 * @return {Lift} - Lift of its ground
 */

const paintTerraceGround = (
  { pen, board, look, place }: DecorScene,
  { y, height }: { y: number; height: number }
): Lift => {
  const { land, sun } = look
  const ground = rect(-4, y, board.width + 8, board.height + 30 - y)
  const lift = liftOf(board, place.x, y, height)
  pen.fillStyle = look.light.shade
  pen.fillRect(-4, y - TERRACE_RISE * 0.9, board.width + 8, TERRACE_RISE * 0.9)
  extrude(pen, {
    outline: ground,
    lift,
    side: land.stoneDark,
    top: sunlit(pen, { x: place.x, y: y + 1, radius: 4, sun, colour: land.earth, strength: 0.05 }),
  })
  pen.fillStyle = land.stoneLight
  pen.fillRect(-4 + lift[0], y + lift[1], board.width + 8, 0.07)

  return lift
}

/**
 * Small white chapel: a box, a terracotta dome and its bell tower
 * @param {DecorScene} scene - Scene
 * @param {Object} chapel - Corner and base
 * @return {void}
 */

const paintChapel = (
  scene: DecorScene,
  { x, y, base }: { x: number; y: number; base: Lift }
): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const box = {
    board,
    base,
    side: land.whitewashShade,
    top: land.whitewash,
    shadow: look.light.shade,
    sun,
  }
  const roof = paintBox(pen, { ...box, outline: rect(x, y, 1.5, 1.1), height: 0.9 })
  const centre = { x: x + 0.75 + roof[0], y: y + 0.55 + roof[1] }
  const dome = pen.createRadialGradient(
    centre.x + sun[0] * 0.2,
    centre.y + sun[1] * 0.2,
    0.04,
    centre.x,
    centre.y,
    0.45
  )
  dome.addColorStop(0, shade(land.dome, 0.3))
  dome.addColorStop(1, shade(land.dome, -0.3))
  pen.fillStyle = dome
  pen.beginPath()
  pen.arc(centre.x, centre.y, 0.42, 0, Math.PI * 2)
  pen.fill()
  pen.fillStyle = land.whitewash
  pen.beginPath()
  pen.arc(centre.x, centre.y, 0.07, 0, Math.PI * 2)
  pen.fill()
  const bell = paintBox(pen, { ...box, outline: rect(x + 1.5, y + 0.1, 0.4, 0.4), height: 1.6 })
  pen.fillStyle = land.tile
  pen.fillRect(x + 1.5 + bell[0], y + 0.1 + bell[1], 0.4, 0.4)
  pen.fillStyle = land.iron
  pen.beginPath()
  pen.arc(x + 1.7 + bell[0], y + 0.3 + bell[1], 0.08, 0, Math.PI * 2)
  pen.fill()
}

/**
 * Houses along one terrace, lanes between them, a tree or bush now and then
 * @param {DecorScene} scene - Scene
 * @param {Object} row - Front row, base, rank and source
 * @return {void}
 */

const paintRow = (
  scene: DecorScene,
  { y, base, rank, rng }: { y: number; base: Lift; rank: number; rng: () => number }
): void => {
  const { board } = scene
  const chapelAt = rank === 1 ? board.left + board.size * 0.3 : Number.NaN
  let x = -3 + rng() * 1.5
  while (x < board.width + 3) {
    if (Math.abs(x - chapelAt) < 1.2) {
      paintChapel(scene, { x, y: y + 0.25, base })
      x += 2.6
      continue
    }
    const gap = rng()
    if (gap < 0.12) {
      paintTree(scene, { x: x + 0.3, y: y + 0.6, base, kind: rng() < 0.5 ? 'cypress' : 'olive' })
      x += 0.9
      continue
    }
    const width = 0.85 + rng() * 0.9
    const depth = 0.75 + rng() * 0.45
    const front = y + 0.15 + rng() * 0.3
    paintHouse(scene, {
      x,
      y: front,
      width,
      depth,
      base,
      height: 0.5 + rng() * 0.45,
      roof: rng() < 0.62 ? 'hip' : 'flat',
      rng,
    })
    if (rng() < 0.34) {
      paintBougainvillea(scene, {
        x: x + base[0] + (rng() < 0.5 ? 0 : width),
        y: front + base[1] - 0.05,
        spread: 0.42,
        rng,
      })
    }
    x += width + 0.12 + (rng() < 0.3 ? 0.35 : 0)
  }
}

/**
 * Hill village over the harbour: stone terraces climbing, white houses, tiled roofs, chapel, cypresses
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintVillage: DecorPainter = (scene) => {
  const { place, seed, pen } = scene
  const rng = pieceRng(seed)
  for (let rank = 0; rank < TERRACES; rank += 1) {
    const y = place.y + rank * TERRACE_DEPTH
    const base = paintTerraceGround(scene, { y, height: 0.3 + rank * TERRACE_RISE })
    paintRow(scene, { y, base, rank, rng })
  }
  // A few olive trees in the gardens above the roofs
  pen.save()
  pen.globalAlpha = 0.9
  for (let tree = 0; tree < 6; tree += 1) {
    const x = rng() * scene.board.width
    const rank = 2 + Math.floor(rng() * (TERRACES - 2))
    const base = liftOf(scene.board, place.x, place.y, 0.3 + rank * TERRACE_RISE)
    paintTree(scene, { x, y: place.y + rank * TERRACE_DEPTH + 1.55, base, kind: 'olive' })
  }
  pen.restore()
}
