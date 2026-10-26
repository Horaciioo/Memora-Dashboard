'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { mist } = GOLF_SCENE

/**
 * Spot pushed outwards until no slab lies under it
 * @param {GolfHole} hole - Hole
 * @param {{ x: number, z: number }} center - Course centre
 * @param {number} angle - Direction from the centre
 * @param {number} distance - First distance
 * @param {number} jitterX - Sideways shift x
 * @param {number} jitterZ - Sideways shift z
 * @param {number} half - Half the cube width
 * @return {{ x: number, z: number }} - Local spot
 */

const clearOf = (
  hole: GolfHole,
  center: { x: number; z: number },
  angle: number,
  distance: number,
  jitterX: number,
  jitterZ: number,
  half: number
): { x: number; z: number } => {
  let reachOut = distance
  for (let step = 0; step < 40; step += 1) {
    const x = Math.cos(angle) * reachOut + jitterX
    const z = Math.sin(angle) * reachOut + jitterZ
    const isOver = hole.pads.some(
      (pad) =>
        center.x + x + half > pad.x0 &&
        center.x + x - half < pad.x1 &&
        center.z + z + half > pad.z0 &&
        center.z + z - half < pad.z1
    )
    if (!isOver) return { x, z }
    reachOut += half
  }

  return { x: Math.cos(angle) * reachOut, z: Math.sin(angle) * reachOut }
}

/**
 * Lumpy cube clouds around and under the course, never over a slab, one draw call
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfMist = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const mesh = useRef<InstancedMesh>(null)
  const { center, reach } = useMemo(() => overviewOf(hole), [hole])
  const count = mist.puffs * mist.cubes

  // Stack a few uneven cubes per puff
  useLayoutEffect(() => {
    if (!mesh.current) return
    const random = seededRandom(holeSeed(hole))
    const holder = new Object3D()
    for (let index = 0; index < count; index += 1) {
      const puff = Math.floor(index / mist.cubes)
      const angle = puff * mist.turn
      const distance = (reach / 2) * mist.spread * (1 + (puff % 5) / 4) * 0.5
      const size = mist.size * (mist.cubeMin + random() * (1 - mist.cubeMin))
      const jitterX = (random() - 0.5) * mist.size
      const jitterZ = (random() - 0.5) * mist.size
      const pushed = clearOf(hole, center, angle, distance, jitterX, jitterZ, size / 2)
      holder.position.set(
        pushed.x,
        (puff % 3) * mist.rise + (random() - 0.5) * mist.size * mist.flat * 0.5,
        pushed.z
      )
      holder.scale.set(size, size * mist.flat, size * (0.7 + random() * 0.3))
      holder.updateMatrix()
      mesh.current.setMatrixAt(index, holder.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [hole, center, reach, count])

  return (
    <group position={[center.x, -mist.below, center.z]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial
          color={paint.mist}
          transparent
          opacity={mist.opacity}
          depthWrite={false}
          roughness={1}
          flatShading
        />
      </instancedMesh>
    </group>
  )
}
