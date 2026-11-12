import type { OceanFrame } from '@/composites/play/naval/ocean/paint/frame'
import type { DecorLight, DecorPainters } from '@/composites/play/naval/world/decor'
import { boardOf, placeOf } from '@/composites/play/naval/world/geometry'
import type { WorldBoard } from '@/composites/play/naval/world/geometry'
import { orderActors, paintActors } from '@/composites/play/naval/world/life'
import type { DecorActor } from '@/composites/play/naval/world/life'
import { paintWorld } from '@/composites/play/naval/world/scene'
import { NAVAL_MAPS } from '@/declarations/play/naval/maps'
import type { NavalMapMeta } from '@/declarations/play/naval/maps'
import { SECOND_MS } from '@/utils/constants/time'

// Pixels of the bed worked out across, the rest stretched
const BED_PX = 320
// Pixels of a light sprite
const SPRITE_PX = 64
// Seconds of a blink, share lit, flaps per second
const BLINK_S = 1.8
const BLINK_LIT = 0.18
const FLAPS = 2.4
// Seconds of a lava breath
const PULSE_S = 4
const EMBERS = 6
const EMBER_S = 3.2

/**
 * Map drawn around the sea of a game
 * @typedef {Object} StageWorld
 * @property {string} key - Changes when the picture does
 * @property {(frame: OceanFrame) => void} paintStill - Water and decor, into the still layer
 * @property {(frame: OceanFrame) => void} paintLife - Moving things, lights and birds, every frame
 */

export interface StageWorld {
  key: string
  paintStill: (frame: OceanFrame) => void
  paintLife: (frame: OceanFrame) => void
}

// Light sprites by colour
const sprites = new Map<string, HTMLCanvasElement>()

/**
 * Soft round light of a colour, drawn once
 * @param {string} colour - Light colour
 * @return {HTMLCanvasElement} - Sprite
 */

const spriteOf = (colour: string): HTMLCanvasElement => {
  const known = sprites.get(colour)
  if (known) return known
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_PX
  canvas.height = SPRITE_PX
  const pen = canvas.getContext('2d')
  if (pen) {
    const half = SPRITE_PX / 2
    const glow = pen.createRadialGradient(half, half, 0, half, half, half)
    glow.addColorStop(0, colour)
    glow.addColorStop(0.2, colour)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    pen.fillStyle = glow
    pen.fillRect(0, 0, SPRITE_PX, SPRITE_PX)
  }
  sprites.set(colour, canvas)

  return canvas
}

/**
 * Strength of a living light at a moment
 * @param {DecorLight} light - Light
 * @param {number} seconds - Clock
 * @param {number} index - Light rank, keeps them out of step
 * @return {number} - Zero to one
 */

const strengthOf = ({ beat }: DecorLight, seconds: number, index: number): number => {
  if (beat === 'blink') {
    const phase = (seconds / BLINK_S + index * 0.37) % 1

    return phase < BLINK_LIT ? Math.sin((phase / BLINK_LIT) * Math.PI) : 0
  }
  if (beat === 'flicker')
    return 0.45 + 0.25 * Math.sin(seconds * 13 + index) + 0.15 * Math.sin(seconds * 31)

  return 0.3 + 0.3 * Math.sin((seconds / PULSE_S) * Math.PI * 2 + index)
}

/**
 * Embers rising from a crater and fading
 * @param {CanvasRenderingContext2D} pen - Pen in squares
 * @param {DecorLight} crater - Crater light
 * @param {Object} beat - Clock and share of life
 * @return {void}
 */

const paintEmbers = (
  pen: CanvasRenderingContext2D,
  crater: DecorLight,
  { seconds, count, colour }: { seconds: number; count: number; colour: string }
): void => {
  pen.fillStyle = colour
  for (let ember = 0; ember < count; ember += 1) {
    const age = (seconds / EMBER_S + ember / count) % 1
    const drift = Math.sin(ember * 2.3 + seconds * 0.8) * 0.5
    pen.globalAlpha = (1 - age) * 0.9
    pen.beginPath()
    pen.arc(
      crater.x + drift + (ember - count / 2) * 0.12,
      crater.y - age * crater.radius * 0.6,
      0.06,
      0,
      Math.PI * 2
    )
    pen.fill()
  }
  pen.globalAlpha = 1
}

/**
 * Birds gliding in rings over the decor, wings beating
 * @param {CanvasRenderingContext2D} pen - Pen in squares
 * @param {Object} view - Board, map and clock
 * @return {void}
 */

const paintBirds = (
  pen: CanvasRenderingContext2D,
  {
    board,
    map,
    seconds,
    count,
  }: { board: WorldBoard; map: NavalMapMeta; seconds: number; count: number }
): void => {
  const { look } = map
  if (!look.decor.length) return
  pen.lineWidth = 0.06
  pen.lineCap = 'round'
  const plumage = look.land.bird ?? look.water.foam
  for (let bird = 0; bird < count; bird += 1) {
    const place = placeOf(board, look, look.decor[bird % look.decor.length])
    const ring = Math.max(0.8, place.room * 0.35) * (0.7 + (bird % 3) * 0.15)
    const angle = seconds * (0.25 + bird * 0.04) + bird * 2.1
    const x = place.x + Math.cos(angle) * ring
    const y = place.y + Math.sin(angle) * ring * 0.7
    const wing = 0.22 * (0.6 + 0.4 * Math.sin(seconds * FLAPS * Math.PI * 2 + bird))
    for (const [colour, dx, dy] of [
      [look.light.shade, 0.5, 0.6],
      [plumage, 0, 0],
    ] as const) {
      pen.strokeStyle = colour
      pen.beginPath()
      pen.moveTo(x + dx - 0.22, y + dy - wing)
      pen.quadraticCurveTo(x + dx - 0.1, y + dy - 0.05, x + dx, y + dy)
      pen.quadraticCurveTo(x + dx + 0.1, y + dy - 0.05, x + dx + 0.22, y + dy - wing)
      pen.stroke()
    }
  }
}

/**
 * Board fitted to the frame of a sea, in the pixels of its canvas
 * @param {WorldBoard} board - Board
 * @param {OceanFrame} frame - Frame of the sea
 * @return {{ scale: number; x: number; y: number }} - Fit
 */

const fitOf = (board: WorldBoard, { cell, left, top, ratio }: OceanFrame) => ({
  scale: cell * ratio,
  x: (left - board.left * cell) * ratio,
  y: (top - board.top * cell) * ratio,
})

/**
 * A map ready to stand around the sea of a game
 * @param {string} id - Map key
 * @param {DecorPainters} painters - Painters of its pieces
 * @return {StageWorld} - World
 */

export const stageWorld = (id: string, painters: DecorPainters): StageWorld => {
  const map = NAVAL_MAPS.has(id) ? NAVAL_MAPS.get(id) : NAVAL_MAPS.list[0]
  const board = boardOf(map.look, map.theatre.size)
  const lights: DecorLight[] = []
  let actors: DecorActor[] = []

  const paintStill = (frame: OceanFrame): void => {
    const { ctx } = frame
    lights.length = 0
    const moving: DecorActor[] = []
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const step = Math.max(1, Math.ceil(ctx.canvas.width / BED_PX))
    paintWorld(ctx, {
      id,
      fit: fitOf(board, frame),
      painters,
      isGame: true,
      step,
      light: (light) => lights.push(light),
      // A still sea keeps them in the picture
      live: frame.life ? (actor) => moving.push(actor) : undefined,
    })
    actors = orderActors(moving)
    ctx.restore()
  }

  const paintLife = (frame: OceanFrame): void => {
    const { ctx, cell, left, top, life, now } = frame
    const seconds = now / SECOND_MS
    ctx.save()
    ctx.transform(cell, 0, 0, cell, left - board.left * cell, top - board.top * cell)
    ctx.beginPath()
    ctx.rect(-board.width, -board.height, board.width * 3, board.height * 3)
    ctx.rect(board.left, board.top, board.size, board.size)
    ctx.clip('evenodd')
    paintActors(ctx, { actors, seconds, life })
    paintBirds(ctx, { board, map, seconds, count: Math.round((map.look.life.birds ?? 0) * life) })
    ctx.globalCompositeOperation = 'lighter'
    lights.forEach((light, index) => {
      ctx.globalAlpha = Math.max(0, strengthOf(light, seconds, index))
      ctx.drawImage(
        spriteOf(light.colour),
        light.x - light.radius,
        light.y - light.radius,
        light.radius * 2,
        light.radius * 2
      )
      if (light.beat === 'pulse') {
        paintEmbers(ctx, light, {
          seconds,
          count: Math.round(EMBERS * life),
          colour: map.look.land.lavaCore ?? light.colour,
        })
      }
    })
    ctx.restore()
  }

  return { key: `world:${id}`, paintStill, paintLife }
}
