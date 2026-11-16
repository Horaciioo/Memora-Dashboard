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

// Soot disc with a ragged rim, painted once per kind
const scarSprite = (kind: 'blast' | 'wreck'): HTMLCanvasElement => {
  const cached = sprites.get(kind)
  if (cached) return cached
  const size = war.scar.sprite
  const layer = document.createElement('canvas')
  layer.width = size
  layer.height = size
  const context = layer.getContext('2d')
  if (!context) return layer

  const half = size / 2
  const soot = (x: number, y: number, radius: number, alpha: number) => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(10,8,8,${alpha})`)
    gradient.addColorStop(0.5, `rgba(26,20,18,${alpha * 0.8})`)
    gradient.addColorStop(0.8, `rgba(46,36,30,${alpha * 0.4})`)
    gradient.addColorStop(1, 'rgba(60,48,40,0)')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  soot(half, half, half * (kind === 'blast' ? 0.82 : 0.9), 0.95)
  const blobs = kind === 'blast' ? 9 : 4
  for (let index = 0; index < blobs; index++) {
    const angle = hashOf(index, 11) * Math.PI * 2
    const reach = half * (0.35 + hashOf(index, 23) * 0.4)
    soot(
      half + Math.cos(angle) * reach,
      half + Math.sin(angle) * reach,
      half * (0.2 + hashOf(index, 37) * 0.25),
      0.5
    )
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
    context.drawImage(
      scarSprite(isBlast ? 'blast' : 'wreck'),
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    )
    context.globalAlpha = 1

    // Young scars still burn
    const age = tick - scar.at
    if (age < 0 || age > war.scar.burnTicks) continue
    const heat = (1 - age / war.scar.burnTicks) * pulse
    const glow = context.createRadialGradient(x, y, 0, x, y, radius * 0.7)
    glow.addColorStop(0, rgbText(fire.mid, 0.55 * heat))
    glow.addColorStop(0.6, rgbText(fire.edge, 0.22 * heat))
    glow.addColorStop(1, rgbText(fire.edge, 0))
    context.fillStyle = glow
    context.beginPath()
    context.arc(x, y, radius * 0.7, 0, Math.PI * 2)
    context.fill()
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
    const ball = context.createRadialGradient(x, y, 0, x, y, size)
    ball.addColorStop(0, rgbText(fire.core, fade))
    ball.addColorStop(0.35, rgbText(fire.mid, 0.95 * fade))
    ball.addColorStop(0.75, rgbText(fire.edge, 0.7 * fade))
    ball.addColorStop(1, rgbText(fire.edge, 0))
    context.fillStyle = ball
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
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
    context.beginPath()
    context.arc(px, py, size, 0, Math.PI * 2)
    context.fill()
  }

  // Mushroom cap on the heavy blast
  if (burst.kind === 'heavy' && life > 0.12) {
    const cap = Math.min(1, (life - 0.12) / 0.5)
    context.fillStyle = rgbText(fire.smoke, 0.5 * (1 - life))
    context.beginPath()
    context.ellipse(
      x,
      y - radius * (0.7 + cap * 0.6),
      radius * (0.35 + cap * 0.5),
      radius * 0.28 * cap + 2,
      0,
      0,
      Math.PI * 2
    )
    context.fill()
  }

  // Sparks and debris with a little gravity
  if (life < 0.45) {
    const t = life / 0.45
    context.lineWidth = 1.6
    for (let index = 0; index < spec.sparks; index++) {
      const angle = hashOf(burst.seed, index + 50) * Math.PI * 2
      const speed = radius * (0.6 + hashOf(burst.seed, index + 80) * 1.1)
      const px = x + Math.cos(angle) * speed * t
      const py = y + Math.sin(angle) * speed * t + radius * 0.5 * t * t
      context.strokeStyle = rgbText(fire.mid, 1 - t)
      context.beginPath()
      context.moveTo(px, py)
      context.lineTo(px - Math.cos(angle) * 5, py - Math.sin(angle) * 5)
      context.stroke()
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
    const glow = context.createRadialGradient(x, y, 0, x, y, size)
    glow.addColorStop(0, rgbText(fire.core, 0.9 * (1 - life)))
    glow.addColorStop(0.5, rgbText(fire.mid, 0.5 * (1 - life)))
    glow.addColorStop(1, rgbText(fire.edge, 0))
    context.fillStyle = glow
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fill()
  }
}
