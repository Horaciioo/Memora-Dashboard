import { centreOf, isOutside, pointOf } from '@/composites/play/concordat/board/draw/project'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { hashOf } from '@/composites/play/concordat/board/draw/warState'
import type { ConcordatBurst } from '@/composites/play/concordat/board/draw/warState'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { ConcordatScarKinds } from '@/utils/constants/concordat'

const { war } = CONCORDAT_ART
const { fire } = war

const sprites = new Map<string, HTMLCanvasElement>()

// Crater in hard pixels, a dark core and a ragged scorched rim, painted once per kind
const SCAR_PIXELS = 28

const scarSprite = (kind: 'blast' | 'wreck'): HTMLCanvasElement => {
  const cached = sprites.get(kind)
  if (cached) return cached
  const layer = document.createElement('canvas')
  layer.width = SCAR_PIXELS
  layer.height = SCAR_PIXELS
  const context = layer.getContext('2d')
  if (!context) return layer

  const half = SCAR_PIXELS / 2
  for (let y = 0; y < SCAR_PIXELS; y++) {
    for (let x = 0; x < SCAR_PIXELS; x++) {
      const reach = Math.hypot(x + 0.5 - half, y + 0.5 - half) / half
      const ragged = reach + (hashOf(x * 31 + y, 11) - 0.5) * 0.34
      if (ragged > (kind === 'blast' ? 0.95 : 0.8)) continue
      context.fillStyle =
        ragged < 0.45 ? 'rgb(22,18,18)' : ragged < 0.72 ? 'rgb(44,36,32)' : 'rgb(72,60,50)'
      context.fillRect(x, y, 1, 1)
    }
  }
  sprites.set(kind, layer)

  return layer
}

/**
 * Scorched ground: craters, wrecks and strafed lines, with embers while they are young
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawScars = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { client, camera, tick, now } = scene
  const pulse = 0.6 + 0.4 * Math.sin(now / war.scar.pulseMs)

  for (const scar of client.systems.scars) {
    const [x, y] = centreOf(scene, scar.tile)
    const radius = Math.max(4, scar.radius * camera.scale * war.scar.grow)
    if (isOutside(scene, x, y, radius)) continue

    const isBlast = scar.kind === ConcordatScarKinds.Blast
    context.globalAlpha = war.scar.alpha * (isBlast ? 1 : 0.75)
    context.imageSmoothingEnabled = false
    context.drawImage(
      scarSprite(isBlast ? 'blast' : 'wreck'),
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    )
    context.globalAlpha = 1
    context.imageSmoothingEnabled = true

    // Young scars still burn
    const age = tick - scar.at
    if (age < 0 || age > war.scar.burnTicks) continue
    const heat = (1 - age / war.scar.burnTicks) * pulse
    for (let index = 0; index < 6; index++) {
      if (hashOf(scar.tile, index + Math.floor(now / 260)) > heat) continue
      const angle = hashOf(scar.tile, index * 5) * Math.PI * 2
      const reach = radius * 0.55 * hashOf(scar.tile, index * 7 + 1)
      context.fillStyle = rgbText(index % 2 ? fire.mid : fire.edge)
      context.fillRect(
        Math.round(x + Math.cos(angle) * reach),
        Math.round(y + Math.sin(angle) * reach),
        3,
        3
      )
    }
  }
}

// One explosion: flash, fireball, shock ring, rising smoke, sparks and a cap for heavy ones
const drawBurst = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene,
  burst: ConcordatBurst
): void => {
  const spec = war.bursts[burst.kind]
  const age = scene.now - burst.at
  const life = age / spec.ms
  if (life < 0 || life > 1) return

  const [x, y] = pointOf(scene, burst.x, burst.y)
  const isAir = burst.kind === 'flak'
  const radius = isAir
    ? war.flakSize
    : Math.max(war.minBurst, burst.radius * scene.camera.scale * spec.reach)
  if (isOutside(scene, x, y, radius * 3)) return

  const grow = 1 - (1 - Math.min(1, life * 3.2)) ** 3

  // Whole-map flash of the biggest blasts
  if (spec.flash && life < 0.07) {
    context.fillStyle = rgbText(fire.core, spec.flash * (1 - life / 0.07))
    context.fillRect(0, 0, scene.width, scene.height)
  }

  // Shock ring
  if (!isAir && life < 0.55) {
    context.strokeStyle = rgbText(fire.core, 0.6 * (1 - life / 0.55))
    context.lineWidth = Math.max(1, 5 * (1 - life / 0.55))
    context.beginPath()
    context.arc(x, y, radius * (0.2 + 1.5 * Math.min(1, life / 0.55)), 0, Math.PI * 2)
    context.stroke()
  }

  // Fireball
  if (life < 0.5) {
    const fade = life < 0.18 ? 1 : 1 - (life - 0.18) / 0.32
    const size = radius * (0.35 + 0.65 * grow)
    const rings: [number, readonly number[]][] = [
      [1, fire.edge],
      [0.7, fire.mid],
      [0.4, fire.core],
    ]
    for (const [share, rgb] of rings) {
      context.fillStyle = rgbText(rgb, fade)
      context.beginPath()
      context.arc(x, y, size * share, 0, Math.PI * 2)
      context.fill()
    }
  }

  // Smoke puffs rise and spread
  const smokeLife = Math.max(0, (life - 0.08) / 0.92)
  for (let index = 0; index < spec.puffs; index++) {
    const angle = hashOf(burst.seed, index * 3) * Math.PI * 2
    const spread = hashOf(burst.seed, index * 3 + 1) * radius * 0.7
    const rise = radius * (0.4 + hashOf(burst.seed, index * 3 + 2) * 0.9) * smokeLife
    const px = x + Math.cos(angle) * spread * (0.4 + smokeLife)
    const py = y + Math.sin(angle) * spread * 0.45 - rise
    const size = radius * (0.22 + 0.4 * smokeLife) * (0.7 + hashOf(burst.seed, index) * 0.6)
    context.fillStyle = rgbText(fire.smoke, 0.55 * (1 - smokeLife) ** 1.4)
    context.fillRect(
      Math.round(px - size),
      Math.round(py - size),
      Math.round(size * 2),
      Math.round(size * 2)
    )
  }

  // Mushroom cap on the heavy blast
  if (burst.kind === 'heavy' && life > 0.12) {
    const cap = Math.min(1, (life - 0.12) / 0.5)
    context.fillStyle = rgbText(fire.smoke, 0.5 * (1 - life))
    const capWidth = radius * (0.7 + cap)
    const capHeight = radius * 0.3 * cap + 4
    context.fillRect(
      Math.round(x - capWidth / 2),
      Math.round(y - radius * (0.7 + cap * 0.6)),
      Math.round(capWidth),
      Math.round(capHeight)
    )
  }

  // Sparks and debris with a little gravity
  if (life < 0.45) {
    const t = life / 0.45
    for (let index = 0; index < spec.sparks; index++) {
      const angle = hashOf(burst.seed, index + 50) * Math.PI * 2
      const speed = radius * (0.6 + hashOf(burst.seed, index + 80) * 1.1)
      const px = x + Math.cos(angle) * speed * t
      const py = y + Math.sin(angle) * speed * t + radius * 0.5 * t * t
      context.fillStyle = rgbText(fire.mid, 1 - t)
      context.fillRect(Math.round(px), Math.round(py), 3, 3)
    }
  }
}

/**
 * Every live explosion and the flash of each launch
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawBlasts = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  for (const burst of scene.war.bursts) drawBurst(context, scene, burst)

  for (const flash of scene.war.flashes) {
    const life = (scene.now - flash.at) / war.air.flash.ms
    if (life < 0 || life > 1) continue
    const [x, y] = pointOf(scene, flash.x, flash.y)
    const size = Math.max(10, scene.camera.scale * 3) * (1 + life)
    for (const [share, rgb] of [
      [1, fire.edge],
      [0.65, fire.mid],
      [0.3, fire.core],
    ] as [number, readonly number[]][]) {
      context.fillStyle = rgbText(rgb, 0.9 * (1 - life))
      context.beginPath()
      context.arc(x, y, size * share, 0, Math.PI * 2)
      context.fill()
    }
  }
}
