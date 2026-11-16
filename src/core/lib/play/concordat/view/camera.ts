/**
 * Window on the map: pixel offset of the top left tile and pixels per tile
 * @typedef {Object} ConcordatCamera
 */

export interface ConcordatCamera {
  x: number
  y: number
  scale: number
}

/**
 * Size of the screen and of the map it shows
 * @typedef {Object} ConcordatFrame
 */

export interface ConcordatFrame {
  viewWidth: number
  viewHeight: number
  mapWidth: number
  mapHeight: number
}

/**
 * Smallest zoom, the whole map in view
 * @param {ConcordatFrame} frame - Sizes
 * @param {number} share - Share of the view used
 * @return {number} - Pixels per tile
 */

export const fitScale = (frame: ConcordatFrame, share: number): number =>
  Math.min(frame.viewWidth / frame.mapWidth, frame.viewHeight / frame.mapHeight) * share

/**
 * Camera showing the whole map, centred
 * @param {ConcordatFrame} frame - Sizes
 * @param {number} share - Share of the view used
 * @return {ConcordatCamera} - Camera
 */

export const fitCamera = (frame: ConcordatFrame, share: number): ConcordatCamera => {
  const scale = fitScale(frame, share)

  return {
    scale,
    x: (frame.viewWidth - frame.mapWidth * scale) / 2,
    y: (frame.viewHeight - frame.mapHeight * scale) / 2,
  }
}

// Offset kept inside the view, centred when the map is smaller
const clampAxis = (offset: number, view: number, size: number, slack: number): number =>
  size + 2 * slack <= view
    ? (view - size) / 2
    : Math.min(slack, Math.max(view - size - slack, offset))

/**
 * Camera kept over the map
 * @param {ConcordatCamera} camera - Camera
 * @param {ConcordatFrame} frame - Sizes
 * @param {number} slack - Free margin around the map in pixels
 * @return {ConcordatCamera} - Camera
 */

export const clampCamera = (
  camera: ConcordatCamera,
  frame: ConcordatFrame,
  slack: number
): ConcordatCamera => ({
  scale: camera.scale,
  x: clampAxis(camera.x, frame.viewWidth, frame.mapWidth * camera.scale, slack),
  y: clampAxis(camera.y, frame.viewHeight, frame.mapHeight * camera.scale, slack),
})

/**
 * Zoom that keeps the point under the pointer still
 * @param {ConcordatCamera} camera - Camera
 * @param {number} factor - Scale multiplier
 * @param {number} pointX - Pointer x in pixels
 * @param {number} pointY - Pointer y in pixels
 * @param {number[]} limits - Smallest then largest scale
 * @return {ConcordatCamera} - Camera
 */

export const zoomCamera = (
  camera: ConcordatCamera,
  factor: number,
  pointX: number,
  pointY: number,
  limits: number[]
): ConcordatCamera => {
  const scale = Math.min(limits[1], Math.max(limits[0], camera.scale * factor))
  const ratio = scale / camera.scale

  return {
    scale,
    x: pointX - (pointX - camera.x) * ratio,
    y: pointY - (pointY - camera.y) * ratio,
  }
}

/**
 * Tile under a screen point, minus one outside the map
 * @param {ConcordatCamera} camera - Camera
 * @param {ConcordatFrame} frame - Sizes
 * @param {number} pointX - Pointer x in pixels
 * @param {number} pointY - Pointer y in pixels
 * @return {number} - Tile index
 */

export const tileAtPoint = (
  camera: ConcordatCamera,
  frame: ConcordatFrame,
  pointX: number,
  pointY: number
): number => {
  const column = Math.floor((pointX - camera.x) / camera.scale)
  const row = Math.floor((pointY - camera.y) / camera.scale)
  const isOutside = column < 0 || row < 0 || column >= frame.mapWidth || row >= frame.mapHeight

  return isOutside ? -1 : row * frame.mapWidth + column
}

/**
 * Camera centred on a tile
 * @param {ConcordatCamera} camera - Camera
 * @param {ConcordatFrame} frame - Sizes
 * @param {number} tile - Tile index
 * @param {number} scale - Pixels per tile
 * @return {ConcordatCamera} - Camera
 */

export const centerOnTile = (
  camera: ConcordatCamera,
  frame: ConcordatFrame,
  tile: number,
  scale: number
): ConcordatCamera => {
  const column = (tile % frame.mapWidth) + 0.5
  const row = Math.floor(tile / frame.mapWidth) + 0.5

  return {
    scale,
    x: frame.viewWidth / 2 - column * scale,
    y: frame.viewHeight / 2 - row * scale,
  }
}
