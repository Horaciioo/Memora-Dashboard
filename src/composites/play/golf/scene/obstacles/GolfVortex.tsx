'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

import { FLAT } from '@/composites/play/golf/scene/obstacles/flat'
import { spiralTexture } from '@/composites/play/golf/scene/obstacles/textures'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfCircle, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { vortex } = GOLF_SCENE

/**
 * Black hole: zone circle, spiral turning inward, dark core
 * @param {Object} props - Vortex
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {GolfCircle} props.entry - Vortex
 * @return {JSX.Element}
 */

export const GolfVortex = ({
  hole,
  paint,
  entry,
}: {
  hole: GolfHole
  paint: GolfPaint
  entry: GolfCircle
}) => {
  const spiral = useRef<Mesh>(null)
  const arms = useMemo(() => spiralTexture(), [])
  useEffect(() => () => arms.dispose(), [arms])
  // Arms drift to the core as the spiral turns
  useFrame((_, delta) => {
    if (spiral.current) spiral.current.rotation.z -= delta * vortex.spin
  })

  return (
    <group
      position={[entry.x, (floorHeight(hole, entry.x, entry.z) ?? 0) + vortex.lift, entry.z]}
      rotation={FLAT}
    >
      <mesh>
        <circleGeometry args={[entry.r, vortex.segments]} />
        <meshBasicMaterial color={paint.vortex} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[entry.r - vortex.outline, entry.r, vortex.segments]} />
        <meshBasicMaterial color={paint.portal} />
      </mesh>
      <mesh ref={spiral} position={[0, 0, 0.002]}>
        <circleGeometry args={[entry.r, vortex.segments]} />
        <meshBasicMaterial
          map={arms}
          color={paint.portal}
          transparent
          opacity={vortex.opacity}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry
          args={[GOLF_SETTINGS.obstacles.vortexCore * vortex.core, vortex.segments]}
        />
        <meshBasicMaterial color={paint.vortex} />
      </mesh>
    </group>
  )
}
