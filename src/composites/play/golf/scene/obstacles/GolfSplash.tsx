'use client'

import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import type { Group, InstancedMesh, Mesh, MeshBasicMaterial } from 'three'

import { FLAT } from '@/composites/play/golf/scene/obstacles/flat'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { splash } = GOLF_SCENE

/**
 * Ring and drops thrown up where a ball falls in water
 * @param {Object} props - Motion and colours
 * @param {RefObject<GolfMotion>} props.motionRef - Motion, the last splash
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfSplash = ({
  motionRef,
  paint,
}: {
  motionRef: RefObject<GolfMotion>
  paint: GolfPaint
}) => {
  const root = useRef<Group>(null)
  const ring = useRef<Mesh>(null)
  const ringLook = useRef<MeshBasicMaterial>(null)
  const drops = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const spray = useMemo(() => paint.water.clone().lerp(paint.cloud, 0.6), [paint])

  useFrame(() => {
    const last = motionRef.current.splash
    const progress = last ? (performance.now() - last.at) / splash.ms : 1
    if (!root.current) return
    root.current.visible = progress < 1
    if (!last || progress >= 1) return
    root.current.position.set(last.x, last.y, last.z)
    ring.current?.scale.setScalar(0.2 + progress * splash.reach)
    if (ringLook.current) ringLook.current.opacity = 1 - progress
    if (!drops.current) return
    for (let index = 0; index < splash.drops; index += 1) {
      const angle = (index / splash.drops) * Math.PI * 2
      const out = progress * splash.reach * (0.6 + (index % 3) * 0.2)
      holder.position.set(
        Math.cos(angle) * out,
        4 * splash.rise * progress * (1 - progress),
        Math.sin(angle) * out
      )
      holder.scale.setScalar(1 - progress * 0.6)
      holder.updateMatrix()
      drops.current.setMatrixAt(index, holder.matrix)
    }
    drops.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={root} visible={false}>
      <mesh ref={ring} rotation={FLAT}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial ref={ringLook} color={paint.cloud} transparent depthWrite={false} />
      </mesh>
      <instancedMesh ref={drops} args={[undefined, undefined, splash.drops]}>
        <sphereGeometry args={[splash.drop, 8, 6]} />
        <meshToonMaterial color={spray} />
      </instancedMesh>
    </group>
  )
}
