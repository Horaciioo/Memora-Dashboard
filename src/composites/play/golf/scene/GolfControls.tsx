'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import type { Group, Mesh, MeshBasicMaterial } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { cancelAim } from '@/composites/play/golf/scene/pointer'
import type { GolfPointerInput } from '@/composites/play/golf/scene/pointer'
import { useGolfKeys } from '@/composites/play/golf/scene/useGolfKeys'
import { useGolfPointer } from '@/composites/play/golf/scene/useGolfPointer'
import { canPlaceAt } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { aim: reach, physics } = GOLF_SETTINGS
const { aim, place } = GOLF_SCENE

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

export interface GolfControlsProps extends GolfPointerInput {
  hole: GolfHole
  paint: GolfPaint
  lawn: RefObject<Group | null>
  // Reach of the power being placed
  placeRadius: number
  onOverview: () => void
  onCancel: () => void
}

/**
 * Gestures of the course and what they draw: the aim arrow, the ring of the own ball, the placement marker
 * @param {GolfControlsProps} props - Course and handlers
 * @return {JSX.Element}
 */

export const GolfControls = ({
  hole,
  paint,
  placeRadius,
  onOverview,
  onCancel,
  ...input
}: GolfControlsProps) => {
  const pointer = useGolfPointer(input)
  const arrow = useRef<Group>(null)
  const shaft = useRef<Mesh>(null)
  const ring = useRef<Mesh>(null)
  const marker = useRef<Mesh>(null)
  const tint = useRef(new Color())
  useGolfKeys(input.rigRef, {
    onOverview,
    onCancel: () => {
      cancelAim(pointer.current)
      onCancel()
    },
  })

  useFrame(({ clock }) => {
    const ball = input.myId ? input.rigRef.current.spots.get(input.myId) : undefined
    const shot = pointer.current.shot
    // Arrow along the pull
    if (arrow.current && shaft.current) {
      arrow.current.visible = Boolean(ball && shot)
      if (ball && shot) {
        const length = Math.max(physics.ballRadius, shot.power * reach.previewMeters)
        arrow.current.position.set(ball.x, ball.y - physics.ballRadius + aim.lift, ball.z)
        arrow.current.rotation.y = shot.angle
        shaft.current.scale.set(1, length, 1)
        shaft.current.position.z = length / 2
        tint.current.lerpColors(paint['aim-low'], paint['aim-high'], shot.power)
        ;(shaft.current.material as MeshBasicMaterial).color.copy(tint.current)
      }
    }
    // Pulsing ring when the ball can be hit
    if (ring.current) {
      ring.current.visible = Boolean(ball && !shot && input.canShoot())
      if (ball) ring.current.position.set(ball.x, ball.y - physics.ballRadius + aim.lift, ball.z)
      ring.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * aim.ringPulse) * aim.pulse)
    }
    // Marker where the power would stand
    const spot = pointer.current.spot
    if (marker.current) {
      marker.current.visible = input.isPlacing && Boolean(spot)
      if (spot) {
        marker.current.position.set(spot.x, spot.y + aim.lift, spot.z)
        const isValid = canPlaceAt(hole, spot.x, spot.z)
        ;(marker.current.material as MeshBasicMaterial).color.copy(
          isValid ? paint.place : paint.bad
        )
      }
    }
  })

  return (
    <>
      <group ref={arrow} visible={false}>
        <mesh ref={shaft} rotation={FLAT}>
          <planeGeometry args={[aim.width, 1]} />
          <meshBasicMaterial transparent depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={ring} rotation={FLAT} visible={false}>
        <ringGeometry args={[physics.ballRadius * 2, physics.ballRadius * 2 + aim.ring, 32]} />
        <meshBasicMaterial
          color={paint.pole}
          transparent
          opacity={place.opacity}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={marker} rotation={FLAT} visible={false}>
        <ringGeometry args={[placeRadius, placeRadius + place.ring, 48]} />
        <meshBasicMaterial transparent opacity={place.opacity} depthWrite={false} />
      </mesh>
    </>
  )
}
