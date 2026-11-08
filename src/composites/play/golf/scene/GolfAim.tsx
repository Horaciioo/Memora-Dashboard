'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { CircleGeometry, Object3D, RingGeometry, Shape, ShapeGeometry } from 'three'
import type { Color, Group, InstancedMesh, Mesh } from 'three'

import { aimErased } from '@/composites/play/golf/scene/fx/aimErase'
import type { GolfPowerClock } from '@/composites/play/golf/scene/fx/stage'
import { GolfPencil } from '@/composites/play/golf/scene/fx/GolfPencil'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { aimedAngle } from '@/composites/play/golf/scene/pointer'
import type { GolfPointerState } from '@/composites/play/golf/scene/pointer'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import { aimGuide, groundFrom } from '@/core/lib/play/golf'
import type { GolfHole, GolfPad, GolfPoint } from '@/core/lib/play/golf'
import type { GolfPowerName } from '@/utils/constants/play'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { physics } = GOLF_SETTINGS
const { arrow } = GOLF_SCENE

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

/**
 * Chevron, tip toward +z once laid flat
 * @param {number} width - Half width
 * @param {number} length - Length
 * @return {ShapeGeometry} - Triangle
 */

const headGeometry = (width: number, length: number): ShapeGeometry => {
  const shape = new Shape()
  shape.moveTo(-width, 0)
  shape.lineTo(width, 0)
  shape.lineTo(0, -length)
  shape.closePath()

  return new ShapeGeometry(shape)
}

/**
 * Pitch of the ground along a heading, to lay a mark flat on a slope
 * @param {GolfPad[]} pads - Slabs
 * @param {GolfPoint} at - Spot
 * @param {number} heading - Angle, zero toward +z
 * @param {number} level - Ground level under the ball
 * @return {number} - Radians, up when the ground climbs
 */

const pitchAt = (pads: GolfPad[], [x, z]: GolfPoint, heading: number, level: number): number => {
  const step = arrow.slopeStep
  const ahead = groundFrom(pads, x + Math.sin(heading) * step, z + Math.cos(heading) * step, level)
  const behind = groundFrom(pads, x - Math.sin(heading) * step, z - Math.cos(heading) * step, level)

  return Math.atan2(ahead - behind, step * 2)
}

/**
 * Dots laid along a polyline, each on the ground under it
 * @param {InstancedMesh[]} dots - Frame and core of each mark
 * @param {GolfPoint[]} line - Polyline
 * @param {Object} place - Placement
 * @param {GolfPad[]} place.pads - Slabs
 * @param {number} place.floor - Ground under the ball
 * @param {number} place.skip - Metres under the arrow
 * @return {void}
 */

const layDots = (
  dots: InstancedMesh[],
  line: GolfPoint[],
  { pads, floor, skip }: { pads: GolfPad[]; floor: number; skip: number }
): void => {
  const holder = new Object3D()
  holder.rotation.order = 'YXZ'
  let index = 0
  let carry = skip
  // Climbs ramps from the ball
  let level = floor
  for (let leg = 1; leg < line.length; leg += 1) {
    const [ax, az] = line[leg - 1]
    const [bx, bz] = line[leg]
    const length = Math.hypot(bx - ax, bz - az)
    const heading = Math.atan2(bx - ax, bz - az)
    // Even spacing across bends
    let along = carry
    for (; along < length && index < arrow.dots; along += arrow.dotGap) {
      const share = along / length
      const x = ax + (bx - ax) * share
      const z = az + (bz - az) * share
      level = groundFrom(pads, x, z, level)
      holder.position.set(x, level + arrow.lift, z)
      holder.rotation.set(-Math.PI / 2 - pitchAt(pads, [x, z], heading, level), heading, 0)
      holder.scale.setScalar(1 - (index / arrow.dots) * arrow.dotFade)
      holder.updateMatrix()
      for (const mesh of dots) mesh.setMatrixAt(index, holder.matrix)
      index += 1
    }
    carry = along - length
  }
  for (const mesh of dots) {
    mesh.count = index
    mesh.instanceMatrix.needsUpdate = true
  }
}

/**
 * Hides the first dots of a guide, wiped by the pencil
 * @param {InstancedMesh[]} dots - Frame and core of each mark
 * @param {number} count - Dots hidden
 * @return {void}
 */

const hideFirst = (dots: InstancedMesh[], count: number): void => {
  if (count <= 0) return
  const holder = new Object3D()
  holder.scale.setScalar(0)
  holder.updateMatrix()
  for (const mesh of dots) {
    for (let index = 0; index < Math.min(count, mesh.count); index += 1) {
      mesh.setMatrixAt(index, holder.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }
}

/**
 * Aim of a pull
 * @param {Object} props - Aim
 * @param {RefObject<GolfPointerState>} props.pointer - Live pull
 * @param {RefObject<GolfRig>} props.rigRef - Ball spots
 * @param {string | null} props.myId - Own ball
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {Color} props.color - Player colour
 * @param {() => Set<GolfPowerName>} props.powers - Powers on the own ball
 * @param {boolean} props.isFrozen - Rink laid, guide turns dark
 * @return {JSX.Element}
 */

export const GolfAim = ({
  pointer,
  rigRef,
  myId,
  hole,
  paint,
  color,
  powers,
  isFrozen,
}: {
  pointer: RefObject<GolfPointerState>
  rigRef: RefObject<GolfRig>
  myId: string | null
  hole: GolfHole
  paint: GolfPaint
  color: Color
  powers: () => Set<GolfPowerName>
  isFrozen: boolean
}) => {
  const group = useRef<Group>(null)
  const ahead = useRef<Group>(null)
  const chevrons = useRef<InstancedMesh>(null)
  const arm = useRef<Mesh>(null)
  const ring = useRef<Mesh>(null)
  const frames = useRef<InstancedMesh>(null)
  const cores = useRef<InstancedMesh>(null)
  const pencil = useRef<Group>(null)
  const clock = useRef<GolfPowerClock>(new Map())
  const isFirst = useRef(true)
  const chevron = useMemo(() => headGeometry(arrow.width, arrow.length), [])
  // Square frame round a solid square core
  const frame = useMemo(
    () => new RingGeometry(arrow.dot * arrow.frameHole, arrow.dot, 4, 1, Math.PI / 4),
    []
  )
  const core = useMemo(() => new CircleGeometry(arrow.dot * arrow.core, 4, Math.PI / 4), [])
  useEffect(
    () => () => {
      chevron.dispose()
      frame.dispose()
      core.dispose()
    },
    [chevron, frame, core]
  )

  useFrame(() => {
    const ball = myId ? rigRef.current.spots.get(myId) : undefined
    const { shot, grip } = pointer.current
    const held = powers()
    // Blind aim wiped by the pencil, drawn back once over
    const erased = aimErased(clock.current, held, isFirst.current)
    isFirst.current = false
    const isAiming = Boolean(ball && shot) && erased < 1
    if (group.current) group.current.visible = isAiming
    if (!ball || !shot || !group.current || !ahead.current) return
    // Arrow tells the truth, the ball follows it
    const angle = aimedAngle(shot, held)
    const floor = ball.y - physics.ballRadius
    const ground = floor + arrow.lift

    // One more chevron per step of pull
    const count = Math.max(1, Math.ceil(shot.power * arrow.chevrons))
    ahead.current.position.set(ball.x, ground, ball.z)
    ahead.current.rotation.y = angle
    if (chevrons.current) {
      const holder = new Object3D()
      let level = floor
      for (let index = 0; index < count; index += 1) {
        // Each chevron rests on the ground ahead, ramps included
        const reach = arrow.start + index * arrow.gap
        level = groundFrom(
          hole.pads,
          ball.x + Math.sin(angle) * reach,
          ball.z + Math.cos(angle) * reach,
          level
        )
        holder.position.set(0, level - floor, reach)
        // Lies on the slope ahead, never sunk in it
        const spot: GolfPoint = [ball.x + Math.sin(angle) * reach, ball.z + Math.cos(angle) * reach]
        holder.rotation.set(-Math.PI / 2 - pitchAt(hole.pads, spot, angle, level), 0, 0)
        holder.scale.setScalar(1 - (index / arrow.chevrons) * arrow.shrink)
        holder.updateMatrix()
        chevrons.current.setMatrixAt(index, holder.matrix)
      }
      // Wiped from the ball outward
      const kept = Math.ceil(erased * count)
      holder.scale.setScalar(0)
      holder.updateMatrix()
      for (let index = 0; index < kept; index += 1)
        chevrons.current.setMatrixAt(index, holder.matrix)
      chevrons.current.count = count
      chevrons.current.instanceMatrix.needsUpdate = true
    }
    if (pencil.current) {
      const reach = erased * (arrow.start + (count + arrow.dots) * arrow.gap)
      pencil.current.visible = erased > 0
      pencil.current.position.set(0, 0, reach)
    }

    // Arm stretched to the finger, ring under it
    if (arm.current && ring.current && grip) {
      const dx = grip.x - ball.x
      const dz = grip.z - ball.z
      const reach = Math.hypot(dx, dz)
      arm.current.position.set(
        (ball.x + grip.x) / 2,
        ground + arrow.armHeight / 2,
        (ball.z + grip.z) / 2
      )
      arm.current.rotation.set(0, Math.atan2(dx, dz), 0)
      arm.current.scale.set(1, 1, Math.max(reach - arrow.ring, 0))
      ring.current.position.set(grip.x, ground + arrow.armHeight, grip.z)
    }

    // Guide to the first bounce
    if (frames.current && cores.current) {
      const line = aimGuide(hole, {
        from: [ball.x, ball.z],
        floor,
        angle,
        power: shot.power,
      })
      const skip = arrow.start + arrow.chevrons * arrow.gap
      const marks = [frames.current, cores.current]
      layDots(marks, line, { pads: hole.pads, floor, skip })
      hideFirst(marks, Math.ceil(erased * cores.current.count))
    }
  })

  return (
    <group ref={group} visible={false}>
      <group ref={ahead}>
        <group ref={pencil} visible={false}>
          <GolfPencil paint={paint} />
        </group>
        <instancedMesh
          ref={chevrons}
          args={[chevron, undefined, arrow.chevrons]}
          renderOrder={2}
          frustumCulled={false}
        >
          <meshBasicMaterial
            color={isFrozen ? paint['trail-frozen'] : paint.pole}
            depthWrite={false}
          />
        </instancedMesh>
      </group>
      <mesh ref={arm} castShadow>
        <boxGeometry args={[arrow.arm, arrow.armHeight, 1]} />
        <meshToonMaterial color={color} />
      </mesh>
      <mesh ref={ring} rotation={FLAT} castShadow>
        <torusGeometry
          args={[(arrow.ring + arrow.ringHole) / 2, (arrow.ring - arrow.ringHole) / 2, 8, 24]}
        />
        <meshToonMaterial color={color} />
      </mesh>
      <instancedMesh ref={frames} args={[frame, undefined, arrow.dots]} frustumCulled={false}>
        <meshBasicMaterial
          color={isFrozen ? paint['trail-frozen'] : paint.pole}
          transparent
          opacity={arrow.frameOpacity}
          depthWrite={false}
        />
      </instancedMesh>
      <instancedMesh ref={cores} args={[core, undefined, arrow.dots]} frustumCulled={false}>
        <meshBasicMaterial
          color={isFrozen ? paint['trail-frozen'] : paint.pole}
          transparent
          opacity={arrow.dotOpacity}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}
