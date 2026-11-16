import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { ConcordatStrikeKinds, ConcordatZoneKinds } from '@/utils/constants/concordat'

const { frame, strike } = CONCORDAT_ART
const { weapons } = CONCORDAT

const screenOf = (scene: ConcordatScene, tile: number): [number, number] => {
  const { camera, client } = scene
  const column = tile % client.map.width

  return [
    camera.x + (column + 0.5) * camera.scale,
    camera.y + ((tile - column) / client.map.width + 0.5) * camera.scale,
  ]
}

/**
 * Marked ground: fallout and disasters as dashed tinted discs
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawZones = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, now } = scene

  for (const zone of client.systems.zones) {
    if (zone.until <= client.tick) continue
    const [x, y] = screenOf(scene, zone.tile)
    const isFallout = zone.kind === ConcordatZoneKinds.Fallout
    context.fillStyle = rgbText(isFallout ? strike.dark : strike.red, strike.fallout)
    context.strokeStyle = rgbText(isFallout ? strike.dark : strike.red, 0.7)
    context.lineWidth = 2
    context.setLineDash([7, 6])
    context.lineDashOffset = -now * 0.01
    context.beginPath()
    context.arc(x, y, zone.radius * camera.scale, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.setLineDash([])
  }
}

// Point on the arc, bent upward from the silo to the target
const arcPoint = (from: [number, number], to: [number, number], t: number): [number, number] => {
  const lift = Math.hypot(to[0] - from[0], to[1] - from[1]) * strike.arc
  const x = from[0] + (to[0] - from[0]) * t
  const y = from[1] + (to[1] - from[1]) * t - Math.sin(Math.PI * t) * lift

  return [x, y]
}

/**
 * Missiles in flight: trajectory, head with trail, target ring and countdown
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawStrikes = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, font, now } = scene

  for (const row of client.systems.strikes) {
    const isHeavy = row.kind === ConcordatStrikeKinds.Heavy
    const to = screenOf(scene, row.tile)
    const from = row.from >= 0 ? screenOf(scene, row.from) : to
    const progress = Math.min(
      1,
      Math.max(0, (client.tick - row.launchedAt) / (row.impactAt - row.launchedAt))
    )
    const blast = weapons.radius[row.kind] * camera.scale
    const pulse = 1 + Math.sin(now * 0.008) * 0.06

    // Blast disc and target ring
    context.fillStyle = rgbText(strike.red, 0.14)
    context.strokeStyle = rgbText(strike.red, 0.9)
    context.lineWidth = strike.ring
    context.beginPath()
    context.arc(to[0], to[1], blast * pulse, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.beginPath()
    context.moveTo(to[0] - blast * 0.35, to[1])
    context.lineTo(to[0] + blast * 0.35, to[1])
    context.moveTo(to[0], to[1] - blast * 0.35)
    context.lineTo(to[0], to[1] + blast * 0.35)
    context.stroke()

    // Dotted trajectory
    if (from !== to) {
      context.setLineDash([3, 6])
      context.strokeStyle = rgbText(frame.rgb, 0.85)
      context.lineWidth = 2
      context.beginPath()
      for (let step = 0; step <= 24; step++) {
        const [x, y] = arcPoint(from, to, step / 24)
        if (step) context.lineTo(x, y)
        else context.moveTo(x, y)
      }
      context.stroke()
      context.setLineDash([])

      // Head and trail
      const head = arcPoint(from, to, progress)
      for (let step = 1; step <= 6; step++) {
        const back = arcPoint(from, to, Math.max(0, progress - step * strike.trail * 0.2))
        context.fillStyle = rgbText(isHeavy ? strike.dark : strike.red, 0.5 - step * 0.07)
        context.beginPath()
        context.arc(back[0], back[1], (isHeavy ? 6 : 4) - step * 0.5, 0, Math.PI * 2)
        context.fill()
      }
      context.fillStyle = rgbText(frame.rgb)
      context.strokeStyle = rgbText(isHeavy ? strike.dark : strike.red)
      context.lineWidth = 2.5
      context.beginPath()
      context.arc(head[0], head[1], isHeavy ? 7 : 5, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    }

    // Public countdown above the target
    const seconds = Math.max(
      0,
      Math.ceil((row.impactAt - client.tick) / CONCORDAT_TICKS_PER_SECOND)
    )
    context.font = `900 14px ${font}`
    context.textAlign = 'center'
    context.lineWidth = 4
    context.strokeStyle = rgbText(frame.rgb)
    context.fillStyle = rgbText(strike.red)
    context.strokeText(`${seconds} s`, to[0], to[1] - blast - 8)
    context.fillText(`${seconds} s`, to[0], to[1] - blast - 8)
  }
}

/**
 * Blast disc under the pointer while a missile is armed
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @param {boolean} isHeavy - Heavy missile
 * @return {void}
 */

export const drawAim = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene,
  isHeavy: boolean
): void => {
  if (scene.hoverTile < 0) return
  const [x, y] = screenOf(scene, scene.hoverTile)
  context.fillStyle = rgbText(strike.red, 0.16)
  context.strokeStyle = rgbText(strike.red, 0.9)
  context.setLineDash([6, 5])
  context.lineWidth = strike.ring
  context.beginPath()
  context.arc(
    x,
    y,
    weapons.radius[isHeavy ? ConcordatStrikeKinds.Heavy : ConcordatStrikeKinds.Missile] *
      scene.camera.scale,
    0,
    Math.PI * 2
  )
  context.fill()
  context.stroke()
  context.setLineDash([])
}
