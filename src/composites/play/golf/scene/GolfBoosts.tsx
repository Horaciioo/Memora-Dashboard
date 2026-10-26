'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { CanvasTexture, Group, MeshBasicMaterial } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { boostChevronTexture, boostTexture } from '@/composites/play/golf/scene/textures'
import { boostId, floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion, GolfPad } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { chevron, boost } = GOLF_SCENE

// Chevron indexes, front first, the back one lights first
const CHEVRONS = [0, 1] as const

interface GolfBoostProps {
  hole: GolfHole
  pad: GolfPad
  index: number
  plate: CanvasTexture
  flashes: CanvasTexture[]
  motionRef: RefObject<GolfMotion>
}

/**
 * Boost slab decal, chevrons flashing in turn when a ball rolls on
 * @param {GolfBoostProps} props - Slab
 * @return {JSX.Element}
 */

const GolfBoost = ({ hole, pad, index, plate, flashes, motionRef }: GolfBoostProps) => {
  const body = useRef<Group>(null)
  const lights = useRef<(MeshBasicMaterial | null)[]>([])
  const [pushX, pushZ] = pad.push ?? [0, 0]
  const x = (pad.x0 + pad.x1) / 2
  const z = (pad.z0 + pad.z1) / 2
  const floor = (floorHeight(hole, x, z) ?? 0) + chevron.lift
  const size = Math.min(chevron.size, pad.x1 - pad.x0, pad.z1 - pad.z0)
  useFrame(() => {
    const hitAt = motionRef.current.pulses.get(boostId(index))
    const age = hitAt === undefined ? Infinity : performance.now() - hitAt
    const progress = Math.min(1, age / boost.pulseMs)
    const swell = Math.sin(Math.PI * progress)
    body.current?.scale.setScalar(1 + boost.pop * swell)
    body.current?.position.set(x, floor + boost.rise * swell, z)
    CHEVRONS.forEach((chevronIndex) => {
      const light = lights.current[chevronIndex]
      if (!light) return
      // Front chevron waits for the back one
      const late = age - (1 - chevronIndex) * boost.waitMs
      light.opacity = late < 0 ? 0 : Math.max(0, 1 - late / (boost.pulseMs - boost.waitMs))
    })
  })

  return (
    <group ref={body} position={[x, floor, z]} rotation={[0, Math.atan2(-pushX, -pushZ), 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={plate} transparent />
      </mesh>
      {flashes.map((flash, chevronIndex) => (
        <mesh key={chevronIndex} position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial
            ref={(material) => {
              lights.current[chevronIndex] = material
            }}
            map={flash}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Boost plate decal on each boost slab
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {RefObject<GolfMotion>} props.motionRef - Motion
 * @return {JSX.Element}
 */

export const GolfBoosts = ({
  hole,
  paint,
  motionRef,
}: {
  hole: GolfHole
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
}) => {
  const plate = useMemo(() => boostTexture(paint.obstacle, paint['obstacle-top']), [paint])
  // Chevrons flash in the card colour
  const flashes = useMemo(
    () => CHEVRONS.map((chevronIndex) => boostChevronTexture(paint.obstacle, chevronIndex)),
    [paint]
  )
  useEffect(
    () => () => {
      plate.dispose()
      flashes.forEach((flash) => flash.dispose())
    },
    [plate, flashes]
  )

  return (
    <>
      {hole.pads.map((pad, index) =>
        pad.push ? (
          <GolfBoost
            key={index}
            hole={hole}
            pad={pad}
            index={index}
            plate={plate}
            flashes={flashes}
            motionRef={motionRef}
          />
        ) : null
      )}
    </>
  )
}
