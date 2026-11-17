import { pointOf } from '@/composites/play/concordat/board/draw/project'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { strikePoint, strikeProgress } from '@/composites/play/concordat/board/draw/warState'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { ConcordatStrikeKinds, ConcordatZoneKinds } from '@/utils/constants/concordat'

const { frame, strike, war } = CONCORDAT_ART
const { missile } = war
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

/**
 * Missiles in flight: the arc ahead, a smoke trail, the body with its flame, target ring and countdown
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawStrikes = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, font, now, tick } = scene
  const width = client.map.width

  for (const row of client.systems.strikes) {
    if ((row.killAt && tick >= row.killAt) || tick >= row.impactAt) continue
    const isHeavy =
      row.kind === ConcordatStrikeKinds.Heavy || row.kind === ConcordatStrikeKinds.Mirv
    const isGun =
      row.kind === ConcordatStrikeKinds.Shell ||
      row.kind === ConcordatStrikeKinds.Rocket ||
      row.kind === ConcordatStrikeKinds.Warhead
    const to = screenOf(scene, row.tile)
    const progress = strikeProgress(row, tick)
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

    if (row.from >= 0 && row.from !== row.tile) {
      // The arc still to fly, dotted
      context.setLineDash([3, 6])
      context.strokeStyle = rgbText(frame.rgb, 0.7)
      context.lineWidth = 2
      context.beginPath()
      for (let step = 0; step <= 24; step++) {
        const share = progress + ((1 - progress) * step) / 24
        const [x, y] = pointOf(scene, ...strikePoint(row, share, width))
        if (step) context.lineTo(x, y)
        else context.moveTo(x, y)
      }
      context.stroke()
      context.setLineDash([])

      // Smoke trail left behind, wider and greyer with age
      for (let step = missile.puffs; step >= 1; step--) {
        const back = Math.max(0, progress - step * missile.puffStep * (isGun ? 2 : 1))
        const [x, y] = pointOf(scene, ...strikePoint(row, back, width))
        const age = step / missile.puffs
        context.fillStyle = rgbText(isHeavy ? strike.dark : [210, 206, 200], 0.62 * (1 - age))
        context.beginPath()
        context.arc(x, y, (isHeavy ? 3.2 : isGun ? 1.8 : 2.4) * (1 + age * 1.6), 0, Math.PI * 2)
        context.fill()
      }

      // Body turned along the path, flame at the tail
      const [hx, hy] = pointOf(scene, ...strikePoint(row, progress, width))
      const [nx, ny] = pointOf(scene, ...strikePoint(row, Math.min(1, progress + 0.01), width))
      const angle = Math.atan2(ny - hy, nx - hx)
      const length = isHeavy ? missile.heavyLength : isGun ? missile.length * 0.6 : missile.length
      context.save()
      context.translate(hx, hy)
      context.rotate(angle)
      const flame = context.createLinearGradient(-length - missile.flame, 0, -length * 0.4, 0)
      flame.addColorStop(0, rgbText(war.fire.edge, 0))
      flame.addColorStop(0.5, rgbText(war.fire.mid, 0.9))
      flame.addColorStop(1, rgbText(war.fire.core, 1))
      context.fillStyle = flame
      context.beginPath()
      context.moveTo(-length * 0.4, -length * 0.16)
      context.lineTo(-length - missile.flame * (0.8 + 0.4 * Math.sin(now * 0.05)), 0)
      context.lineTo(-length * 0.4, length * 0.16)
      context.closePath()
      context.fill()
      context.fillStyle = rgbText(frame.rgb)
      context.strokeStyle = rgbText(isHeavy ? strike.dark : strike.red)
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(length * 0.55, 0)
      context.lineTo(length * 0.1, -length * 0.2)
      context.lineTo(-length * 0.5, -length * 0.2)
      context.lineTo(-length * 0.5, length * 0.2)
      context.lineTo(length * 0.1, length * 0.2)
      context.closePath()
      context.fill()
      context.stroke()
      context.restore()
    }

    // Public countdown above the target
    const seconds = Math.max(0, Math.ceil((row.impactAt - tick) / CONCORDAT_TICKS_PER_SECOND))
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
 * @param {number} radius - Blast radius in tiles
 * @return {void}
 */

export const drawAim = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene,
  radius: number
): void => {
  if (scene.hoverTile < 0) return
  const [x, y] = screenOf(scene, scene.hoverTile)
  context.fillStyle = rgbText(strike.red, 0.16)
  context.strokeStyle = rgbText(strike.red, 0.9)
  context.setLineDash([6, 5])
  context.lineWidth = strike.ring
  context.beginPath()
  context.arc(x, y, radius * scene.camera.scale, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.setLineDash([])
}
