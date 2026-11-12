/**
 * Window rectangle in pixels
 * @typedef {Object} Rect
 * @property {number} x - Left
 * @property {number} y - Top
 * @property {number} width - Width
 * @property {number} height - Height
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Size limits and margin
 * @typedef {Object} Bounds
 */

export interface Bounds {
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  margin: number
}

/**
 * Viewport size
 * @typedef {Object} Viewport
 */

export interface Viewport {
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max))

/**
 * Keep a rectangle inside the viewport and the size limits
 * @param {Rect} rect - Wanted rectangle
 * @param {Viewport} viewport - Browser window
 * @param {Bounds} bounds - Size limits
 * @return {Rect} - Fitting rectangle
 */

export const fitRect = (rect: Rect, viewport: Viewport, bounds: Bounds): Rect => {
  const room = {
    width: viewport.width - bounds.margin * 2,
    height: viewport.height - bounds.margin * 2,
  }
  const width = clamp(rect.width, bounds.minWidth, Math.min(bounds.maxWidth, room.width))
  const height = clamp(rect.height, bounds.minHeight, Math.min(bounds.maxHeight, room.height))

  return {
    width,
    height,
    x: clamp(rect.x, bounds.margin, viewport.width - width - bounds.margin),
    y: clamp(rect.y, bounds.margin, viewport.height - height - bounds.margin),
  }
}

/**
 * Grips a window offers
 * @type {readonly string[]}
 */

export const GRIPS = ['east', 'south', 'corner'] as const

export type Grip = (typeof GRIPS)[number]

/**
 * Rectangle after a resize drag
 * @param {Rect} start - Rectangle at drag start
 * @param {Grip} grip - Grip held
 * @param {number} dx - Horizontal move
 * @param {number} dy - Vertical move
 * @return {Rect} - Dragged rectangle, before fitting
 */

export const resizeRect = (start: Rect, grip: Grip, dx: number, dy: number): Rect => ({
  ...start,
  width: grip === 'south' ? start.width : start.width + dx,
  height: grip === 'east' ? start.height : start.height + dy,
})

/**
 * Read a stored rectangle
 * @param {string | null} raw - Stored text
 * @return {Rect | null} - Rectangle or null
 */

export const readStoredRect = (raw: string | null): Rect | null => {
  try {
    const value = JSON.parse(raw ?? 'null') as Partial<Rect> | null
    const keys = ['x', 'y', 'width', 'height'] as const

    return value && keys.every((key) => Number.isFinite(value[key])) ? (value as Rect) : null
  } catch {
    return null
  }
}
