'use client'

import { useEffect, useMemo } from 'react'

import { roundBlocks } from '@/composites/play/golf/scene/obstacles/blocks'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfHole } from '@/core/lib/play/golf'

/**
 * Level blocks as rounded cubes, one mesh per hole
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element | null}
 */

export const GolfRoundBlocks = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const geometry = useMemo(
    () =>
      roundBlocks(
        hole.blocks.filter((block) => !block.isHidden),
        paint.obstacle,
        paint['obstacle-top']
      ),
    [hole, paint]
  )
  useEffect(() => () => geometry?.dispose(), [geometry])
  if (!geometry) return null

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshToonMaterial vertexColors />
    </mesh>
  )
}
