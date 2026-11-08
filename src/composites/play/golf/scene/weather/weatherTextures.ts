import { CanvasTexture, CubeTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import type { Color } from 'three'

import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { tornado, ice } = GOLF_SCENE

// Streak texture pixels
const STREAK = { width: 128, height: 256 }

// Soft puff pixels
const PUFF = 128

// Sky face pixels
const SKY = 64

/**
 * Canvas and its context, drawn by the caller
 * @param {number} width - Pixels
 * @param {number} height - Pixels
 * @return {[HTMLCanvasElement, CanvasRenderingContext2D | null]} - Canvas and context
 */

const canvasOf = (
  width: number,
  height: number
): [HTMLCanvasElement, CanvasRenderingContext2D | null] => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  return [canvas, canvas.getContext('2d')]
}

/**
 * Grey wisps running up a funnel, used as its alpha
 * @param {() => number} random - Seeded source
 * @return {CanvasTexture} - Texture
 */

export const streakTexture = (random: () => number): CanvasTexture => {
  const [canvas, context] = canvasOf(STREAK.width, STREAK.height)
  if (context) {
    context.fillStyle = '#000'
    context.fillRect(0, 0, STREAK.width, STREAK.height)
    for (let index = 0; index < STREAK.width / 2; index += 1) {
      // Thin leaning wisp, brighter in the middle
      const x = random() * STREAK.width
      const lean = (random() - 0.5) * 40
      const shade = 70 + random() * 185
      context.strokeStyle = `rgb(${shade} ${shade} ${shade})`
      context.lineWidth = 1 + random() * tornado.streaks * 0.4
      context.beginPath()
      context.moveTo(x, 0)
      context.quadraticCurveTo(x + lean, STREAK.height / 2, x - lean * 0.4, STREAK.height)
      context.stroke()
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.repeat.set(tornado.streaks / 3, 1)

  return texture
}

/**
 * Round soft blob, white in the middle and clear at the edge
 * @return {CanvasTexture} - Texture
 */

export const puffTexture = (): CanvasTexture => {
  const [canvas, context] = canvasOf(PUFF, PUFF)
  if (context) {
    const gradient = context.createRadialGradient(
      PUFF / 2,
      PUFF / 2,
      0,
      PUFF / 2,
      PUFF / 2,
      PUFF / 2
    )
    gradient.addColorStop(0, '#fff')
    gradient.addColorStop(0.55, '#888')
    gradient.addColorStop(1, '#000')
    context.fillStyle = gradient
    context.fillRect(0, 0, PUFF, PUFF)
  }

  return new CanvasTexture(canvas)
}

/**
 * Walk of a crack from a point, forking now and then
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {() => number} random - Seeded source
 * @param {{ x: number, y: number, angle: number, steps: number }} start - Origin and heading
 * @return {void}
 */

const crack = (
  context: CanvasRenderingContext2D,
  random: () => number,
  start: { x: number; y: number; angle: number; steps: number }
): void => {
  let { x, y, angle } = start
  context.beginPath()
  context.moveTo(x, y)
  for (let step = 0; step < start.steps; step += 1) {
    angle += (random() - 0.5) * 1.1
    const length = 14 + random() * 30
    x += Math.cos(angle) * length
    y += Math.sin(angle) * length
    context.lineTo(x, y)
    // Branch off a short crack
    if (random() < 0.22 && start.steps > 3) {
      const branch = { x, y, angle: angle + (random() < 0.5 ? 0.9 : -0.9), steps: 3 }
      context.stroke()
      crack(context, random, branch)
      context.beginPath()
      context.moveTo(x, y)
    }
  }
  context.stroke()
}

/**
 * Clear ice: pale blue body, frost patches, air bubbles, cracks with a deep shadow
 * @param {() => number} random - Seeded source
 * @param {{ body: Color, deep: Color, crack: Color }} tones - Colours
 * @return {CanvasTexture} - Texture
 */

export const iceTexture = (
  random: () => number,
  tones: { body: Color; deep: Color; crack: Color }
): CanvasTexture => {
  const { size, cracks, bubbles, frost } = ice.texture
  const [canvas, context] = canvasOf(size, size)
  if (context) {
    // Body shaded from deep to pale across the sheet
    const body = context.createLinearGradient(0, 0, size, size)
    body.addColorStop(0, `#${tones.body.getHexString()}`)
    body.addColorStop(0.5, `#${tones.deep.clone().lerp(tones.body, 0.6).getHexString()}`)
    body.addColorStop(1, `#${tones.body.getHexString()}`)
    context.fillStyle = body
    context.fillRect(0, 0, size, size)

    // Frost patches
    for (let index = 0; index < frost; index += 1) {
      const radius = size * (0.05 + random() * 0.14)
      const x = random() * size
      const y = random() * size
      const patch = context.createRadialGradient(x, y, 0, x, y, radius)
      patch.addColorStop(0, 'rgb(255 255 255 / 0.55)')
      patch.addColorStop(1, 'rgb(255 255 255 / 0)')
      context.fillStyle = patch
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    // Air bubbles caught inside
    context.lineWidth = 1.5
    for (let index = 0; index < bubbles; index += 1) {
      context.strokeStyle = `rgb(255 255 255 / ${0.25 + random() * 0.4})`
      context.beginPath()
      context.arc(random() * size, random() * size, 2 + random() * 7, 0, Math.PI * 2)
      context.stroke()
    }

    // Cracks: deep blue shadow under a bright line
    context.lineCap = 'round'
    context.lineJoin = 'round'
    const starts = Array.from({ length: cracks }, () => ({
      x: random() * size,
      y: random() * size,
      angle: random() * Math.PI * 2,
      steps: 6 + Math.floor(random() * 7),
    }))
    const seed = random() * 4294967296
    const replay = (fix: number) => {
      let state = (seed + fix) >>> 0
      return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0
        return state / 4294967296
      }
    }
    context.strokeStyle = `#${tones.deep.getHexString()}`
    context.globalAlpha = 0.55
    context.lineWidth = 4
    starts.forEach((start, index) => crack(context, replay(index), start))
    context.globalAlpha = 0.95
    context.strokeStyle = `#${tones.crack.getHexString()}`
    context.lineWidth = 1.6
    starts.forEach((start, index) => crack(context, replay(index), start))
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace

  return texture
}

/**
 * Sky seen by a glossy sheet: pale zenith over a white horizon
 * @param {Color} zenith - Colour straight up
 * @param {Color} horizon - Colour at the horizon
 * @return {CubeTexture} - Cube map
 */

export const skyCube = (zenith: Color, horizon: Color): CubeTexture => {
  const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((face) => {
    const [canvas, context] = canvasOf(SKY, SKY)
    if (context) {
      // Sides fade from horizon, top from zenith, bottom from the horizon too
      const top = face === 'py'
      const gradient = context.createLinearGradient(0, 0, 0, SKY)
      gradient.addColorStop(
        0,
        `#${(top ? zenith : zenith.clone().lerp(horizon, 0.45)).getHexString()}`
      )
      gradient.addColorStop(1, `#${horizon.getHexString()}`)
      context.fillStyle =
        top || face === 'ny' ? `#${(top ? zenith : horizon).getHexString()}` : gradient
      context.fillRect(0, 0, SKY, SKY)
    }

    return canvas
  })
  const cube = new CubeTexture(faces)
  cube.colorSpace = SRGBColorSpace
  cube.needsUpdate = true

  return cube
}
