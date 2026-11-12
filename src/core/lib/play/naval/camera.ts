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
 * Camera over a sea and its decor: a few squares more, leaning towards the deeper bands
 * @param {number} size - Sea size
 * @param {Record<'north' | 'east' | 'south' | 'west', number>} band - Decor squares on each side
 * @param {number} margin - Squares added to the view
 * @return {NavalCamera} - Camera, the whole sea always in view
 */

export const stageCamera = (
  size: number,
  band: Record<'north' | 'east' | 'south' | 'west', number>,
  margin: number
): NavalCamera => {
  const lean = (far: number, near: number) => (far + near ? (((far - near) / (far + near)) * margin) / 2 : 0)

  return { x: size / 2 + lean(band.east, band.west), y: size / 2 + lean(band.south, band.north), span: size + margin }
}

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
