'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'

import { wallSpecks } from '@/composites/play/golf/scene/geometry'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

/**
 * Little cubes popping out of the outer walls, one draw call
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfSpecks = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const mesh = useRef<InstancedMesh>(null)
  const specks = useMemo(() => wallSpecks(hole), [hole])

  // Place every cube once
  useLayoutEffect(() => {
    if (!mesh.current) return
    const holder = new Object3D()
    specks.forEach((speck, index) => {
      holder.position.set(speck.x, speck.y, speck.z)
      holder.rotation.set(speck.turn, speck.turn * 2, -speck.turn)
      holder.scale.setScalar(speck.size)
      holder.updateMatrix()
      mesh.current?.setMatrixAt(index, holder.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [specks])

  return (
    <instancedMesh key={specks.length} ref={mesh} args={[undefined, undefined, specks.length]}>
      <boxGeometry />
      <meshStandardMaterial color={paint.speck} roughness={GOLF_SCENE.roughness.rail} />
    </instancedMesh>
  )
}
