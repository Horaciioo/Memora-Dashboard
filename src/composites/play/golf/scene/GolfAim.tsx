'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, Shape, ShapeGeometry } from 'three'
import type { Color, Group, InstancedMesh, Mesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { aimedAngle } from '@/composites/play/golf/scene/pointer'
import type { GolfPointerState } from '@/composites/play/golf/scene/pointer'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import { aimGuide, isAimHidden, shownAngle } from '@/core/lib/play/golf'
import type { GolfHole, GolfPoint } from '@/core/lib/play/golf'
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
 * Dots laid along a polyline
 * @param {InstancedMesh} dots - Dots
 * @param {GolfPoint[]} line - Polyline
 * @param {Object} place - Placement
 * @param {number} place.height - Ground height
 * @param {number} place.skip - Metres under the arrow
 * @return {void}
 */

const layDots = (
  dots: InstancedMesh,
  line: GolfPoint[],
  { height, skip }: { height: number; skip: number }
): void => {
  const holder = new Object3D()
  holder.rotation.set(...FLAT)
  let index = 0
  let carry = skip
  for (let leg = 1; leg < line.length; leg += 1) {
    const [ax, az] = line[leg - 1]
    const [bx, bz] = line[leg]
    const length = Math.hypot(bx - ax, bz - az)
    // Even spacing across bends
    let along = carry
    for (; along < length && index < arrow.dots; along += arrow.dotGap) {
      const share = along / length
      holder.position.set(ax + (bx - ax) * share, height, az + (bz - az) * share)
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
 * Aim of a pull: stretched arm and ring behind, chevrons ahead, dotted guide to the first bounce
 * @param {Object} props - Aim
 * @param {RefObject<GolfPointerState>} props.pointer - Live pull
 * @param {RefObject<GolfRig>} props.rigRef - Ball spots
 * @param {string | null} props.myId - Own ball
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {Color} props.color - Player colour
 * @param {() => Set<GolfPowerName>} props.powers - Powers on the own ball
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
}: {
  pointer: RefObject<GolfPointerState>
  rigRef: RefObject<GolfRig>
  myId: string | null
  hole: GolfHole
  paint: GolfPaint
  color: Color
  powers: () => Set<GolfPowerName>
}) => {
  const group = useRef<Group>(null)
  const ahead = useRef<Group>(null)
  const chevrons = useRef<InstancedMesh>(null)
  const arm = useRef<Mesh>(null)
  const ring = useRef<Mesh>(null)
  const dots = useRef<InstancedMesh>(null)
  const chevron = useMemo(() => headGeometry(arrow.width, arrow.length), [])
  useEffect(() => () => chevron.dispose(), [chevron])

  useFrame(() => {
    const ball = myId ? rigRef.current.spots.get(myId) : undefined
    const { shot, grip } = pointer.current
    const held = powers()
    const isAiming = Boolean(ball && shot) && !isAimHidden(held)
    if (group.current) group.current.visible = isAiming
    if (!ball || !shot || !group.current || !ahead.current) return
    // Mirror draws the lie
    const angle = shownAngle(aimedAngle(shot, held), held)
    const ground = ball.y - physics.ballRadius + arrow.lift

    // One more chevron per step of pull
    const count = Math.max(1, Math.ceil(shot.power * arrow.chevrons))
    ahead.current.position.set(ball.x, ground, ball.z)
    ahead.current.rotation.y = angle
    if (chevrons.current) {
      const holder = new Object3D()
      holder.rotation.set(...FLAT)
      for (let index = 0; index < count; index += 1) {
        holder.position.set(0, 0, arrow.start + index * arrow.gap)
        holder.scale.setScalar(1 - (index / arrow.chevrons) * arrow.shrink)
        holder.updateMatrix()
        chevrons.current.setMatrixAt(index, holder.matrix)
      }
      chevrons.current.count = count
      chevrons.current.instanceMatrix.needsUpdate = true
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
        floor: ball.y - physics.ballRadius,
        angle,
        power: shot.power,
      })
      const skip = arrow.start + arrow.chevrons * arrow.gap
      layDots(dots.current, line, { height: ground, skip })
    }
  })

  return (
    <group ref={group} visible={false}>
      <group ref={ahead}>
        <instancedMesh
          ref={chevrons}
          args={[chevron, undefined, arrow.chevrons]}
          renderOrder={2}
          frustumCulled={false}
        >
          <meshBasicMaterial color={paint.pole} depthWrite={false} />
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
          color={paint.pole}
          transparent
          opacity={arrow.dotOpacity}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}
