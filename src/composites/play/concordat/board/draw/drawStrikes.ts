import { drawSprite } from '@/composites/play/concordat/board/draw/pixelSprite'
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
      row.kind === ConcordatStrikeKinds.Heavy ||
      row.kind === ConcordatStrikeKinds.Mirv ||
      row.kind === ConcordatStrikeKinds.BombHuge
    const isGun =
      row.kind === ConcordatStrikeKinds.Shell ||
      row.kind === ConcordatStrikeKinds.Rocket ||
      row.kind === ConcordatStrikeKinds.Warhead
    const to = screenOf(scene, row.tile)
    const progress = strikeProgress(row, tick)
    const blast = weapons.radius[row.kind] * camera.scale

    // Turning dashed blast edge around a solid core that pulses faster as impact nears
    const urgency = 1 - Math.min(1, (row.impactAt - tick) / (CONCORDAT_TICKS_PER_SECOND * 6))
    const beat = 1 + Math.sin(now * (0.008 + urgency * 0.012)) * (0.06 + urgency * 0.08)
    const core = blast * 0.3 * beat
    context.fillStyle = rgbText(strike.red, 0.14)
    context.beginPath()
    context.arc(to[0], to[1], blast, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = rgbText(strike.red, 0.9)
    context.lineWidth = strike.ring * 1.6
    context.setLineDash([blast * 0.5, blast * 0.3])
    context.lineDashOffset = -now * 0.03
    context.beginPath()
    context.arc(to[0], to[1], blast, 0, Math.PI * 2)
    context.stroke()
    context.setLineDash([])
    context.lineDashOffset = 0
    context.fillStyle = rgbText(strike.red, 0.22)
    context.lineWidth = strike.ring * 2
    context.beginPath()
    context.arc(to[0], to[1], core, 0, Math.PI * 2)
    context.fill()
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

      // Smoke trail left behind, hard square puffs that widen and grey with age
      for (let step = missile.puffs; step >= 1; step--) {
        const back = Math.max(0, progress - step * missile.puffStep * (isGun ? 2 : 1))
        const [x, y] = pointOf(scene, ...strikePoint(row, back, width))
        const age = step / missile.puffs
        const puff = Math.round((isHeavy ? 5 : isGun ? 3 : 4) * (1 + age * 1.2))
        context.fillStyle = rgbText(isHeavy ? strike.dark : [210, 206, 200], 0.7 * (1 - age))
        context.fillRect(Math.round(x - puff / 2), Math.round(y - puff / 2), puff, puff)
      }

      // Pixel body turned along the path
      const [hx, hy] = pointOf(scene, ...strikePoint(row, progress, width))
      const [nx, ny] = pointOf(scene, ...strikePoint(row, Math.min(1, progress + 0.01), width))
      const angle = Math.atan2(ny - hy, nx - hx)
      const sprite = isHeavy ? 'heavy' : 'missile'
      const pixel = Math.min(4, Math.max(2, Math.round(camera.scale * (isGun ? 0.28 : 0.4))))
      drawSprite(context, sprite, [196, 56, 52], hx, hy, pixel, angle)
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
