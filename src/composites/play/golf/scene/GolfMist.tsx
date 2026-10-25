'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { mistTexture } from '@/composites/play/golf/scene/textures'
import { overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { mist } = GOLF_SCENE

/**
 * Light mist drifting around and under the course
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfMist = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const cloud = useRef<Group>(null)
  const puff = useMemo(() => mistTexture(mist.pixels), [])
  const { center, reach } = useMemo(() => overviewOf(hole), [hole])
  useEffect(() => () => puff.dispose(), [puff])
  useFrame((_, delta) => {
    if (cloud.current) cloud.current.rotation.y += delta * mist.drift
  })

  return (
    <group ref={cloud} position={[center.x, -mist.below, center.z]}>
      {Array.from({ length: mist.puffs }, (_, index) => {
        // Rings at a few distances
        const angle = index * mist.turn
        const distance = (reach / 2) * mist.spread * (1 + (index % 5) / 4) * 0.5

        return (
          <sprite
            key={index}
            position={[
              Math.cos(angle) * distance,
              (index % 3) * mist.rise,
              Math.sin(angle) * distance,
            ]}
            scale={[mist.size, mist.size * mist.flat, 1]}
          >
            <spriteMaterial
              map={puff}
              color={paint.mist}
              transparent
              opacity={mist.opacity}
              depthWrite={false}
            />
          </sprite>
        )
      })}
    </group>
  )
}
