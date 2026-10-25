/**
 * Keyboard of the golf course, physical keys so any layout works
 * @type {Record<string, readonly string[]>}
 */

export const GOLF_KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  zoomIn: ['ArrowUp', 'KeyW'],
  zoomOut: ['ArrowDown', 'KeyS'],
  overview: ['Space'],
  cancel: ['Escape'],
} as const
