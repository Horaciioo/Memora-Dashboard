import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import type { Color } from 'three'

import { GOLF_SCENE } from '@/declarations/play/golf/scene'

// Ball skin pixels
const BALL_SKIN = 64

// Ring share of the skin
const BALL_BAND = 0.12

/**
 * Ball skin, a white ring showing the roll
 * @param {Color} color - Seat colour
 * @param {Color} stripe - Ring colour
 * @return {CanvasTexture} - Texture
 */

export const ballTexture = (color: Color, stripe: Color): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = BALL_SKIN * 2
  canvas.height = BALL_SKIN
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = `#${color.getHexString()}`
    context.fillRect(0, 0, canvas.width, canvas.height)
    // Two meridians, one great circle
    context.fillStyle = `#${stripe.getHexString()}`
    const band = BALL_SKIN * BALL_BAND
    context.fillRect(0, 0, band, canvas.height)
    context.fillRect(BALL_SKIN, 0, band, canvas.height)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

/**
 * Question mark of a power box, white on clear
 * @param {number} size - Canvas pixels
 * @param {Color} ink - Outline colour
 * @return {CanvasTexture} - Texture
 */

export const questionTexture = (size: number, ink: Color): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    context.font = `900 ${size * 0.72}px ${getComputedStyle(document.body).fontFamily}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineWidth = size * 0.08
    context.strokeStyle = `#${ink.getHexString()}`
    context.fillStyle = 'white'
    context.strokeText('?', size / 2, size * 0.54)
    context.fillText('?', size / 2, size * 0.54)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

// Decal pixels
const DECAL = 256

/**
 * Square canvas to paint a decal on
 * @param {(context: CanvasRenderingContext2D) => void} paint - Drawing
 * @return {CanvasTexture} - Texture
 */

const decal = (paint: (context: CanvasRenderingContext2D) => void): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = DECAL
  canvas.height = DECAL
  const context = canvas.getContext('2d')
  if (context) paint(context)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

// Chevron tops of a boost plate, front first
const BOOST_CHEVRONS = [0.3, 0.55]

/**
 * Chevron pointing up
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {Color} color - Stroke colour
 * @param {number} top - Tip height share
 * @return {void}
 */

const strokeChevron = (context: CanvasRenderingContext2D, color: Color, top: number): void => {
  context.strokeStyle = `#${color.getHexString()}`
  context.lineWidth = DECAL * 0.09
  context.lineJoin = 'miter'
  context.beginPath()
  context.moveTo(DECAL * 0.2, DECAL * (top + 0.2))
  context.lineTo(DECAL * 0.5, DECAL * top)
  context.lineTo(DECAL * 0.8, DECAL * (top + 0.2))
  context.stroke()
}

/**
 * Boost plate: yellow card, red rim, two red chevrons pointing up
 * @param {Color} fill - Card colour
 * @param {Color} edge - Rim and chevrons
 * @return {CanvasTexture} - Texture
 */

export const boostTexture = (fill: Color, edge: Color): CanvasTexture =>
  decal((context) => {
    const rim = DECAL * 0.06
    context.fillStyle = `#${edge.getHexString()}`
    context.beginPath()
    context.roundRect(rim / 2, rim / 2, DECAL - rim, DECAL - rim, DECAL * 0.08)
    context.fill()
    context.fillStyle = `#${fill.getHexString()}`
    context.beginPath()
    context.roundRect(rim * 1.5, rim * 1.5, DECAL - rim * 3, DECAL - rim * 3, DECAL * 0.05)
    context.fill()
    for (const top of BOOST_CHEVRONS) strokeChevron(context, edge, top)
  })

/**
 * One chevron of a boost plate on clear, to flash over the plate
 * @param {Color} color - Chevron colour
 * @param {number} index - Chevron, front first
 * @return {CanvasTexture} - Texture
 */

export const boostChevronTexture = (color: Color, index: number): CanvasTexture =>
  decal((context) => strokeChevron(context, color, BOOST_CHEVRONS[index]))

/**
 * Fade in square steps, solid at the top, gone at the bottom, rough edges
 * @return {CanvasTexture} - Alpha map
 */

export const fadeTexture = (): CanvasTexture => {
  const texture = decal((context) => {
    const cells = 8
    const cell = DECAL / cells
    for (let row = 0; row < cells; row += 1) {
      for (let column = 0; column < cells; column += 1) {
        // Fixed wobble per square, no random
        const wobble = (((row * 7 + column * 13) % 5) - 2) * 0.07
        const level = Math.min(1, Math.max(0, 1 - row / (cells - 1) + wobble))
        // Whole steps of grey
        const grey = Math.round(level * 4) * 63.75
        context.fillStyle = `rgb(${grey} ${grey} ${grey})`
        context.fillRect(column * cell, row * cell, cell, cell)
      }
    }
  })
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter

  return texture
}

/**
 * Cubic patches of lighter and darker wall, tiled
 * @param {() => number} random - Seeded source
 * @return {CanvasTexture} - Texture
 */

export const patchTexture = (random: () => number): CanvasTexture => {
  const { cells, dark, big } = GOLF_SCENE.patch
  const canvas = document.createElement('canvas')
  canvas.width = cells
  canvas.height = cells
  const context = canvas.getContext('2d')
  if (context) {
    const shade = (tone: number) => {
      const level = Math.round(tone * 255)
      return `rgb(${level} ${level} ${level})`
    }
    // Single cubes
    for (let x = 0; x < cells; x++) {
      for (let y = 0; y < cells; y++) {
        context.fillStyle = shade(dark + random() * (1 - dark))
        context.fillRect(x, y, 1, 1)
      }
    }
    // Wider patches over them
    for (let index = 0; index < big.count; index++) {
      const size = big.min + Math.floor(random() * (big.max - big.min))
      context.fillStyle = shade(big.dark + random() * (1 - big.dark))
      context.fillRect(Math.floor(random() * cells), Math.floor(random() * cells), size, size)
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter

  return texture
}

/**
 * Sand grain: speckles and soft dune bands, tiled
 * @param {() => number} random - Seeded source
 * @return {CanvasTexture} - Texture
 */

export const sandTexture = (random: () => number): CanvasTexture => {
  const { cells, dark, flecks, band } = GOLF_SCENE.sand
  const canvas = document.createElement('canvas')
  canvas.width = cells
  canvas.height = cells
  const context = canvas.getContext('2d')
  if (context) {
    for (let x = 0; x < cells; x++) {
      for (let y = 0; y < cells; y++) {
        // Wavy rows, one darker line each band
        const isBand =
          Math.floor(y + Math.sin((x / cells) * Math.PI * 2) * band.wave) % band.every === 0
        const grain = dark + random() * (1 - dark)
        const level = Math.round(
          Math.min(1, grain * (isBand ? band.tone : 1) + (random() < flecks ? -0.1 : 0)) * 255
        )
        context.fillStyle = `rgb(${level} ${level} ${level})`
        context.fillRect(x, y, 1, 1)
      }
    }
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.magFilter = NearestFilter
  texture.minFilter = LinearMipmapLinearFilter

  return texture
}
