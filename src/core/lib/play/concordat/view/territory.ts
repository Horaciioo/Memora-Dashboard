import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map/grid'

/**
 * Pixel recipe of a territory
 * @typedef {Object} ConcordatTerritoryLook
 */

export interface ConcordatTerritoryLook {
  fill: number
  edge: number
  edgeShade: number
}

// Neighbour buffer shared by every call
const near = new Int32Array(NEIGHBOR_SLOTS)

/**
 * Paint one tile of the owner layer: tinted inside, darker on its border
 * @param {ImageData} image - Owner layer
 * @param {Uint8Array} owner - Owners
 * @param {number} tile - Tile
 * @param {[number, number, number][]} colors - Colour per nation, index is the id
 * @param {ConcordatTerritoryLook} look - Alpha and shade
 * @return {void}
 */

export const paintOwnerTile = (
  image: ImageData,
  owner: Uint8Array,
  tile: number,
  colors: [number, number, number][],
  look: ConcordatTerritoryLook
): void => {
  const at = tile * 4
  const holder = owner[tile]
  if (!holder) {
    image.data[at + 3] = 0

    return
  }

  const count = neighborsOf(tile, image.width, image.height, near)
  // Map edge counts as a border too
  let isEdge = count < NEIGHBOR_SLOTS
  for (let slot = 0; slot < count && !isEdge; slot++) isEdge = owner[near[slot]] !== holder
  const shade = isEdge ? look.edgeShade : 1
  const rgb = colors[holder] ?? [0, 0, 0]
  image.data[at] = rgb[0] * shade
  image.data[at + 1] = rgb[1] * shade
  image.data[at + 2] = rgb[2] * shade
  image.data[at + 3] = Math.round(255 * (isEdge ? look.edge : look.fill))
}

/**
 * Repaint tiles and the ring around them, where borders may have moved
 * @param {ImageData} image - Owner layer
 * @param {Uint8Array} owner - Owners
 * @param {number[] | null} tiles - Changed tiles, all of them when null
 * @param {[number, number, number][]} colors - Colour per nation
 * @param {ConcordatTerritoryLook} look - Alpha and shade
 * @return {void}
 */

export const paintOwners = (
  image: ImageData,
  owner: Uint8Array,
  tiles: number[] | null,
  colors: [number, number, number][],
  look: ConcordatTerritoryLook
): void => {
  if (!tiles) {
    for (let tile = 0; tile < owner.length; tile++) paintOwnerTile(image, owner, tile, colors, look)

    return
  }
  for (const tile of tiles) {
    paintOwnerTile(image, owner, tile, colors, look)
    const count = neighborsOf(tile, image.width, image.height, near)
    // Copy: the painter reuses the buffer
    const ring = Array.from(near.subarray(0, count))
    for (const neighbour of ring) paintOwnerTile(image, owner, neighbour, colors, look)
  }
}

/**
 * Mask of one nation, for the hover wash
 * @param {ImageData} image - Mask to fill
 * @param {Uint8Array} owner - Owners
 * @param {number} holder - Nation, zero for none
 * @param {readonly number[]} rgb - Wash colour
 * @return {void}
 */

export const paintMask = (
  image: ImageData,
  owner: Uint8Array,
  holder: number,
  rgb: readonly number[]
): void => {
  for (let tile = 0; tile < owner.length; tile++) {
    const at = tile * 4
    const isHeld = holder > 0 && owner[tile] === holder
    image.data[at] = rgb[0]
    image.data[at + 1] = rgb[1]
    image.data[at + 2] = rgb[2]
    image.data[at + 3] = isHeld ? 255 : 0
  }
}
