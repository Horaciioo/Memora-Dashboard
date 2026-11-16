import { isOutside, pointOf } from '@/composites/play/concordat/board/draw/project'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { hashOf } from '@/composites/play/concordat/board/draw/warState'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

const { war } = CONCORDAT_ART
const { air, mood } = war

let smokeSprite: HTMLCanvasElement | null = null

// Soft grey blob, painted once
const smokeOf = (): HTMLCanvasElement => {
  if (smokeSprite) return smokeSprite
  const layer = document.createElement('canvas')
  layer.width = 128
  layer.height = 128
  const context = layer.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(40,36,36,0.9)')
    gradient.addColorStop(0.5, 'rgba(52,46,46,0.45)')
    gradient.addColorStop(1, 'rgba(60,54,54,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  }
  smokeSprite = layer

  return layer
}

/**
 * The ground loses its colours as the war goes on: dimmed, greyed, nothing bright left
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawGroundMood = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const tension = scene.war.tension
  if (tension < mood.min) return

  context.save()
  context.globalCompositeOperation = 'multiply'
  context.fillStyle = rgbText(air.dim, air.dimAlpha * tension)
  context.fillRect(0, 0, scene.width, scene.height)
  context.globalCompositeOperation = 'saturation'
  context.fillStyle = rgbText(air.grey, air.greyAlpha * tension)
  context.fillRect(0, 0, scene.width, scene.height)
  context.restore()
}

/**
 * Smoke drifting across, ash falling, a dark edge and far flashes, all heavier with tension
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawSkyMood = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { width, height, now } = scene
  const tension = scene.war.tension
  if (tension < mood.min) return

  // Dark edge
  const edge = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.hypot(width, height) * 0.62
  )
  edge.addColorStop(0, rgbText(air.vignette, 0))
  edge.addColorStop(1, rgbText(air.vignette, air.vignetteAlpha * tension))
  context.fillStyle = edge
  context.fillRect(0, 0, width, height)

  // Smoke banks in slow parallel drift
  const banks = Math.floor(air.smoke.max * tension)
  const sprite = smokeOf()
  for (let index = 0; index < banks; index++) {
    const size = Math.max(width, height) * air.smoke.size * (0.6 + hashOf(index, 5) * 0.8)
    const speed = air.smoke.speed * (0.5 + hashOf(index, 9))
    const span = width + size * 2
    const x = ((hashOf(index, 1) * span + now * speed) % span) - size
    const y = hashOf(index, 2) * height - size / 2 + Math.sin(now * 0.0002 + index) * 24
    context.globalAlpha = air.smoke.alpha * tension * (0.5 + hashOf(index, 3) * 0.5)
    context.drawImage(sprite, x - size / 2, y - size / 2, size, size)
  }
  context.globalAlpha = 1

  // Ash and embers falling
  const embers = Math.floor(air.embers.max * tension)
  for (let index = 0; index < embers; index++) {
    const fall = hashOf(index, 21) * 0.6 + 0.4
    const x =
      (hashOf(index, 11) * width + Math.sin(now * 0.0008 + index) * 30 + now * 0.012 * fall) % width
    const y = (hashOf(index, 12) * height + now * air.embers.speed * fall) % height
    const isEmber = hashOf(index, 13) < tension * 0.7
    context.fillStyle = isEmber
      ? rgbText(war.fire.mid, air.embers.alpha * (0.4 + 0.6 * Math.sin(now * 0.01 + index) ** 2))
      : rgbText(war.fire.smoke, 0.5)
    context.fillRect(x, y, 1.8, 1.8)
  }

  // Far flashes on old scars, a pulse of light then gone
  if (tension >= air.flash.minTension && scene.client.systems.scars.length) {
    const every = air.flash.everyMs / (0.3 + tension)
    const bucket = Math.floor(now / every)
    const age = now - bucket * every
    if (age < air.flash.ms) {
      const scars = scene.client.systems.scars
      const scar = scars[Math.floor(hashOf(bucket, 77) * scars.length)]
      const column = scar.tile % scene.client.map.width
      const row = (scar.tile - column) / scene.client.map.width
      const [x, y] = pointOf(
        scene,
        column + (hashOf(bucket, 78) - 0.5) * scar.radius * 3,
        row + (hashOf(bucket, 79) - 0.5) * scar.radius * 3
      )
      if (!isOutside(scene, x, y, 80)) {
        const life = age / air.flash.ms
        const size = Math.min(width, height) * air.flash.size * (0.6 + life)
        const glow = context.createRadialGradient(x, y, 0, x, y, size)
        glow.addColorStop(0, rgbText(war.fire.core, 0.7 * (1 - life)))
        glow.addColorStop(0.4, rgbText(war.fire.mid, 0.35 * (1 - life)))
        glow.addColorStop(1, rgbText(war.fire.edge, 0))
        context.fillStyle = glow
        context.beginPath()
        context.arc(x, y, size, 0, Math.PI * 2)
        context.fill()
      }
    }
  }
}
