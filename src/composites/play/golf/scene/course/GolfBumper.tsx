'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { LatheGeometry, Vector2 } from 'three'
import type { Group, MeshStandardMaterial } from 'three'

import { PlayHearts } from '@/composites/play/shared/PlayHearts'
import { avatarTexture } from '@/composites/play/golf/scene/ball/avatarTexture'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfFace } from '@/composites/play/golf/types'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { IconName } from '@/declarations/ui/icons'

const { render } = GOLF_SETTINGS
const { bumper, avatar } = GOLF_SCENE
const { skin } = bumper

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

/**
 * Turned profile, points as radius and height factors
 * @param {readonly (readonly [number, number])[]} points - Profile
 * @param {number} radius - Bumper radius
 * @param {number} height - Bumper height
 * @return {LatheGeometry} - Solid of revolution
 */

const turned = (points: readonly (readonly [number, number])[], radius: number, height: number) =>
  new LatheGeometry(
    points.map(([across, up]) => new Vector2(across * radius, up * height)),
    bumper.segments
  )

// Back-out rise, overshooting the height
const riseOf = (progress: number): number => {
  const shifted = progress - 1

  return 1 + (bumper.riseOvershoot + 1) * shifted ** 3 + bumper.riseOvershoot * shifted ** 2
}

/**
 * Lowest and highest floor under a bumper
 * @param {GolfHole} hole - Hole
 * @param {{ x: number, z: number }} spot - Centre
 * @param {number} radius - Bumper radius
 * @return {{ low: number, rise: number }} - Foot height and slope rise
 */

const footing = (hole: GolfHole, spot: { x: number; z: number }, radius: number) => {
  const { samples } = bumper.foot
  const heights = Array.from({ length: samples + 1 }, (_, index) => {
    const angle = (index / samples) * Math.PI * 2
    const reach = index === samples ? 0 : radius

    return floorHeight(hole, spot.x + Math.cos(angle) * reach, spot.z + Math.sin(angle) * reach)
  }).filter((height): height is number => height !== null)
  const low = Math.min(...heights)

  return { low, rise: Math.max(...heights) - low }
}

/**
 * Lives shown under a bumper
 * @typedef {Object} GolfBumperLives
 */

export interface GolfBumperLives {
  lives: number
  max: number
  icon?: IconName
}

export interface GolfBumperProps {
  id: string
  radius: number
  color: GolfPaint['bumper']
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
  // Course spot, none when carried by a ball
  spot?: { x: number; z: number; hole: GolfHole }
  height?: number
  // Owner pictured in the tray
  face?: GolfFace
  hearts?: GolfBumperLives
}

/**
 * Flat bumper: straight puck, bounce band, sunk tray holding the owner avatar, hearts below, rising from the ground
 * @param {GolfBumperProps} props - Bumper
 * @return {JSX.Element}
 */

export const GolfBumper = ({
  id,
  radius,
  color,
  paint,
  motionRef,
  spot,
  height = render.blockHeight,
  face,
  hearts,
}: GolfBumperProps) => {
  const body = useRef<Group>(null)
  const glows = useRef<(MeshStandardMaterial | null)[]>([])
  const bornAt = useRef<number | null>(null)
  // Foot on the lowest floor, the cap rising with the slope
  const foot = useMemo(
    () => (spot ? footing(spot.hole, spot, radius) : { low: 0, rise: 0 }),
    [spot, radius]
  )
  const total = height + foot.rise
  const isOwned = Boolean(face)
  const parts = useMemo(
    () => ({
      plate: turned(skin.plate, radius, total),
      puck: turned(isOwned ? skin.puck : skin.dome, radius, total),
    }),
    [radius, total, isOwned]
  )
  const tag = useMemo(
    () =>
      face
        ? avatarTexture({
            name: face.name,
            url: face.avatarUrl,
            color,
            shade: paint.shade,
            pixels: avatar.pixels,
            ring: avatar.ring,
          })
        : null,
    [face, color, paint.shade]
  )
  useEffect(() => () => Object.values(parts).forEach((part) => part.dispose()), [parts])
  useEffect(() => () => tag?.dispose(), [tag])

  useFrame(() => {
    const now = performance.now()
    bornAt.current ??= now
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rise = isReduced ? 1 : riseOf(Math.min(1, (now - bornAt.current) / bumper.riseMs))
    const hitAt = motionRef.current.pulses.get(id)
    const age = hitAt === undefined ? Infinity : now - hitAt
    // Fading bounce, wide then squashed
    const fade = age < bumper.pulseMs ? 1 - age / bumper.pulseMs : 0
    const bounce = fade ? Math.cos((age / bumper.pulseMs) * Math.PI * bumper.bounces) * fade : 0
    const swell = 1 + bumper.pulse * bounce
    body.current?.scale.set(
      swell,
      Math.max(1e-3, rise * (1 - bumper.pulse * bumper.squash * bounce)),
      swell
    )
    for (const glow of glows.current) if (glow) glow.emissiveIntensity = bumper.glow * fade
  })

  const floor = foot.low

  return (
    <group position={spot ? [spot.x, floor, spot.z] : [0, 0, 0]}>
      <group ref={body}>
        {spot && (
          <mesh geometry={parts.plate} receiveShadow>
            <meshStandardMaterial color={paint.obstacle} roughness={bumper.roughness} />
          </mesh>
        )}
        <mesh geometry={parts.puck} castShadow>
          <meshStandardMaterial
            ref={(material) => {
              glows.current[0] = material
            }}
            color={face ? paint.obstacle : color}
            emissive={color}
            emissiveIntensity={0}
            roughness={bumper.roughness}
          />
        </mesh>
        <mesh position={[0, skin.ring.up * total, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[skin.ring.across * radius, skin.ring.tube * radius, 12, bumper.segments]}
          />
          {/* Bounce band flashes on contact */}
          <meshStandardMaterial
            ref={(material) => {
              glows.current[2] = material
            }}
            color={color}
            emissive={color}
            emissiveIntensity={0}
            roughness={bumper.roughness}
          />
        </mesh>
        {/* Tray rim in the owner colour, avatar laid flat inside */}
        {isOwned && (
          <>
            <mesh position={[0, skin.tray.up * total, 0]} rotation={FLAT}>
              <ringGeometry
                args={[skin.tray.inner * radius, skin.tray.outer * radius, bumper.segments]}
              />
              <meshStandardMaterial color={color} roughness={bumper.roughness} />
            </mesh>
            <mesh position={[0, skin.tray.up * total - skin.tray.lift, 0]} rotation={FLAT}>
              <circleGeometry args={[skin.tray.avatar * radius, bumper.segments]} />
              {tag ? (
                <meshBasicMaterial map={tag} />
              ) : (
                <meshStandardMaterial
                  ref={(material) => {
                    glows.current[1] = material
                  }}
                  color={color}
                  emissive={color}
                  emissiveIntensity={0}
                  roughness={bumper.roughness}
                />
              )}
            </mesh>
          </>
        )}
      </group>
      {hearts && (
        <Html position={[0, -bumper.heartsDrop, 0]} center zIndexRange={[10, 0]}>
          <PlayHearts lives={hearts.lives} max={hearts.max} icon={hearts.icon} isSmall />
        </Html>
      )}
    </group>
  )
}
