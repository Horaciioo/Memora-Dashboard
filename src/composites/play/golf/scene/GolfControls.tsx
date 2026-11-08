'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Color, Group, Mesh, MeshBasicMaterial } from 'three'

import { GolfAim } from '@/composites/play/golf/scene/GolfAim'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { cancelAim } from '@/composites/play/golf/scene/pointer'
import type { GolfPointerInput } from '@/composites/play/golf/scene/pointer'
import { useGolfKeys } from '@/composites/play/golf/scene/useGolfKeys'
import { useGolfPointer } from '@/composites/play/golf/scene/useGolfPointer'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { aim, place } = GOLF_SCENE

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

export interface GolfControlsProps extends GolfPointerInput {
  hole: GolfHole
  paint: GolfPaint
  // Own ball colour
  color: Color
  lawn: RefObject<Group | null>
  // Reach of the power being placed
  placeRadius: number
  // Teleporter square half side around the own ball
  placeSquare: number | null
  // Spot allowed for the power being placed
  canPlace: (x: number, z: number) => boolean
  onOverview: () => void
  onCancel: () => void
  // Rink laid, the guide turns dark
  isFrozen: boolean
}

/**
 * Gestures of the course and what they draw: the aim arrow, the placement marker
 * @param {GolfControlsProps} props - Course and handlers
 * @return {JSX.Element}
 */

export const GolfControls = ({
  hole,
  paint,
  color,
  placeRadius,
  placeSquare,
  canPlace,
  onOverview,
  onCancel,
  isFrozen,
  ...input
}: GolfControlsProps) => {
  const pointer = useGolfPointer(input)
  const marker = useRef<Mesh>(null)
  const square = useRef<Group>(null)
  useGolfKeys(input.rigRef, {
    onOverview,
    onCancel: () => {
      cancelAim(pointer.current)
      onCancel()
    },
  })

  useFrame(() => {
    // Teleporter reach follows the own ball
    const ball = input.myId ? input.rigRef.current.spots.get(input.myId) : undefined
    if (square.current) {
      square.current.visible = placeSquare !== null && Boolean(ball)
      if (ball)
        square.current.position.set(
          ball.x,
          ball.y - GOLF_SETTINGS.physics.ballRadius + aim.lift,
          ball.z
        )
    }
    // Marker where the power would stand
    const spot = pointer.current.spot
    if (marker.current) {
      marker.current.visible = input.isPlacing && Boolean(spot)
      if (spot) {
        marker.current.position.set(spot.x, spot.y + aim.lift, spot.z)
        const isValid = canPlace(spot.x, spot.z)
        ;(marker.current.material as MeshBasicMaterial).color.copy(
          isValid ? paint.place : paint.bad
        )
      }
    }
  })

  return (
    <>
      <GolfAim
        pointer={pointer}
        rigRef={input.rigRef}
        myId={input.myId}
        hole={hole}
        paint={paint}
        color={color}
        powers={input.powers}
        isFrozen={isFrozen}
      />
      {placeSquare !== null && (
        <group ref={square} visible={false}>
          <mesh rotation={FLAT}>
            <planeGeometry args={[placeSquare * 2, placeSquare * 2]} />
            <meshBasicMaterial
              color={paint.place}
              transparent
              opacity={place.square}
              depthWrite={false}
            />
          </mesh>
          <gridHelper
            args={[placeSquare * 2, GOLF_SETTINGS.powers.teleport.cells, paint.place, paint.place]}
          />
        </group>
      )}
      <mesh ref={marker} rotation={FLAT} visible={false}>
        <ringGeometry args={[placeRadius, placeRadius + place.ring, 48]} />
        <meshBasicMaterial transparent opacity={place.opacity} depthWrite={false} />
      </mesh>
    </>
  )
}
