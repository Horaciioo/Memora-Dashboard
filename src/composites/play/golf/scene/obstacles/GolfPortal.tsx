'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Object3D, Shape } from 'three'
import type { Color, Group, InstancedMesh, Mesh } from 'three'

import { FLAT } from '@/composites/play/golf/scene/obstacles/flat'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfPoint, GolfPortal as GolfPortalEntry } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { portal } = GOLF_SCENE
const RADIUS = GOLF_SETTINGS.obstacles.portalRadius

/**
 * Ring on the ground, turning, its disc pulsing
 * @param {Object} props - Ring
 * @return {JSX.Element}
 */

const Ring = ({ hole, at, color }: { hole: GolfHole; at: GolfPoint; color: Color }) => {
  const ring = useRef<Group>(null)
  const disc = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * portal.spin
    disc.current?.scale.setScalar(
      1 - portal.pulse + Math.sin(clock.elapsedTime * portal.pulseSpeed) * portal.pulse
    )
  })

  return (
    <group
      position={[at[0], (floorHeight(hole, at[0], at[1]) ?? 0) + portal.lift, at[1]]}
      rotation={FLAT}
    >
      <group ref={ring}>
        <mesh>
          <torusGeometry args={[RADIUS, portal.tube, 10, portal.segments]} />
          <meshToonMaterial color={color} />
        </mesh>
      </group>
      <mesh ref={disc}>
        <circleGeometry args={[RADIUS, portal.segments]} />
        <meshBasicMaterial color={color} transparent opacity={portal.opacity} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Arrow on the ground in front of the exit, along the heading
 * @param {Object} props - Exit
 * @return {JSX.Element}
 */

const ExitArrow = ({
  hole,
  at,
  heading,
  color,
}: {
  hole: GolfHole
  at: GolfPoint
  heading: number
  color: Color
}) => {
  const shape = useMemo(() => {
    const { length, width } = portal.arrow
    const outline = new Shape()
    outline.moveTo(0, length)
    outline.lineTo(width / 2, 0)
    outline.lineTo(width / 4, 0)
    outline.lineTo(0, length * 0.35)
    outline.lineTo(-width / 4, 0)
    outline.lineTo(-width / 2, 0)
    outline.closePath()
    return outline
  }, [])
  const reach = RADIUS + portal.arrow.gap
  const x = at[0] + Math.sin(heading) * reach
  const z = at[1] + Math.cos(heading) * reach

  return (
    <group
      position={[x, (floorHeight(hole, x, z) ?? 0) + portal.lift, z]}
      rotation={[0, heading, 0]}
    >
      {/* Shape tip turned to +z, then to the heading */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={portal.arrow.opacity}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

/**
 * Sparks arcing from the entry to the exit
 * @param {Object} props - Pair
 * @return {JSX.Element}
 */

const Sparks = ({
  hole,
  entry,
  color,
}: {
  hole: GolfHole
  entry: GolfPortalEntry
  color: Color
}) => {
  const sparks = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const [fromX, fromZ] = entry.from
  const [toX, toZ] = entry.to
  const fromY = floorHeight(hole, fromX, fromZ) ?? 0
  const toY = floorHeight(hole, toX, toZ) ?? 0
  const arc = Math.min(portal.sparks.peak, Math.hypot(toX - fromX, toZ - fromZ) * portal.sparks.arc)
  useFrame(({ clock }) => {
    if (!sparks.current) return
    for (let index = 0; index < portal.sparks.count; index += 1) {
      const t = (clock.elapsedTime / portal.sparks.trip + index / portal.sparks.count) % 1
      holder.position.set(
        fromX + (toX - fromX) * t,
        fromY + (toY - fromY) * t + Math.sin(Math.PI * t) * arc + portal.lift * 4,
        fromZ + (toZ - fromZ) * t
      )
      holder.scale.setScalar(Math.sin(Math.PI * t) * 0.6 + 0.4)
      holder.updateMatrix()
      sparks.current.setMatrixAt(index, holder.matrix)
    }
    sparks.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={sparks} args={[undefined, undefined, portal.sparks.count]}>
      <sphereGeometry args={[portal.sparks.size, 8, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </instancedMesh>
  )
}

/**
 * Two rings of one colour, sparks from one to the other, exit arrow when the exit sets the heading
 * @param {Object} props - Pair and colour
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPortalEntry} props.entry - Pair
 * @param {Color} props.color - Pair colour
 * @return {JSX.Element}
 */

export const GolfPortal = ({
  hole,
  entry,
  color,
}: {
  hole: GolfHole
  entry: GolfPortalEntry
  color: Color
}) => (
  <group>
    <Ring hole={hole} at={entry.from} color={color} />
    <Ring hole={hole} at={entry.to} color={color} />
    <Sparks hole={hole} entry={entry} color={color} />
    {entry.heading !== null && (
      <ExitArrow hole={hole} at={entry.to} heading={entry.heading} color={color} />
    )}
  </group>
)
