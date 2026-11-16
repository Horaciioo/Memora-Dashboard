import { labelComponents } from '@/core/lib/play/concordat/map/grid'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatChokepoints } from '@/types/concordat'
import { ConcordatTerrains } from '@/utils/constants/concordat'

type Kind = keyof ConcordatChokepoints

// Scan runs of a flag along rows then columns
const scanRuns = (
  width: number,
  height: number,
  isRun: (tile: number) => boolean,
  isWall: (tile: number) => boolean,
  mark: (tile: number) => void
): void => {
  const limit = CONCORDAT.map.chokeWidth

  // Both directions
  for (const vertical of [false, true]) {
    const lines = vertical ? width : height
    const length = vertical ? height : width
    const at = (line: number, step: number): number =>
      vertical ? step * width + line : line * width + step

    for (let line = 0; line < lines; line++) {
      let step = 0
      while (step < length) {
        if (!isRun(at(line, step))) {
          step++
          continue
        }

        // Run of the flag
        let end = step
        while (end < length && isRun(at(line, end))) end++
        const size = end - step
        const isEnclosed =
          step > 0 && end < length && isWall(at(line, step - 1)) && isWall(at(line, end))
        if (isEnclosed && size <= limit)
          for (let walk = step; walk < end; walk++) mark(at(line, walk))
        step = end
      }
    }
  }
}

/**
 * Straits, isthmuses and passes of a map
 * @param {Uint8Array} terrain - Terrain ids
 * @param {number} width - Width
 * @param {number} height - Height
 * @return {ConcordatChokepoints} - Tiles by kind
 */

export const findChokepoints = (
  terrain: Uint8Array,
  width: number,
  height: number
): ConcordatChokepoints => {
  const sea = terrain.map((value) => (value === ConcordatTerrains.Sea ? 1 : 0))
  const oceans = labelComponents(sea, width, height)
  const found: Record<Kind, Set<number>> = {
    strait: new Set(),
    isthmus: new Set(),
    pass: new Set(),
  }
  const isSea = (tile: number): boolean => terrain[tile] === ConcordatTerrains.Sea
  const isLand = (tile: number): boolean => !isSea(tile)
  const isMountain = (tile: number): boolean => terrain[tile] === ConcordatTerrains.Mountain

  // Narrow open sea between lands
  scanRuns(
    width,
    height,
    (tile) => isSea(tile) && oceans.touchesEdge[oceans.label[tile]],
    isLand,
    (tile) => found.strait.add(tile)
  )

  // Narrow land between seas
  scanRuns(width, height, isLand, isSea, (tile) => found.isthmus.add(tile))

  // Gap between mountains
  scanRuns(
    width,
    height,
    (tile) => isLand(tile) && !isMountain(tile),
    isMountain,
    (tile) => found.pass.add(tile)
  )

  return {
    strait: [...found.strait],
    isthmus: [...found.isthmus],
    pass: [...found.pass],
  }
}
