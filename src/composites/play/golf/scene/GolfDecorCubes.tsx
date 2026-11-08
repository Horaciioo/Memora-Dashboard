'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { BufferGeometry, InstancedMesh } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

import { decorCubesOf } from '@/composites/play/golf/scene/decorCubes'
import type { GolfDecorCube } from '@/composites/play/golf/scene/decorCubes'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { decorCubes: look } = GOLF_SCENE

/**
 * Rounded box, centred on a spot
 * @param {[number, number, number]} size - Sides
 * @param {[number, number, number]} at - Centre
 * @return {BufferGeometry} - Box
 */

const rounded = (size: [number, number, number], at: [number, number, number]): BufferGeometry =>
  new RoundedBoxGeometry(...size, 3, look.corner * Math.min(...size)).translate(...at)

/**
 * Unit shapes: plain, chipped corner with a shifted face, holed through
 * @return {BufferGeometry[]} - One geometry per shape
 */

const unitShapes = (): BufferGeometry[] => {
  const chip = look.chip
  const rest = 1 - chip
  const frame = (1 - look.hole) / 2
  const plain = rounded([1, 1, 1], [0, 0, 0])
  const chipped = mergeGeometries([
    rounded([1, rest, 1], [0, -chip / 2, 0]),
    rounded([rest, chip, rest], [-chip / 2 + 0.04, rest / 2, chip / 2 - 0.04]),
  ])
  const holed = mergeGeometries([
    rounded([1, frame, 1], [0, (1 - frame) / 2, 0]),
    rounded([1, frame, 1], [0, -(1 - frame) / 2, 0]),
    rounded([frame, look.hole, 1], [(1 - frame) / 2, 0, 0]),
    rounded([frame, look.hole, 1], [-(1 - frame) / 2, 0, 0]),
  ])

  return [plain, chipped, holed]
}

/**
 * Every cube of one shape, one draw call
 * @param {Object} props - Shape and cubes
 * @param {BufferGeometry} props.geometry - Unit shape
 * @param {GolfDecorCube[]} props.cubes - Cubes of that shape
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

const Shape = ({
  geometry,
  cubes,
  paint,
}: {
  geometry: BufferGeometry
  cubes: GolfDecorCube[]
  paint: GolfPaint
}) => {
  const mesh = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    if (!mesh.current) return
    const holder = new Object3D()
    const tones = [paint.block, paint.side, paint.wall]
    cubes.forEach((cube, index) => {
      holder.position.set(cube.x, cube.y, cube.z)
      holder.rotation.set(0, (cube.turn * Math.PI) / 2, 0)
      holder.scale.setScalar(cube.size)
      holder.updateMatrix()
      mesh.current?.setMatrixAt(index, holder.matrix)
      mesh.current?.setColorAt(index, tones[cube.tone] ?? paint.block)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [cubes, paint])

  if (!cubes.length) return null

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, cubes.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  )
}

/**
 * Big rounded building cubes around and under the course
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {GolfHole['bounds'][]} props.taken - Other holes around
 * @return {JSX.Element}
 */

export const GolfDecorCubes = ({
  hole,
  paint,
  taken,
}: {
  hole: GolfHole
  paint: GolfPaint
  taken: GolfHole['bounds'][]
}) => {
  const shapes = useMemo(() => unitShapes(), [])
  useEffect(() => () => shapes.forEach((shape) => shape.dispose()), [shapes])
  const cubes = useMemo(() => decorCubesOf(hole, taken), [hole, taken])

  return (
    <>
      {shapes.map((geometry, shape) => (
        <Shape
          key={`${shape}-${cubes.length}`}
          geometry={geometry}
          cubes={cubes.filter((cube) => cube.shape === shape)}
          paint={paint}
        />
      ))}
    </>
  )
}
