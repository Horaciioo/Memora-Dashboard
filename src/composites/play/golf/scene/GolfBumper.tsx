'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { LatheGeometry, Vector2 } from 'three'
import type { Group, MeshStandardMaterial } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { render } = GOLF_SETTINGS
const { bumper } = GOLF_SCENE
const { skin } = bumper

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

export interface GolfBumperProps {
  id: string
  x: number
  z: number
  radius: number
  color: GolfPaint['bumper']
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
  hole: GolfHole
}

/**
 * Puck bumper on a plate, ring round its cap, bouncing and glowing when hit
 * @param {GolfBumperProps} props - Bumper
 * @return {JSX.Element}
 */

export const GolfBumper = ({
  id,
  x,
  z,
  radius,
  color,
  paint,
  motionRef,
  hole,
}: GolfBumperProps) => {
  const body = useRef<Group>(null)
  const glows = useRef<(MeshStandardMaterial | null)[]>([])
  const height = render.blockHeight
  const parts = useMemo(
    () => ({
      plate: turned(skin.plate, radius, height),
      puck: turned(skin.puck, radius, height),
      cap: turned(skin.cap, radius, height),
    }),
    [radius, height]
  )
  useEffect(() => () => Object.values(parts).forEach((part) => part.dispose()), [parts])
  useFrame(() => {
    const hitAt = motionRef.current.pulses.get(id)
    const age = hitAt === undefined ? Infinity : performance.now() - hitAt
    // Fading bounce, wide then squashed
    const fade = age < bumper.pulseMs ? 1 - age / bumper.pulseMs : 0
    const bounce = fade ? Math.cos((age / bumper.pulseMs) * Math.PI * bumper.bounces) * fade : 0
    const swell = 1 + bumper.pulse * bounce
    body.current?.scale.set(swell, 1 - bumper.pulse * bumper.squash * bounce, swell)
    for (const glow of glows.current) if (glow) glow.emissiveIntensity = bumper.glow * fade
  })

  return (
    <group ref={body} position={[x, floorHeight(hole, x, z) ?? 0, z]}>
      <mesh geometry={parts.plate} receiveShadow>
        <meshStandardMaterial color={paint.obstacle} roughness={bumper.roughness} />
      </mesh>
      <mesh geometry={parts.puck} castShadow>
        <meshStandardMaterial
          ref={(material) => {
            glows.current[0] = material
          }}
          color={color}
          emissive={color}
          emissiveIntensity={0}
          roughness={bumper.roughness}
        />
      </mesh>
      <mesh position={[0, skin.ring.up * height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[skin.ring.across * radius, skin.ring.tube * radius, 12, bumper.segments]}
        />
        <meshStandardMaterial color={paint.obstacle} roughness={bumper.roughness} />
      </mesh>
      <mesh geometry={parts.cap}>
        <meshStandardMaterial
          ref={(material) => {
            glows.current[1] = material
          }}
          color={color}
          emissive={color}
          emissiveIntensity={0}
          roughness={bumper.roughness}
        />
      </mesh>
    </group>
  )
}
