import { Float32BufferAttribute } from 'three'
import type { BufferGeometry, Color } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

import { isFlatBlock } from '@/composites/play/golf/scene/geometry'
import type { GolfBlock } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { block } = GOLF_SCENE

// Normal height from which a face counts as the top
const TOP = 0.7

/**
 * Rounded box filling exactly the collider of a level block
 * @param {GolfBlock} entry - Block
 * @return {BufferGeometry} - Geometry, placed
 */

export const roundBlockGeometry = (entry: GolfBlock): BufferGeometry => {
  const width = entry.x1 - entry.x0
  const depth = entry.z1 - entry.z0
  const height = GOLF_SETTINGS.render.blockHeight
  const radius = Math.min(block.radius, width / 2, depth / 2, height / 2)
  const geometry = new RoundedBoxGeometry(width, height, depth, block.segments, radius)
  geometry.translate(
    (entry.x0 + entry.x1) / 2,
    entry.corners[0] + height / 2,
    (entry.z0 + entry.z1) / 2
  )

  return geometry
}

/**
 * Every level block of a hole in one geometry, the top lighter than the sides
 * @param {GolfBlock[]} blocks - Blocks
 * @param {Color} side - Side colour
 * @param {Color} top - Top colour
 * @return {BufferGeometry | null} - Geometry, none without level blocks
 */

export const roundBlocks = (
  blocks: GolfBlock[],
  side: Color,
  top: Color
): BufferGeometry | null => {
  const parts = blocks.filter(isFlatBlock).map(roundBlockGeometry)
  if (!parts.length) return null
  const geometry = mergeGeometries(parts)
  for (const part of parts) part.dispose()
  const normals = geometry.getAttribute('normal')
  const colors = Array.from({ length: normals.count }, (_, vertex) =>
    (normals.getY(vertex) > TOP ? top : side).toArray()
  )
  geometry.setAttribute('color', new Float32BufferAttribute(colors.flat(), 3))

  return geometry
}
