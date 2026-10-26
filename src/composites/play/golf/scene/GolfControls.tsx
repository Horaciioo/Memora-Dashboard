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
import { canPlaceAt } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

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
  onOverview: () => void
  onCancel: () => void
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
  onOverview,
  onCancel,
  ...input
}: GolfControlsProps) => {
  const pointer = useGolfPointer(input)
  const marker = useRef<Mesh>(null)
  useGolfKeys(input.rigRef, {
    onOverview,
    onCancel: () => {
      cancelAim(pointer.current)
      onCancel()
    },
  })

  useFrame(() => {
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
      <GolfAim
        pointer={pointer}
        rigRef={input.rigRef}
        myId={input.myId}
        hole={hole}
        paint={paint}
        color={color}
        powers={input.powers}
      />
      <mesh ref={marker} rotation={FLAT} visible={false}>
        <ringGeometry args={[placeRadius, placeRadius + place.ring, 48]} />
        <meshBasicMaterial transparent opacity={place.opacity} depthWrite={false} />
      </mesh>
    </>
  )
}
