import { circle, paintBox, paintLamp, rect } from '@/composites/play/naval/world/decor/blocks'
import { paintFoam } from '@/composites/play/naval/world/decor/rocks'
import { paintGlow, paintSmoke } from '@/composites/play/naval/world/decor/smoke'
import type { DecorPainter } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { extrude, shade, sunlit, trace } from '@/composites/play/naval/world/pen'
import type { Outline } from '@/composites/play/naval/world/pen'

/**
 * Coastal plant on a side band: a concrete pad, round tanks, pipes and a smoking stack
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintFactory: DecorPainter = (scene) => {
  const { pen, board, look, place, seed } = scene
  const { land, water, sun } = look
  const rng = pieceRng(seed)
  const x0 = board.left + board.size + place.room * 0.3
  const length = board.size * 0.32
  const pad: Outline = rect(x0, place.y - length / 2, place.room * 0.7 + 4, length)
  paintFoam(pen, pad, water.foam, 0.06)
  const base = liftOf(board, place.x, place.y, 0.35)
  extrude(pen, { outline: pad, lift: base, side: land.concreteDark, top: land.concrete })
  const tanks = Array.from({ length: 4 }, (_, index) => ({
    x: x0 + 1.4 + (index % 2) * 2.1,
    y: place.y - length / 2 + 2 + Math.floor(index / 2) * 3.2 + rng() * 0.4,
  }))
  pen.strokeStyle = land.steel
  pen.lineWidth = 0.14
  pen.beginPath()
  tanks.forEach(({ x, y }, index) => (index ? pen.lineTo(x + base[0], y + base[1]) : pen.moveTo(x + base[0], y + base[1])))
  pen.stroke()
  for (const tank of tanks) {
    const top = paintBox(pen, {
      board,
      outline: circle(tank.x, tank.y, 0.85),
      base,
      height: 0.9,
      side: land.concreteDark,
      top: sunlit(pen, { x: tank.x, y: tank.y, radius: 0.85, sun, colour: land.concreteLight }),
      shadow: look.light.shade,
      sun,
    })
    pen.strokeStyle = shade(land.concreteDark, 0.1)
    pen.lineWidth = 0.05
    trace(pen, circle(tank.x, tank.y, 0.55), top[0], top[1])
    pen.stroke()
  }
  const stack = { x: x0 + 1.2, y: place.y + length / 2 - 1.4 }
  const tip = paintBox(pen, {
    board,
    outline: rect(stack.x, stack.y, 0.45, 0.45),
    base,
    height: 3.4,
    side: land.rust,
    top: land.steel,
    shadow: look.light.shade,
    sun,
  })
  paintSmoke(pen, {
    x: stack.x + tip[0] + 0.2,
    y: stack.y + tip[1],
    wind: [0.55, -0.25],
    size: 0.3,
    puffs: 10,
    colour: land.concreteLight,
    rng,
  })
}

/**
 * Oil rig in a far corner: legs in the water, a deck, a derrick and a burning flare
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintRig: DecorPainter = (scene) => {
  const { pen, board, look, place, piece } = scene
  const { land, water, sun } = look
  const half = 1.1 * piece.scale
  const { x, y } = place
  const deck = liftOf(board, x, y, 1.4)
  pen.fillStyle = look.light.shade
  trace(pen, rect(x - half, y - half, half * 2, half * 2), -sun[0] * 1.6, -sun[1] * 1.6)
  pen.fill()
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const foot = { x: x + dx * half * 0.8, y: y + dy * half * 0.8 }
    paintFoam(pen, circle(foot.x, foot.y, 0.16), water.foam, 0.04)
    pen.strokeStyle = land.steel
    pen.lineWidth = 0.16
    pen.beginPath()
    pen.moveTo(foot.x, foot.y)
    pen.lineTo(foot.x + deck[0], foot.y + deck[1])
    pen.stroke()
  }
  const top = paintBox(pen, {
    board,
    outline: rect(x - half, y - half, half * 2, half * 2),
    base: deck,
    height: 0.25,
    side: land.steel,
    top: land.concreteDark,
    shadow: 'rgba(0,0,0,0)',
    sun,
  })
  const derrick = liftOf(board, x, y, 2.6)
  pen.strokeStyle = land.crane
  pen.lineWidth = 0.07
  for (const [dx, dy] of [[-0.4, -0.4], [0.4, -0.4], [0.4, 0.4], [-0.4, 0.4]]) {
    pen.beginPath()
    pen.moveTo(x + dx + top[0], y + dy + top[1])
    pen.lineTo(x + top[0] + derrick[0], y + top[1] + derrick[1])
    pen.stroke()
  }
  const flare = { x: x + half * 1.9 + top[0], y: y - half * 0.4 + top[1] }
  pen.strokeStyle = land.steel
  pen.lineWidth = 0.09
  pen.beginPath()
  pen.moveTo(x + half + top[0], y + top[1])
  pen.lineTo(flare.x, flare.y)
  pen.stroke()
  paintGlow(pen, { x: flare.x, y: flare.y, radius: 2.4, colour: land.flare })
  paintLamp(pen, { x: flare.x, y: flare.y, radius: 0.5, colour: land.lamp })
  scene.light?.({ x: flare.x, y: flare.y, radius: 1.6, colour: land.flare, beat: 'flicker' })
}
