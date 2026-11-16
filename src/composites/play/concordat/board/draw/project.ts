import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'

/**
 * Screen point of a point given in tiles, fractional allowed
 * @param {ConcordatScene} scene - Frame data
 * @param {number} x - Column in tiles
 * @param {number} y - Row in tiles
 * @return {[number, number]} - Pixels
 */

export const pointOf = (scene: ConcordatScene, x: number, y: number): [number, number] => [
  scene.camera.x + x * scene.camera.scale,
  scene.camera.y + y * scene.camera.scale,
]

/**
 * Screen point of the centre of a tile
 * @param {ConcordatScene} scene - Frame data
 * @param {number} tile - Tile
 * @return {[number, number]} - Pixels
 */

export const centreOf = (scene: ConcordatScene, tile: number): [number, number] => {
  const column = tile % scene.client.map.width

  return pointOf(scene, column + 0.5, (tile - column) / scene.client.map.width + 0.5)
}

/**
 * A point is far enough outside the screen not to be drawn
 * @param {ConcordatScene} scene - Frame data
 * @param {number} x - Pixels
 * @param {number} y - Pixels
 * @param {number} margin - Pixels of slack
 * @return {boolean} - Outside
 */

export const isOutside = (scene: ConcordatScene, x: number, y: number, margin: number): boolean =>
  x < -margin || y < -margin || x > scene.width + margin || y > scene.height + margin
