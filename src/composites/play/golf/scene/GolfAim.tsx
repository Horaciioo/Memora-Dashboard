'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, Shape, ShapeGeometry } from 'three'
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
 * Dots laid along a polyline, each on the ground under it
 * @param {InstancedMesh} dots - Dots
 * @param {GolfPoint[]} line - Polyline
 * @param {Object} place - Placement
 * @param {GolfPad[]} place.pads - Slabs
 * @param {number} place.floor - Ground under the ball
 * @param {number} place.skip - Metres under the arrow
 * @return {void}
 */

const layDots = (
  dots: InstancedMesh,
  line: GolfPoint[],
  { pads, floor, skip }: { pads: GolfPad[]; floor: number; skip: number }
): void => {
  const holder = new Object3D()
  holder.rotation.set(...FLAT)
  let index = 0
  let carry = skip
  // Climbs ramps from the ball
  let level = floor
  for (let leg = 1; leg < line.length; leg += 1) {
    const [ax, az] = line[leg - 1]
    const [bx, bz] = line[leg]
    const length = Math.hypot(bx - ax, bz - az)
    // Even spacing across bends
    let along = carry
    for (; along < length && index < arrow.dots; along += arrow.dotGap) {
      const share = along / length
      const x = ax + (bx - ax) * share
      const z = az + (bz - az) * share
      level = groundFrom(pads, x, z, level)
      holder.position.set(x, level + arrow.lift, z)
      holder.scale.setScalar(1 - (index / arrow.dots) * arrow.dotFade)
      holder.updateMatrix()
      dots.setMatrixAt(index, holder.matrix)
      index += 1
    }
    carry = along - length
  }
  dots.count = index
  dots.instanceMatrix.needsUpdate = true
}

/**
 * Hides the first dots of a guide, wiped by the pencil
 * @param {InstancedMesh} dots - Dots
 * @param {number} count - Dots hidden
 * @return {void}
 */

const hideFirst = (dots: InstancedMesh, count: number): void => {
  if (count <= 0) return
  const holder = new Object3D()
  holder.scale.setScalar(0)
  holder.updateMatrix()
  for (let index = 0; index < Math.min(count, dots.count); index += 1) {
    dots.setMatrixAt(index, holder.matrix)
  }
  dots.instanceMatrix.needsUpdate = true
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
  const dots = useRef<InstancedMesh>(null)
  const pencil = useRef<Group>(null)
  const clock = useRef<GolfPowerClock>(new Map())
  const isFirst = useRef(true)
  const chevron = useMemo(() => headGeometry(arrow.width, arrow.length), [])
  useEffect(() => () => chevron.dispose(), [chevron])

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
      holder.rotation.set(...FLAT)
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
    if (dots.current) {
      const line = aimGuide(hole, {
        from: [ball.x, ball.z],
        floor,
        angle,
        power: shot.power,
      })
      const skip = arrow.start + arrow.chevrons * arrow.gap
      layDots(dots.current, line, { pads: hole.pads, floor, skip })
      hideFirst(dots.current, Math.ceil(erased * dots.current.count))
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
      <instancedMesh ref={dots} args={[undefined, undefined, arrow.dots]}>
        <circleGeometry args={[arrow.dot, 12]} />
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
