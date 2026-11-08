'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Shape, ShapeGeometry } from 'three'
import type { Group } from 'three'

import { patchTexture, sandTexture } from '@/composites/play/golf/scene/textures'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { GolfIce, iceSurfaces } from '@/composites/play/golf/scene/GolfIce'
import { GolfCupPoints } from '@/composites/play/golf/scene/GolfCupPoints'
import { GolfWater } from '@/composites/play/golf/scene/GolfWater'
import { groundPatch } from '@/composites/play/golf/scene/grid'
import { courseGeometry } from '@/composites/play/golf/scene/geometry'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfCup as GolfCupSpot, GolfHazard, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfSurfaces } from '@/utils/constants/play'
import type { GolfSurfaceName } from '@/utils/constants/play'

const { render } = GOLF_SETTINGS
const { cup, pole, flag, glass } = GOLF_SCENE

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

const GolfCup = ({ spot, paint }: { spot: GolfCupSpot; paint: GolfPaint }) => {
  const banner = useRef<Group>(null)
  // Triangle pennant off the pole
  const pennant = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(0, flag.height / 2)
    shape.lineTo(flag.width, 0)
    shape.lineTo(0, -flag.height / 2)
    shape.closePath()
    return new ShapeGeometry(shape)
  }, [])
  useEffect(() => () => pennant.dispose(), [pennant])
  useFrame(({ clock }) => {
    if (banner.current) {
      banner.current.rotation.y = Math.sin(clock.elapsedTime * flag.swaySpeed) * flag.sway
    }
  })

  return (
    <group position={[spot.x, spot.floor, spot.z]}>
      {/* Pole stands on the pit floor */}
      <mesh position={[0, (render.flagHeight - GOLF_SETTINGS.cup.depth) / 2, 0]} castShadow>
        <cylinderGeometry
          args={[
            pole.radius,
            pole.radius,
            render.flagHeight + GOLF_SETTINGS.cup.depth,
            pole.segments,
          ]}
        />
        <meshToonMaterial color={paint.pole} />
      </mesh>
      <group ref={banner} position={[0, render.flagHeight - flag.drop, 0]}>
        <mesh geometry={pennant} castShadow>
          <meshToonMaterial color={paint.flag} side={DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, render.flagHeight, 0]}>
        <sphereGeometry args={[flag.knob, 12, 8]} />
        <meshToonMaterial color={paint.flag} />
      </mesh>
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
 * Floating course of one hole: lawn, slab sides, rails, tilted boxes, cup
 * @param {GolfCourseProps} props - Hole and colours
 * @return {JSX.Element}
 */

export const GolfCourse = ({ hole, paint, lawnRef, ice, serverNow }: GolfCourseProps) => {
  const geometry = useMemo(() => courseGeometry(hole), [hole])
  // Everything the rink covers: every dry slab, rail tops and block tops
  const iceTops = useMemo(() => iceSurfaces(geometry), [geometry])
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
      geometry.glass.dispose()
      geometry.cushions.dispose()
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
                onBeforeCompile={groundPatch}
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
      <mesh geometry={geometry.glass}>
        <meshToonMaterial
          color={paint.wall}
          transparent
          opacity={glass.opacity}
          side={DoubleSide}
        />
      </mesh>
      <mesh geometry={geometry.cushions} castShadow receiveShadow>
        <meshToonMaterial color={paint.bumper} side={DoubleSide} />
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
      {hole.cups.map((spot) => (
        <GolfCup key={`${spot.x}:${spot.z}`} spot={spot} paint={paint} />
      ))}
      {hole.isScoring &&
        hole.cups.map((spot) => (
          <GolfCupPoints key={`${spot.x}:${spot.z}`} spot={spot} paint={paint} />
        ))}
    </group>
  )
}
