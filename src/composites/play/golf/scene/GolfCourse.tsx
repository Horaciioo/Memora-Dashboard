'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type { Group, Mesh } from 'three'

import { patchTexture, sandTexture } from '@/composites/play/golf/scene/textures'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { GolfIce } from '@/composites/play/golf/scene/GolfIce'
import { GolfWater } from '@/composites/play/golf/scene/GolfWater'
import { courseGeometry } from '@/composites/play/golf/scene/geometry'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'
import type { GolfSurfaceName } from '@/utils/constants/play'

const { render } = GOLF_SETTINGS
const { cup, pole, flag, sink } = GOLF_SCENE

// Surfaces that are not lawn
const SURFACE_PAINT: Partial<Record<GolfSurfaceName, keyof GolfPaint>> = {
  [GolfSurfaces.Sand]: 'sand',
  [GolfSurfaces.Ice]: 'ice',
  [GolfSurfaces.Boost]: 'boost',
}

/**
 * Waving flag of the cup
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
      {/* Pole stands on the pit floor */}
      <mesh position={[0, (render.flagHeight - sink.depth) / 2, 0]} castShadow>
        <cylinderGeometry
          args={[pole.radius, pole.radius, render.flagHeight + sink.depth, pole.segments]}
        />
        <meshToonMaterial color={paint.pole} />
      </mesh>
      <group ref={banner} position={[0, render.flagHeight - flag.drop, 0]}>
        <mesh position={[flag.width / 2, 0, 0]} castShadow>
          <planeGeometry args={[flag.width, flag.height]} />
          <meshToonMaterial color={paint.flag} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

export interface GolfCourseProps {
  hole: GolfHole
  paint: GolfPaint
  // Lawn group, aimed at by placements
  lawnRef: Ref<Group>
  // Ice laid over the played hole, with the server clock
  ice?: GolfHazard | null
  serverNow?: () => number
}

/**
 * Floating course of one hole: lawn, slab sides, rails, boxes, cup
 * @param {GolfCourseProps} props - Hole and colours
 * @return {JSX.Element}
 */

export const GolfCourse = ({ hole, paint, lawnRef, ice, serverNow }: GolfCourseProps) => {
  const geometry = useMemo(() => courseGeometry(hole), [hole])
  // Floors the ice can cover
  const iceTops = useMemo(
    () =>
      geometry.tops
        .filter(({ surface }) => surface !== GolfSurfaces.Water)
        .map(({ geometry }) => geometry),
    [geometry]
  )
  // Cubic colour patches of the walls
  const patches = useMemo(() => patchTexture(seededRandom(holeSeed(hole))), [hole])
  useEffect(() => () => patches.dispose(), [patches])
  // Grain of the sand
  const grain = useMemo(() => sandTexture(seededRandom(holeSeed(hole))), [hole])
  useEffect(() => () => grain.dispose(), [grain])
  // Funnel and wall, the lawn in shade
  const shades = useMemo(
    () => ({
      funnel: paint.turf.clone().lerp(paint.shade, cup.shade.funnel),
      wall: paint.turf.clone().lerp(paint.shade, cup.shade.wall),
    }),
    [paint]
  )

  // GPU memory freed with the hole
  useEffect(
    () => () => {
      for (const top of geometry.tops) top.geometry.dispose()
      geometry.sides.dispose()
      geometry.underside.dispose()
      geometry.rails.dispose()
      geometry.railSides.dispose()
      geometry.blocks.dispose()
      geometry.blockTops.dispose()
      geometry.pit?.funnel.dispose()
      geometry.pit?.wall.dispose()
      geometry.pit?.floor.dispose()
    },
    [geometry]
  )

  return (
    <group>
      <group ref={lawnRef}>
        {geometry.tops.map(({ surface, geometry: top }) => {
          if (surface === GolfSurfaces.Water)
            return <GolfWater key={surface} geometry={top} paint={paint} />
          const tint = SURFACE_PAINT[surface]

          return (
            <mesh key={surface} geometry={top} receiveShadow>
              <meshToonMaterial
                color={tint ? paint[tint] : paint.turf}
                map={surface === GolfSurfaces.Sand ? grain : null}
                side={DoubleSide}
              />
            </mesh>
          )
        })}
      </group>
      {ice && serverNow && (
        <GolfIce hole={hole} paint={paint} tops={iceTops} hazard={ice} serverNow={serverNow} />
      )}
      <mesh geometry={geometry.sides} receiveShadow>
        <meshToonMaterial color={paint.side} map={patches} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry.underside}>
        <meshToonMaterial color={paint.side} map={patches} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry.railSides} castShadow receiveShadow>
        <meshToonMaterial color={paint.side} map={patches} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry.rails} castShadow receiveShadow>
        <meshToonMaterial color={paint.wall} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry.blocks} castShadow receiveShadow>
        <meshToonMaterial color={paint.obstacle} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry.blockTops} receiveShadow>
        <meshToonMaterial color={paint['obstacle-top']} side={DoubleSide} />
      </mesh>
      {geometry.pit && (
        <>
          <mesh geometry={geometry.pit.funnel} receiveShadow>
            <meshToonMaterial color={shades.funnel} side={DoubleSide} />
          </mesh>
          <mesh geometry={geometry.pit.wall} receiveShadow>
            <meshToonMaterial color={shades.wall} side={DoubleSide} />
          </mesh>
          <mesh geometry={geometry.pit.floor}>
            <meshBasicMaterial color={paint.cup} side={DoubleSide} />
          </mesh>
        </>
      )}
      <GolfCup hole={hole} paint={paint} />
    </group>
  )
}
