'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'

import { wallSpecks } from '@/composites/play/golf/scene/geometry'
import { fadeTexture } from '@/composites/play/golf/scene/textures'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfHole } from '@/core/lib/play/golf'

/**
 * Columns hanging down the outer walls, fading out, one draw call
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfSpecks = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const mesh = useRef<InstancedMesh>(null)
  const specks = useMemo(() => wallSpecks(hole), [hole])
  const fade = useMemo(() => fadeTexture(), [])
  useEffect(() => () => fade.dispose(), [fade])

  // Place every cube once
  useLayoutEffect(() => {
    if (!mesh.current) return
    const holder = new Object3D()
    specks.forEach((speck, index) => {
      holder.position.set(speck.x, speck.y, speck.z)
      holder.scale.set(speck.size, speck.drop, speck.size)
      holder.updateMatrix()
      mesh.current?.setMatrixAt(index, holder.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [specks])

  return (
    <instancedMesh key={specks.length} ref={mesh} args={[undefined, undefined, specks.length]}>
      <boxGeometry />
      <meshToonMaterial color={paint.speck} alphaMap={fade} transparent depthWrite={false} />
    </instancedMesh>
  )
}
