import { drawSprite, spriteWidth } from '@/composites/play/concordat/board/draw/pixelSprite'
import { centreOf, isOutside, pointOf } from '@/composites/play/concordat/board/draw/project'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { strikePoint, strikeProgress } from '@/composites/play/concordat/board/draw/warState'
import { airPoint } from '@/core/lib/play/concordat/air/path'
import { rgbText } from '@/core/lib/play/concordat'
import type { ConcordatAircraftRow } from '@/core/lib/play/concordat/wire/systems'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { ConcordatAirKinds } from '@/utils/constants/concordat'

const { war, frame } = CONCORDAT_ART
const { plane, missile } = war
const { air } = CONCORDAT

// Two thin turning blades over a helicopter, hard lines
const drawRotor = (context: CanvasRenderingContext2D, size: number, now: number): void => {
  context.save()
  context.rotate(now * plane.rotor)
  context.strokeStyle = 'rgba(30,34,40,0.9)'
  context.lineWidth = Math.max(2, Math.round(size * 0.12))
  context.beginPath()
  context.moveTo(-size * 1.1, 0)
  context.lineTo(size * 1.1, 0)
  context.moveTo(0, -size * 1.1)
  context.lineTo(0, size * 1.1)
  context.stroke()
  context.restore()
}

// Straight shot from a tile to a point of the sky: smoke behind, a bright head in front
const drawShot = (
  context: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number],
  share: number,
  rgb: readonly number[]
): void => {
  const head: [number, number] = [
    from[0] + (to[0] - from[0]) * share,
    from[1] + (to[1] - from[1]) * share,
  ]
  // Hard streak, the last third of the way, then a square head
  const tail: [number, number] = [
    head[0] - (head[0] - from[0]) * 0.35,
    head[1] - (head[1] - from[1]) * 0.35,
  ]
  context.strokeStyle = rgbText(rgb, 0.9)
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(tail[0], tail[1])
  context.lineTo(head[0], head[1])
  context.stroke()
  context.fillStyle = rgbText(frame.rgb)
  context.fillRect(Math.round(head[0] - 2), Math.round(head[1] - 2), 4, 4)
}

// Smoke behind a damaged aircraft, and fire when one hit is left
const drawDamage = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene,
  row: ConcordatAircraftRow,
  size: number
): void => {
  const maxHp = air[row.kind].hp
  if (row.hp >= maxHp) return
  const width = scene.client.map.width

  for (let step = 1; step <= 7; step++) {
    const back = airPoint(row, scene.tick - step * 2.2, width)
    const [x, y] = pointOf(scene, back.x, back.y)
    const wobble = Math.sin(scene.now * 0.01 + step) * size * 0.12
    context.fillStyle = `rgba(28,24,24,${0.5 - step * 0.06})`
    const puff = Math.round(size * (0.3 + step * 0.1))
    context.fillRect(
      Math.round(x + wobble - puff / 2),
      Math.round(y - step * size * 0.08),
      puff,
      puff
    )
  }
  if (row.hp <= 1) {
    const [x, y] = pointOf(
      scene,
      airPoint(row, scene.tick, width).x,
      airPoint(row, scene.tick, width).y
    )
    const flicker = 0.6 + 0.4 * Math.sin(scene.now * 0.04)
    context.fillStyle = rgbText(war.fire.mid, 0.8 * flicker)
    const flame = Math.max(3, Math.round(size * 0.55 * flicker))
    context.fillRect(Math.round(x - flame / 2), Math.round(y - flame / 2), flame, flame)
  }
}

// One aircraft with its shadow, trail and the shots it takes
const drawOne = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene,
  row: ConcordatAircraftRow
): void => {
  const { client, camera, tick, now, colors } = scene
  const width = client.map.width
  if (tick < row.launchedAt || tick > row.until) return

  const point = airPoint(row, tick, width)
  const [x, y] = pointOf(scene, point.x, point.y)
  const isHeli = row.kind === ConcordatAirKinds.Heli
  const size =
    Math.min(plane.max, Math.max(plane.min, camera.scale * plane.size)) * (isHeli ? 0.62 : 0.55)
  if (isOutside(scene, x, y, size * 4)) return

  const rgb = colors[row.owner] ?? [255, 255, 255]

  // Guard disc of a helicopter on station
  if (isHeli && point.isOrbit) {
    const [cx, cy] = centreOf(scene, row.tile)
    context.strokeStyle = rgbText(rgb, 0.7)
    context.lineWidth = 1.6
    context.setLineDash([6, 6])
    context.lineDashOffset = -now * 0.012
    context.beginPath()
    context.arc(cx, cy, air.heli.guard * camera.scale, 0, Math.PI * 2)
    context.stroke()
    context.setLineDash([])
  }

  // Contrail of a fighter
  if (!isHeli) {
    for (let step = 1; step <= plane.trail; step++) {
      const back = airPoint(row, tick - step * plane.trailStep, width)
      const [bx, by] = pointOf(scene, back.x, back.y)
      context.fillStyle = `rgba(255,255,255,${0.42 * (1 - step / (plane.trail + 1))})`
      const dot = Math.max(2, Math.round(size * 0.3 * (1 - step / (plane.trail + 2))))
      context.fillRect(Math.round(bx - dot / 2), Math.round(by - dot / 2), dot, dot)
    }
  }

  // Hard shadow on the ground, then the pixel machine
  const sprite = isHeli ? 'heli' : 'fighter'
  const pixel = Math.max(2, Math.round((size * 2) / spriteWidth(sprite)))
  context.save()
  context.globalAlpha = plane.shadow * 1.6
  drawSprite(context, sprite, [10, 12, 16], x + size * 0.7, y + size * 1.1, pixel, point.angle)
  context.restore()
  drawSprite(context, sprite, rgb, x, y, pixel, point.angle)
  if (isHeli) {
    context.save()
    context.translate(x, y)
    drawRotor(context, size, now)
    context.restore()
  }

  drawDamage(context, scene, row, size)

  // Shot taken: a streak from where it came, a flash at the muzzle
  const sinceShot = tick - row.shotAt
  if (
    row.shotAt &&
    row.shotFrom >= 0 &&
    sinceShot >= 0 &&
    sinceShot <= CONCORDAT_ART.war.tracerTicks
  ) {
    const from = centreOf(scene, row.shotFrom)
    drawShot(
      context,
      from,
      [x, y],
      Math.min(1, sinceShot / CONCORDAT_ART.war.tracerTicks),
      war.tracer
    )
    if (sinceShot < 2.5) {
      context.fillStyle = rgbText(war.fire.core, 0.9)
      const flash = Math.round(Math.max(6, camera.scale * 1.6))
      context.fillRect(
        Math.round(from[0] - flash / 2),
        Math.round(from[1] - flash / 2),
        flash,
        flash
      )
    }
  }
}

// Interceptors rising from the batteries toward the strikes they fire on
const drawInterceptors = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { client, tick } = scene
  const width = client.map.width

  for (const row of client.systems.strikes) {
    if (row.by < 0 || !row.shotAt) continue
    const age = tick - row.shotAt
    if (age < 0 || age > missile.interceptTicks + 6) continue

    const mark = row.killAt ? row.killAt : row.shotAt + missile.interceptTicks
    const [tx, ty] = strikePoint(row, strikeProgress(row, mark), width)
    // A miss slides past the strike
    const miss = row.killAt ? 0 : 2.4
    const target = pointOf(scene, tx + miss, ty - miss * 0.6)
    const from = centreOf(scene, row.by)
    const share = Math.min(1, age / missile.interceptTicks)
    drawShot(context, from, target, share, war.interceptor)
    if (age < 3) {
      context.fillStyle = rgbText(war.fire.core, 0.9)
      const flash = Math.round(Math.max(8, scene.camera.scale * 2.2))
      context.fillRect(
        Math.round(from[0] - flash / 2),
        Math.round(from[1] - flash / 2),
        flash,
        flash
      )
    }
  }
}

/**
 * Aircraft in the sky and the interceptors fired at the strikes
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawAir = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  drawInterceptors(context, scene)
  for (const row of scene.client.systems.aircraft) drawOne(context, scene, row)
}
