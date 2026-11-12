import { paintFoam } from '@/composites/play/naval/world/decor/rocks'
import { paintGlow, paintSmoke } from '@/composites/play/naval/world/decor/smoke'
import type { DecorPainter, DecorScene } from '@/composites/play/naval/world/decor/types'
import { liftOf } from '@/composites/play/naval/world/geometry'
import { pieceRng } from '@/composites/play/naval/world/noise'
import { blob, extrude, haze, mix, shade, shift, sunlit } from '@/composites/play/naval/world/pen'
import type { Lift } from '@/composites/play/naval/world/pen'

// Terraces of the cone, base to crater
const TIERS = 9
// Lava streams down the flank
const STREAMS = 4

/**
 * Point on the flank at a share of the way down
 * @param {DecorScene} scene - Scene
 * @param {Object} path - Stream
 * @return {[number, number]} - Point
 */

const flankAt = (
  { board, place }: DecorScene,
  { angle, down, radius, height }: { angle: number; down: number; radius: number; height: number }
): [number, number] => {
  const x = place.x + Math.cos(angle) * radius * (0.18 + down * 0.82)
  const y = place.y + Math.sin(angle) * radius * 0.8 * (0.18 + down * 0.82)
  const [lx, ly] = liftOf(board, place.x, place.y, height * (1 - down) ** 1.4)

  return [x + lx, y + ly]
}

/**
 * Lava streams: a glowing wide stroke
 * @param {DecorScene} scene - Scene
 * @param {Object} cone - Radius and height
 * @return {void}
 */

const paintLava = (
  scene: DecorScene,
  { radius, height }: { radius: number; height: number }
): void => {
  const { pen, look, seed, board, place } = scene
  const rng = pieceRng(seed + 5)
  // Streams run towards the grid side
  const facing = Math.atan2(board.height / 2 - place.y, board.width / 2 - place.x)
  for (let stream = 0; stream < STREAMS; stream += 1) {
    const angle = facing + (stream - (STREAMS - 1) / 2) * 0.55 + (rng() - 0.5) * 0.3
    const length = 0.55 + rng() * 0.4
    const points = Array.from({ length: 14 }, (_, index) =>
      flankAt(scene, {
        angle: angle + Math.sin(index * 0.9 + stream) * 0.06,
        down: (index / 13) * length,
        radius,
        height,
      })
    )
    for (const [width, colour, blur] of [
      [0.5, look.land.lava, 0.9],
      [0.16, look.land.lavaCore, 0.3],
    ] as const) {
      pen.save()
      pen.strokeStyle = colour
      pen.lineWidth = width
      pen.lineCap = 'round'
      pen.lineJoin = 'round'
      pen.shadowColor = look.land.lava
      pen.shadowBlur = blur * pen.getTransform().a
      pen.beginPath()
      points.forEach(([x, y], index) => (index ? pen.lineTo(x, y) : pen.moveTo(x, y)))
      pen.stroke()
      pen.restore()
    }
  }
}

/**
 * Crater: dark rim, molten heart, glow and embers
 * @param {DecorScene} scene - Scene
 * @param {Object} crater - Top and size
 * @return {void}
 */

const paintCrater = (
  { pen, look, seed, light }: DecorScene,
  { top, radius }: { top: [number, number]; radius: number }
): void => {
  const { land } = look
  const [x, y] = top
  pen.fillStyle = land.rockDark
  pen.beginPath()
  pen.ellipse(x, y, radius, radius * 0.72, 0, 0, Math.PI * 2)
  pen.fill()
  const heart = pen.createRadialGradient(x, y + radius * 0.1, 0, x, y, radius * 0.8)
  heart.addColorStop(0, land.lavaCore)
  heart.addColorStop(0.45, land.lava)
  heart.addColorStop(1, land.crust)
  pen.fillStyle = heart
  pen.beginPath()
  pen.ellipse(x, y + radius * 0.06, radius * 0.72, radius * 0.5, 0, 0, Math.PI * 2)
  pen.fill()
  paintGlow(pen, { x, y, radius: radius * 4, colour: look.water.glow, strength: 0.9 })
  light?.({ x, y, radius: radius * 5, colour: look.water.glow, beat: 'pulse' })
  const rng = pieceRng(seed + 13)
  pen.fillStyle = land.lavaCore
  for (let ember = 0; ember < (look.life.embers ?? 0); ember += 1) {
    const size = 0.04 + rng() * 0.07
    pen.globalAlpha = 0.5 + rng() * 0.5
    pen.beginPath()
    pen.arc(x + (rng() - 0.5) * radius * 3, y - rng() * radius * 3.5, size, 0, Math.PI * 2)
    pen.fill()
  }
  pen.globalAlpha = 1
}

/**
 * Volcano in its corner: terraced cone of black rock to grey ash, lava down the grid side, a lit plume blown away
 * @param {DecorScene} scene - Scene
 * @return {void}
 */

export const paintVolcano: DecorPainter = (scene) => {
  const { pen, board, look, place, piece, seed } = scene
  const { land, water, sun } = look
  // Room to the grid corner, the cone never reaches it
  const radius = place.room * 0.62 * piece.scale
  const height = radius * 0.9
  const base = blob({ x: place.x, y: place.y, rx: radius, ry: radius * 0.8, seed, rough: 0.3 })
  paintGlow(pen, {
    x: place.x,
    y: place.y,
    radius: radius * 2.2,
    colour: water.glow,
    strength: 0.55,
  })
  haze(pen, base, {
    colour: look.light.shade,
    blur: radius * 0.3,
    dx: -sun[0] * 2,
    dy: -sun[1] * 2,
  })
  paintFoam(pen, base, water.foam, 0.12)
  let lifted: Lift = [0, 0]
  for (let tier = 0; tier < TIERS; tier += 1) {
    const share = tier / TIERS
    const ring = blob({
      x: place.x,
      y: place.y,
      rx: radius * (1 - share * 0.86),
      ry: radius * 0.8 * (1 - share * 0.86),
      seed: seed + tier,
      rough: 0.3 - share * 0.15,
    })
    const next = liftOf(board, place.x, place.y, height * ((tier + 1) / TIERS) ** 0.85)
    const colour = mix(land.rock, land.ash, share)
    extrude(pen, {
      outline: shift(ring, lifted),
      lift: [next[0] - lifted[0], next[1] - lifted[1]],
      side: shade(land.rockDark, share * 0.2),
      top: sunlit(pen, {
        x: place.x + next[0],
        y: place.y + next[1],
        radius: radius * (1 - share),
        sun,
        colour,
        strength: 0.25,
      }),
    })
    lifted = next
  }
  paintLava(scene, { radius, height })
  const top: [number, number] = [place.x + lifted[0], place.y + lifted[1]]
  paintCrater(scene, { top, radius: radius * 0.14 })
  // Plume blown off the board, never over the grid
  const away = Math.atan2(place.y - board.height / 2, place.x - board.width / 2)
  paintSmoke(pen, {
    x: top[0],
    y: top[1] - radius * 0.1,
    wind: [Math.cos(away) * radius * 0.16, Math.sin(away) * radius * 0.16 - radius * 0.05],
    size: radius * 0.2,
    puffs: 16,
    colour: land.smokeLight,
    glow: water.glow,
    rng: pieceRng(seed + 21),
  })
}
