/**
 * Detached canvas painted only when its key changes
 * @typedef {Object} OceanLayer
 */

export interface OceanLayer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null
  key: string
}

/**
 * Empty layer
 * @return {OceanLayer} - Layer
 */

export const blankLayer = (): OceanLayer => {
  const canvas = document.createElement('canvas')

  return { canvas, ctx: canvas.getContext('2d'), key: '' }
}

/**
 * Layer brought up to date, repainted only on a new key
 * @param {OceanLayer} layer - Layer
 * @param {string} key - What the content depends on
 * @param {{ width: number; ratio: number }} size - Pixels across and density
 * @param {(ctx: CanvasRenderingContext2D) => void} paint - Painter, in CSS pixels
 * @return {HTMLCanvasElement} - Canvas to copy
 */

export const freshLayer = (
  layer: OceanLayer,
  key: string,
  { width, ratio }: { width: number; ratio: number },
  paint: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement => {
  const { canvas, ctx } = layer
  if (layer.key === key || !ctx) return canvas
  layer.key = key
  const pixels = Math.round(width * ratio)
  if (canvas.width !== pixels) {
    canvas.width = pixels
    canvas.height = pixels
  } else ctx.clearRect(0, 0, pixels, pixels)
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  paint(ctx)

  return canvas
}

/**
 * Memory of a layer given back
 * @param {OceanLayer} layer - Layer
 * @return {void}
 */

export const freeLayer = (layer: OceanLayer): void => {
  layer.canvas.width = 0
  layer.canvas.height = 0
  layer.key = ''
}
