/**
 * Keyboard of the golf course, physical keys so any layout works
 * @type {Record<string, readonly string[]>}
 */

export const GOLF_KEYS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  zoomIn: ['ArrowUp', 'KeyW'],
  zoomOut: ['ArrowDown', 'KeyS'],
  pitchUp: ['KeyE', 'PageUp'],
  pitchDown: ['KeyQ', 'PageDown'],
  overview: ['Space'],
  cancel: ['Escape'],
} as const
