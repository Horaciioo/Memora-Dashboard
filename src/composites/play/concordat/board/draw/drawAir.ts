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

// Delta wing seen from above, nose to the right
const drawFighter = (context: CanvasRenderingContext2D, size: number): void => {
  context.beginPath()
  context.moveTo(size, 0)
  context.lineTo(-size * 0.35, size * 0.9)
  context.lineTo(-size * 0.1, size * 0.14)
  context.lineTo(-size * 0.85, size * 0.34)
  context.lineTo(-size * 0.7, 0)
  context.lineTo(-size * 0.85, -size * 0.34)
  context.lineTo(-size * 0.1, -size * 0.14)
  context.lineTo(-size * 0.35, -size * 0.9)
  context.closePath()
}

// Helicopter body, tail boom and the turning rotor
const drawHeli = (context: CanvasRenderingContext2D, size: number, now: number): void => {
  context.beginPath()
  context.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.fillRect(-size * 1.15, -size * 0.07, size * 0.7, size * 0.14)
  context.fillRect(-size * 1.2, -size * 0.3, size * 0.1, size * 0.6)

  const spin = now * plane.rotor
  context.save()
  context.rotate(spin)
  context.strokeStyle = 'rgba(30,34,40,0.85)'
  context.lineWidth = Math.max(1.5, size * 0.1)
  context.beginPath()
  context.moveTo(-size * 1.15, 0)
  context.lineTo(size * 1.15, 0)
  context.moveTo(0, -size * 1.15)
  context.lineTo(0, size * 1.15)
  context.stroke()
  context.restore()
  context.fillStyle = 'rgba(255,255,255,0.14)'
  context.beginPath()
  context.arc(0, 0, size * 1.15, 0, Math.PI * 2)
  context.fill()
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
  const gradient = context.createLinearGradient(from[0], from[1], head[0], head[1])
  gradient.addColorStop(0, rgbText(rgb, 0))
  gradient.addColorStop(1, rgbText(rgb, 0.85))
  context.strokeStyle = gradient
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(from[0], from[1])
  context.lineTo(head[0], head[1])
  context.stroke()
  context.fillStyle = rgbText(frame.rgb)
  context.beginPath()
  context.arc(head[0], head[1], 2.4, 0, Math.PI * 2)
  context.fill()
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
    context.beginPath()
    context.arc(x + wobble, y - step * size * 0.08, size * (0.18 + step * 0.05), 0, Math.PI * 2)
    context.fill()
  }
  if (row.hp <= 1) {
    const [x, y] = pointOf(
      scene,
      airPoint(row, scene.tick, width).x,
      airPoint(row, scene.tick, width).y
    )
    const flicker = 0.6 + 0.4 * Math.sin(scene.now * 0.04)
    context.fillStyle = rgbText(war.fire.mid, 0.8 * flicker)
    context.beginPath()
    context.arc(x, y, size * 0.32 * flicker, 0, Math.PI * 2)
    context.fill()
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
    context.fillStyle = rgbText(rgb, 0.07)
    context.strokeStyle = rgbText(rgb, 0.55)
    context.lineWidth = 1.6
    context.setLineDash([6, 6])
    context.lineDashOffset = -now * 0.012
    context.beginPath()
    context.arc(cx, cy, air.heli.guard * camera.scale, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.setLineDash([])
  }

  // Contrail of a fighter
  if (!isHeli) {
    for (let step = 1; step <= plane.trail; step++) {
      const back = airPoint(row, tick - step * plane.trailStep, width)
      const [bx, by] = pointOf(scene, back.x, back.y)
      context.fillStyle = `rgba(255,255,255,${0.42 * (1 - step / (plane.trail + 1))})`
      context.beginPath()
      context.arc(bx, by, size * 0.22 * (1 - step / (plane.trail + 2)) + 1, 0, Math.PI * 2)
      context.fill()
    }
  }

  // Shadow on the ground, then the machine
  context.save()
  context.translate(x + size * 0.7, y + size * 1.1)
  context.rotate(point.angle)
  context.fillStyle = `rgba(10,12,16,${plane.shadow})`
  if (isHeli) {
    context.beginPath()
    context.ellipse(0, 0, size * 0.7, size * 0.45, 0, 0, Math.PI * 2)
    context.fill()
  } else {
    drawFighter(context, size)
    context.fill()
  }
  context.restore()

  context.save()
  context.translate(x, y)
  context.rotate(point.angle)
  context.fillStyle = rgbText(rgb)
  context.strokeStyle = rgbText(frame.rgb)
  context.lineWidth = Math.max(1.4, size * 0.1)
  if (isHeli) drawHeli(context, size, now)
  else {
    drawFighter(context, size)
    context.fill()
    context.stroke()
  }
  context.restore()

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
      context.beginPath()
      context.arc(from[0], from[1], Math.max(4, camera.scale), 0, Math.PI * 2)
      context.fill()
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
      context.beginPath()
      context.arc(from[0], from[1], Math.max(5, scene.camera.scale * 1.4), 0, Math.PI * 2)
      context.fill()
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
