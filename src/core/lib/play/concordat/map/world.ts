import { inflateSync } from 'node:zlib'

import world from '@/configurations/play/concordatWorld.json'
import { CONCORDAT_WINDOWS } from '@/declarations/play/concordat/world'
import type { ConcordatWindow } from '@/declarations/play/concordat/world'
import type { ConcordatStyleName } from '@/utils/constants/concordat'

let master: Uint8Array | null = null

// Real land mask, 1 land, decoded once
const masterMask = (): Uint8Array => {
  if (master) return master
  const bytes = inflateSync(Buffer.from(world.data, 'base64'))
  const mask = new Uint8Array(world.width * world.height)
  let at = 0
  let head = 0
  let value = 0

  // Alternating runs, sea first
  while (head < bytes.length) {
    let size = 0
    let shift = 0
    let byte = 0
    do {
      byte = bytes[head++]
      size |= (byte & 127) << shift
      shift += 7
    } while (byte & 128)
    if (value) mask.fill(1, at, at + size)
    at += size
    value ^= 1
  }
  master = mask

  return mask
}

/**
 * Tile size and window of a style
 * @param {number} ppd - World pixels per degree
 * @param {ConcordatStyleName} style - Style
 * @return {{ window: ConcordatWindow, pixels: number, width: number, height: number }} - Frame
 */

export const frameOf = (
  ppd: number,
  style: ConcordatStyleName
): { window: ConcordatWindow; pixels: number; width: number; height: number } => {
  const window = CONCORDAT_WINDOWS[style] ?? CONCORDAT_WINDOWS.world
  const pixels = Math.min(world.ppd, ppd * window.zoom)

  return {
    window,
    pixels,
    width: Math.round((window.lonMax - window.lonMin) * pixels),
    height: Math.round((window.latMax - window.latMin) * pixels),
  }
}

/**
 * Land mask of a window, by majority over each tile
 * @param {number} ppd - World pixels per degree
 * @param {ConcordatStyleName} style - Style
 * @return {{ land: Uint8Array, width: number, height: number, pixels: number }} - Land
 */

export const sampleLand = (
  ppd: number,
  style: ConcordatStyleName
): { land: Uint8Array; width: number; height: number; pixels: number } => {
  const { window, pixels, width, height } = frameOf(ppd, style)
  const source = masterMask()
  const land = new Uint8Array(width * height)
  const step = world.ppd / pixels
  const offsetX = (window.lonMin - world.lonMin) * world.ppd
  const offsetY = (world.latMax - window.latMax) * world.ppd

  // Column bounds once, they do not change from row to row
  const edges = new Int32Array(width + 1)
  for (let x = 0; x <= width; x++) edges[x] = Math.min(world.width, Math.floor(offsetX + x * step))

  for (let y = 0; y < height; y++) {
    const fromY = Math.floor(offsetY + y * step)
    const toY = Math.min(world.height, Math.max(fromY + 1, Math.floor(offsetY + (y + 1) * step)))
    const rows = toY - fromY
    for (let x = 0; x < width; x++) {
      const fromX = edges[x]
      const toX = Math.max(fromX + 1, edges[x + 1])
      let count = 0
      for (let sy = fromY; sy < toY; sy++) {
        const base = sy * world.width
        for (let sx = fromX; sx < toX && sx < world.width; sx++) count += source[base + sx]
      }
      const total = rows * (Math.min(toX, world.width) - fromX)
      land[y * width + x] = total > 0 && count * 2 >= total ? 1 : 0
    }
  }

  return { land, width, height, pixels }
}
