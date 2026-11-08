'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { DoubleSide, Matrix4, Quaternion, Vector3 } from 'three'
import type { InstancedMesh } from 'three'

import { railCaps } from '@/composites/play/golf/scene/obstacles/edges'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { rail } = GOLF_SCENE
const RADIUS = GOLF_SETTINGS.render.railWidth / 2
const UP = new Vector3(0, 1, 0)

/**
 * Rounded tops of the rails, one instanced tube and one instanced knob mesh per hole
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfRailCaps = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const tubes = useRef<InstancedMesh>(null)
  const knobs = useRef<InstancedMesh>(null)
  const caps = useMemo(() => railCaps(hole), [hole])
  const spots = useMemo(() => caps.flatMap((cap) => cap.knobs), [caps])
  const tone = useMemo(() => paint.wall.clone().lerp(paint.cloud, rail.cap), [paint])

  useLayoutEffect(() => {
    const matrix = new Matrix4()
    const turn = new Quaternion()
    caps.forEach(({ a, b }, index) => {
      const from = new Vector3(...a)
      const span = new Vector3(...b).sub(from)
      turn.setFromUnitVectors(UP, span.clone().normalize())
      matrix.compose(from.addScaledVector(span, 0.5), turn, new Vector3(1, span.length(), 1))
      tubes.current?.setMatrixAt(index, matrix)
    })
    spots.forEach((spot, index) => {
      knobs.current?.setMatrixAt(index, matrix.makeTranslation(...spot))
    })
    if (tubes.current) tubes.current.instanceMatrix.needsUpdate = true
    if (knobs.current) knobs.current.instanceMatrix.needsUpdate = true
  }, [caps, spots])

  return (
    <>
      <instancedMesh
        key={`tubes-${caps.length}`}
        ref={tubes}
        args={[undefined, undefined, caps.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[RADIUS, RADIUS, 1, rail.segments, 1, true]} />
        <meshToonMaterial color={tone} side={DoubleSide} />
      </instancedMesh>
      <instancedMesh
        key={`knobs-${spots.length}`}
        ref={knobs}
        args={[undefined, undefined, spots.length]}
        castShadow
      >
        <sphereGeometry args={[RADIUS, rail.segments, rail.segments / 2]} />
        <meshToonMaterial color={tone} />
      </instancedMesh>
    </>
  )
}
