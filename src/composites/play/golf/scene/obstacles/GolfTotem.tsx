'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshBasicMaterial } from 'three'

import { FLAT } from '@/composites/play/golf/scene/obstacles/flat'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfTotem as GolfTotemEntry } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { totem } = GOLF_SCENE
const { shadow } = totem

/**
 * Segmented post rising and sinking on the hole clock, its shadow darkening before it rises
 * @param {Object} props - Totem
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {() => number} props.clock - Seconds since the hole opened
 * @param {GolfTotemEntry} props.entry - Totem
 * @return {JSX.Element}
 */

export const GolfTotem = ({
  hole,
  paint,
  clock,
  entry,
}: {
  hole: GolfHole
  paint: GolfPaint
  clock: () => number
  entry: GolfTotemEntry
}) => {
  const post = useRef<Group>(null)
  const shade = useRef<MeshBasicMaterial>(null)
  const floor = floorHeight(hole, entry.x, entry.z) ?? entry.floor
  const piece = totem.height / totem.segments
  useFrame(() => {
    const wave = (at: number) => Math.sin((2 * Math.PI * at) / entry.period + entry.phase)
    // Same wave as the physics
    const now = clock()
    if (post.current)
      post.current.scale.y = Math.max(totem.floor, Math.min(1, wave(now) * totem.rise))
    // A little ahead, so it warns
    const soon = Math.max(0, Math.min(1, wave(now + entry.period * shadow.lead) * totem.rise))
    if (shade.current) shade.current.opacity = shadow.low + (shadow.high - shadow.low) * soon
  })

  return (
    <group position={[entry.x, floor, entry.z]}>
      <mesh position={[0, 0.006, 0]} rotation={FLAT}>
        <circleGeometry args={[entry.r, 32]} />
        <meshBasicMaterial ref={shade} color={paint.shade} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.007, 0]} rotation={FLAT}>
        <ringGeometry args={[entry.r - shadow.ring, entry.r, 32]} />
        <meshBasicMaterial color={paint.totem} />
      </mesh>
      <group ref={post}>
        {Array.from({ length: totem.segments }, (_, index) => {
          const radius = entry.r * totem.shrink ** index
          return (
            <group key={index} position={[0, piece * index, 0]}>
              <mesh position={[0, piece / 2, 0]} castShadow>
                <cylinderGeometry args={[radius, radius, piece * 0.86, 24]} />
                <meshToonMaterial color={index % 2 ? paint.block : paint.totem} />
              </mesh>
              {/* Rim between pieces */}
              <mesh position={[0, piece * 0.93, 0]}>
                <cylinderGeometry args={[radius * 0.92, radius, piece * 0.14, 24]} />
                <meshToonMaterial color={paint.cloud} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}
