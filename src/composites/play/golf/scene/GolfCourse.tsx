'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type { Group, Mesh } from 'three'

import { courseGeometry } from '@/composites/play/golf/scene/geometry'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'
import type { GolfSurfaceName } from '@/utils/constants/play'

const { physics, render } = GOLF_SETTINGS
const { cup, pole, flag, chevron, water, roughness } = GOLF_SCENE

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

// Surfaces that are not lawn
const SURFACE_PAINT: Partial<Record<GolfSurfaceName, keyof GolfPaint>> = {
  [GolfSurfaces.Sand]: 'sand',
  [GolfSurfaces.Ice]: 'ice',
  [GolfSurfaces.Boost]: 'boost',
  [GolfSurfaces.Water]: 'water',
}

/**
 * Cup, rim and waving flag
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

const GolfCup = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const banner = useRef<Mesh>(null)
  const floor = floorHeight(hole, hole.cup[0], hole.cup[1]) ?? 0
  useFrame(({ clock }) => {
    if (banner.current) {
      banner.current.rotation.y = Math.sin(clock.elapsedTime * flag.swaySpeed) * flag.sway
    }
  })

  return (
    <group position={[hole.cup[0], floor, hole.cup[1]]}>
      <mesh position={[0, cup.lift, 0]} rotation={FLAT}>
        <circleGeometry args={[physics.cupRadius, cup.segments]} />
        <meshBasicMaterial color={paint.cup} />
      </mesh>
      <mesh position={[0, cup.lift * 1.5, 0]} rotation={FLAT}>
        <ringGeometry args={[physics.cupRadius, physics.cupRadius * cup.rim, cup.segments]} />
        <meshStandardMaterial color={paint.pole} />
      </mesh>
      <mesh position={[0, render.flagHeight / 2, 0]}>
        <cylinderGeometry args={[pole.radius, pole.radius, render.flagHeight, pole.segments]} />
        <meshStandardMaterial color={paint.pole} />
      </mesh>
      <group ref={banner} position={[0, render.flagHeight - flag.drop, 0]}>
        <mesh position={[flag.width / 2, 0, 0]}>
          <planeGeometry args={[flag.width, flag.height]} />
          <meshStandardMaterial color={paint.flag} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Chevrons pointing the way on boost slabs
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

const GolfBoosts = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => (
  <>
    {hole.pads.flatMap((pad, padIndex) => {
      if (!pad.push) return []
      const [px, pz] = pad.push
      const x = (pad.x0 + pad.x1) / 2
      const z = (pad.z0 + pad.z1) / 2

      return [-1, 0, 1].map((step) => (
        <mesh
          key={`${padIndex}:${step}`}
          position={[
            x + px * step,
            (floorHeight(hole, x + px * step, z + pz * step) ?? 0) + chevron.lift,
            z + pz * step,
          ]}
          rotation={[-Math.PI / 2, 0, Math.atan2(-pz, px)]}
        >
          <circleGeometry args={[chevron.radius, 3]} />
          <meshBasicMaterial color={paint.pole} transparent opacity={chevron.opacity} />
        </mesh>
      ))
    })}
  </>
)

export interface GolfCourseProps {
  hole: GolfHole
  paint: GolfPaint
  // Lawn group, aimed at by placements
  lawnRef: Ref<Group>
}

/**
 * Floating course of one hole: lawn, slab sides, rails, boxes, cup
 * @param {GolfCourseProps} props - Hole and colours
 * @return {JSX.Element}
 */

export const GolfCourse = ({ hole, paint, lawnRef }: GolfCourseProps) => {
  const geometry = useMemo(() => courseGeometry(hole), [hole])

  // GPU memory freed with the hole
  useEffect(
    () => () => {
      for (const top of geometry.tops) top.geometry.dispose()
      geometry.sides.dispose()
      geometry.rails.dispose()
      geometry.blocks.dispose()
    },
    [geometry]
  )

  return (
    <group>
      <group ref={lawnRef}>
        {geometry.tops.map(({ surface, geometry: top }) => {
          const tint = SURFACE_PAINT[surface]
          const isWater = surface === GolfSurfaces.Water

          return (
            <mesh key={surface} geometry={top} position={[0, isWater ? -water.sink : 0, 0]}>
              {tint ? (
                <meshStandardMaterial
                  color={paint[tint]}
                  side={DoubleSide}
                  transparent={isWater}
                  opacity={isWater ? water.opacity : 1}
                  roughness={surface === GolfSurfaces.Ice ? roughness.ice : roughness.surface}
                />
              ) : (
                <meshStandardMaterial
                  color={paint.turf}
                  side={DoubleSide}
                  roughness={roughness.turf}
                />
              )}
            </mesh>
          )
        })}
      </group>
      <mesh geometry={geometry.sides}>
        <meshStandardMaterial color={paint.side} side={DoubleSide} roughness={roughness.side} />
      </mesh>
      <mesh geometry={geometry.rails}>
        <meshStandardMaterial color={paint.rail} side={DoubleSide} roughness={roughness.rail} />
      </mesh>
      <mesh geometry={geometry.blocks}>
        <meshStandardMaterial color={paint.block} side={DoubleSide} roughness={roughness.block} />
      </mesh>
      <GolfCup hole={hole} paint={paint} />
      <GolfBoosts hole={hole} paint={paint} />
    </group>
  )
}
