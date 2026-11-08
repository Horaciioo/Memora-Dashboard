'use client'

import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'

import {
  cliffFeet,
  edgeBands,
  openEdges,
  sandEdges,
} from '@/composites/play/golf/scene/obstacles/edges'
import { bandTexture } from '@/composites/play/golf/scene/obstacles/textures'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { edge } = GOLF_SCENE

/**
 * Ground bands: shade at cliff feet, dark lip on open edges, firm rim round sand
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfEdgeBands = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const fade = useMemo(() => bandTexture(), [])
  const bands = useMemo(
    () => [
      {
        key: 'cliff',
        geometry: edgeBands(hole, cliffFeet(hole), edge.cliff.width),
        color: paint.turf.clone().lerp(paint.shade, edge.cliff.shade),
        opacity: edge.cliff.opacity,
      },
      {
        key: 'open',
        geometry: edgeBands(hole, openEdges(hole), edge.open.width),
        color: paint.turf.clone().lerp(paint.shade, edge.open.shade),
        opacity: edge.open.opacity,
      },
      {
        key: 'sand',
        geometry: edgeBands(hole, sandEdges(hole), edge.sand.width),
        color: paint.sand.clone().lerp(paint.shade, edge.sand.shade),
        opacity: edge.sand.opacity,
      },
    ],
    [hole, paint]
  )
  useEffect(
    () => () => {
      fade.dispose()
      for (const band of bands) band.geometry.dispose()
    },
    [fade, bands]
  )

  return (
    <>
      {bands.map((band) => (
        <mesh key={band.key} geometry={band.geometry}>
          <meshBasicMaterial
            color={band.color}
            alphaMap={band.key === 'sand' ? null : fade}
            transparent
            opacity={band.opacity}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}
