import { paintBox, paintLamp, paintRoof, rect } from '@/composites/play/naval/world/decor/blocks'
import { hullOf } from '@/composites/play/naval/world/decor/coast'
import { paintFoam } from '@/composites/play/naval/world/decor/rocks'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, shade, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Lift, Outline } from '@/composites/play/naval/world/pen'

/**
 * Quay line and piers: land from the quay to past the board edge, piers reaching towards the grid
 * @param {DecorScene} scene - Scene
 * @return {{ land: Outline; quay: number; piers: number[] }} - Footprint, quay row, pier columns
 */

const layoutOf = ({ board, place }: DecorScene) => {
  const quay = board.top + board.size + place.room * 0.42
  const left = board.left - 4
  const right = board.left + board.size * 0.92
  // One pier every few squares of quay
  const count = Math.max(2, Math.floor((right - left) / 7))
  const piers = Array.from({ length: count }, (_, index) => left + 7 + index * ((right - left - 10) / (count - 1)))
  const land: Outline = [[left, quay]]
  for (const pier of piers) {
    land.push([pier - 0.5, quay], [pier - 0.5, quay - place.room * 0.24], [pier + 0.5, quay - place.room * 0.24], [pier + 0.5, quay])
  }
  land.push([right, quay], [right + 2, quay + 2], [right + 2, board.height + 30], [left, board.height + 30])

  return { land, quay, piers, left, right }
}

/**
 * Container stacks in rows, colours mixed
 * @param {DecorScene} scene - Scene
 * @param {Object} yard - Area and base
 * @return {void}
 */

const paintContainers = (scene: DecorScene, { x, y, base }: { x: number; y: number; base: Lift }): void => {
  const { pen, board, look, seed } = scene
  const { land, sun } = look
  const rng = pieceRng(seed + 4)
  const colours = [land.roofWarm, land.crane, land.roof, land.rust, land.concreteLight]
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const colour = colours[Math.floor(rng() * colours.length)]
      const height = 0.25 * (1 + Math.floor(rng() * 3))
      paintBox(pen, {
        board,
        outline: rect(x + column * 0.75, y + row * 0.42, 0.66, 0.32),
        base,
        height,
        side: shade(colour, -0.25),
        top: colour,
        shadow: look.light.shade,
        sun,
      })
    }
  }
}

/**
 * Gantry crane on the quay, its boom reaching over the water
 * @param {DecorScene} scene - Scene
 * @param {Object} crane - Foot and base
 * @return {void}
 */

const paintCrane = (scene: DecorScene, { x, y, base }: { x: number; y: number; base: Lift }): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const [lx, ly] = liftOf(board, x, y, 2.6)
  const reach = 2.2
  pen.lineCap = 'round'
  pen.strokeStyle = look.light.shade
  pen.lineWidth = 0.16
  pen.beginPath()
  pen.moveTo(x + base[0] - sun[0] * 2, y + base[1] - sun[1] * 2)
  pen.lineTo(x + base[0] - sun[0] * 2, y + base[1] - reach - sun[1] * 2)
  pen.stroke()
  for (const leg of [-0.35, 0.35]) {
    pen.strokeStyle = land.craneDark
    pen.lineWidth = 0.1
    pen.beginPath()
    pen.moveTo(x + leg + base[0], y + base[1])
    pen.lineTo(x + leg + base[0] + lx, y + base[1] + ly)
    pen.stroke()
  }
  pen.strokeStyle = land.crane
  pen.lineWidth = 0.2
  pen.beginPath()
  pen.moveTo(x + base[0] + lx, y + base[1] + ly + 0.8)
  pen.lineTo(x + base[0] + lx, y + base[1] + ly - reach)
  pen.stroke()
  const lamp = { x: x + base[0] + lx, y: y + base[1] + ly - reach }
  paintLamp(pen, { ...lamp, radius: 0.5, colour: land.lamp })
  scene.light?.({ ...lamp, radius: 0.7, colour: land.beacon, beat: 'blink' })
}

/**
 * Grey warship moored beside a pier: wake shadow, hull, deck and bridge
 * @param {DecorScene} scene - Scene
 * @param {Object} berth - Centre
 * @return {void}
 */

const paintMoored = (scene: DecorScene, { x, y }: { x: number; y: number }): void => {
  const { pen, board, look } = scene
  const { land, sun } = look
  const hull = hullOf(x, y, 2.6, Math.PI / 2)
  const deck = liftOf(board, x, y, 0.35)
  pen.fillStyle = look.light.shade
  trace(pen, hull, -sun[0] * 0.4, -sun[1] * 0.4)
  pen.fill()
  extrude(pen, { outline: hull, lift: deck, side: land.steel, top: land.concreteLight })
  const bridge = rect(x - 0.13, y - 0.1, 0.26, 0.45)
  const top = liftOf(board, x, y, 0.8)
  extrude(pen, { outline: bridge.map(([px, py]): [number, number] => [px + deck[0], py + deck[1]]), lift: [top[0] - deck[0], top[1] - deck[1]], side: land.steel, top: land.concrete })
}

/**
 * Military harbour on the south band: concrete quays and piers, warehouses, containers, cranes, lamps
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintHarbour: DecorPainter = (scene) => {
  const { pen, board, look, place } = scene
  const { land, water, sun } = look
  const { land: ground, quay, piers, left, right } = layoutOf(scene)
  const base = liftOf(board, place.x, quay, 0.45)
  paintFoam(pen, ground, water.foam, 0.06)
  pen.fillStyle = look.light.shade
  trace(pen, ground, -sun[0] * 0.5, -sun[1] * 0.5)
  pen.fill()
  extrude(pen, {
    outline: ground,
    lift: base,
    side: land.concreteDark,
    top: sunlit(pen, { x: place.x, y: quay + 3, radius: 8, sun, colour: land.concrete, strength: 0.08 }),
  })
  // Quay edge marking
  pen.strokeStyle = land.crane
  pen.lineWidth = 0.08
  pen.setLineDash([0.5, 0.35])
  pen.beginPath()
  pen.moveTo(left + base[0], quay + base[1] + 0.25)
  pen.lineTo(right + base[0], quay + base[1] + 0.25)
  pen.stroke()
  pen.setLineDash([])
  const halls = Math.floor((right - left - 6) / 4.5)
  for (let index = 0; index < halls; index += 1) {
    const x = left + 5 + index * 4.5
    const y = quay + 1.4 + (index % 2) * 0.6
    if (index % 3 === 1) {
      paintContainers(scene, { x, y, base })
      continue
    }
    const roof = paintBox(pen, {
      board,
      outline: rect(x, y, 3.6, 2),
      base,
      height: 1.1,
      side: land.concreteDark,
      top: land.roof,
      shadow: look.light.shade,
      sun,
    })
    paintRoof(pen, { x, y, width: 3.6, height: 2, lift: roof, colour: index % 2 ? land.roof : land.roofWarm })
  }
  piers.slice(0, -1).forEach((pier, index) => paintMoored(scene, { x: pier + 1.9, y: quay - 1.4 - (index % 2) * 0.3 }))
  for (const pier of piers) paintCrane(scene, { x: pier, y: quay - 0.4, base })
  for (let index = 0; index < 5; index += 1) {
    paintLamp(pen, { x: left + 6 + index * ((right - left - 8) / 4) + base[0], y: quay + base[1] + 0.5, radius: 0.7, colour: land.lamp })
  }
}
