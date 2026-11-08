'use client'

import { useMemo } from 'react'
import { Line } from '@react-three/drei'

import { hitboxLines } from '@/composites/play/golf/scene/hitboxes'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfHazard, GolfHole } from '@/core/lib/play/golf'

/**
 * Debug wireframe of every collider, drawn over the course
 * @param {Object} props - Course
 * @param {GolfHole} props.hole - Hole
 * @param {GolfHazard[]} props.hazards - Laid powers
 * @param {GolfPaint} props.paint - Colours
 * @param {() => number} props.serverNow - Server clock
 * @return {JSX.Element}
 */

export const GolfHitboxes = ({
  hole,
  hazards,
  paint,
  serverNow,
}: {
  hole: GolfHole
  hazards: GolfHazard[]
  paint: GolfPaint
  serverNow: () => number
}) => {
  const lines = useMemo(() => hitboxLines(hole, hazards, serverNow()), [hole, hazards, serverNow])

  return (
    <group>
      {lines.map((points, index) => (
        <Line key={index} points={points} color={paint.hitbox} lineWidth={1.5} depthTest={false} />
      ))}
    </group>
  )
}
