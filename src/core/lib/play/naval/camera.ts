/**
 * Camera over a sea, in squares
 * @typedef {Object} NavalCamera
 * @property {number} x - Square at the centre, column
 * @property {number} y - Square at the centre, row
 * @property {number} span - Squares across the view
 */

export interface NavalCamera {
  x: number
  y: number
  span: number
}

/**
 * Point in pixels
 * @typedef {Object} NavalPoint
 */

export interface NavalPoint {
  x: number
  y: number
}

/**
 * Camera kept inside the sea
 * @param {NavalCamera} camera - Wanted camera
 * @param {number} size - Sea size
 * @param {number} minSpan - Closest zoom
 * @return {NavalCamera} - Camera
 */

export const clampCamera = (camera: NavalCamera, size: number, minSpan: number): NavalCamera => {
  const span = Math.min(size, Math.max(Math.min(minSpan, size), camera.span))
  const half = span / 2

  return {
    span,
    x: Math.min(size - half, Math.max(half, camera.x)),
    y: Math.min(size - half, Math.max(half, camera.y)),
  }
}

/**
 * Camera on arrival, centred
 * @param {number} size - Sea size
 * @param {number} startSpan - Squares across
 * @return {NavalCamera} - Camera
 */

export const firstCamera = (size: number, startSpan: number): NavalCamera => ({
  x: size / 2,
  y: size / 2,
  span: Math.min(size, startSpan),
})

/**
 * Square under a point of the view
 * @param {NavalCamera} camera - Camera
 * @param {NavalPoint} point - Point, in pixels from the top left
 * @param {number} width - View width in pixels
 * @return {NavalPoint} - Position in squares, not rounded
 */

export const seaPointOf = (camera: NavalCamera, point: NavalPoint, width: number): NavalPoint => {
  const cell = width / camera.span

  return {
    x: camera.x - camera.span / 2 + point.x / cell,
    y: camera.y - camera.span / 2 + point.y / cell,
  }
}

/**
 * Zoom kept under a point, like a map
 * @param {NavalCamera} camera - Camera
 * @param {NavalPoint} point - Pivot, in pixels
 * @param {number} width - View width
 * @param {number} factor - Above one zooms in
 * @return {NavalCamera} - Camera, not clamped
 */

export const zoomAt = (
  camera: NavalCamera,
  point: NavalPoint,
  width: number,
  factor: number
): NavalCamera => {
  const pivot = seaPointOf(camera, point, width)
  const span = camera.span / factor

  return {
    span,
    x: pivot.x + (camera.x - pivot.x) / factor,
    y: pivot.y + (camera.y - pivot.y) / factor,
  }
}

/**
 * Camera dragged by some pixels
 * @param {NavalCamera} camera - Camera
 * @param {NavalPoint} delta - Pixels moved
 * @param {number} width - View width
 * @return {NavalCamera} - Camera, not clamped
 */

export const panBy = (camera: NavalCamera, delta: NavalPoint, width: number): NavalCamera => {
  const cell = width / camera.span

  return { ...camera, x: camera.x - delta.x / cell, y: camera.y - delta.y / cell }
}

/**
 * Point of a tilted board, back to the flat board
 * @param {NavalPoint} point - Point from the box centre, as seen
 * @param {number} tiltDeg - Board tilt
 * @param {number} perspective - Eye distance
 * @return {NavalPoint} - Point from the box centre, flat
 */

export const untilt = (point: NavalPoint, tiltDeg: number, perspective: number): NavalPoint => {
  const angle = (tiltDeg * Math.PI) / 180
  const y = (point.y * perspective) / (Math.cos(angle) * perspective + point.y * Math.sin(angle))
  const scale = perspective / (perspective - y * Math.sin(angle))

  return { x: point.x / scale, y }
}
