import type { ConcordatCamera, ConcordatPlace } from '@/core/lib/play/concordat'
import type { ConcordatClientState } from '@/core/lib/play/concordat'
import type { ConcordatMark } from '@/core/store/play/concordatView'

/**
 * Offscreen layers of the map, one pixel per tile
 * @typedef {Object} ConcordatLayers
 */

export interface ConcordatLayers {
  terrain: HTMLCanvasElement
  owner: HTMLCanvasElement
  mask: HTMLCanvasElement
}

/**
 * Tile just taken, with the moment its front reaches it
 * @typedef {Object} ConcordatWave
 */

export interface ConcordatWave {
  tile: number
  at: number
}

/**
 * Everything one frame is drawn from
 * @typedef {Object} ConcordatScene
 */

export interface ConcordatScene {
  client: ConcordatClientState
  camera: ConcordatCamera
  width: number
  height: number
  layers: ConcordatLayers
  // Colour per nation, index is the id, zero is the neutral
  colors: [number, number, number][]
  names: string[]
  places: ConcordatPlace[]
  // Tile under the pointer, minus one for none
  hoverTile: number
  // Nation washed, zero for none
  washed: number
  // Missile armed on the pointer
  aim: { isHeavy: boolean } | null
  // Clicks still echoing
  marks: ConcordatMark[]
  // Font family of the page
  font: string
  // Clock of the frame in milliseconds
  now: number
}
