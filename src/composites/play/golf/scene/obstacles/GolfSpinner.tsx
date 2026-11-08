'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import type { Group } from 'three'

import { FLAT } from '@/composites/play/golf/scene/obstacles/flat'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfSpinner as GolfSpinnerEntry } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { SECOND_MS } from '@/utils/constants/time'

const { spinner } = GOLF_SCENE
const THICKNESS = GOLF_SETTINGS.physics.spinnerThickness

/**
 * Thick bar turning on a visible pivot, its reach ringed on the ground, on the server clock
 * @param {Object} props - Bar
 * @param {GolfSpinnerEntry} props.entry - Bar
 * @param {GolfPaint} props.paint - Colours
 * @param {number} props.startsAt - Hole start, server ms
 * @param {() => number} props.serverNow - Server ms now
 * @return {JSX.Element}
 */

export const GolfSpinner = ({
  entry,
  paint,
  startsAt,
  serverNow,
}: {
  entry: GolfSpinnerEntry
  paint: GolfPaint
  startsAt: number
  serverNow: () => number
}) => {
  const bar = useRef<Group>(null)
  const reach = entry.length / 2 + THICKNESS
  useFrame(() => {
    // Same angle as the physics
    const angle = entry.phase + entry.speed * ((serverNow() - startsAt) / SECOND_MS)
    if (bar.current) bar.current.rotation.y = -angle
  })

  return (
    <group position={[entry.x, entry.floor, entry.z]}>
      <mesh position={[0, 0.006, 0]} rotation={FLAT}>
        <ringGeometry args={[reach - spinner.trace.width, reach, 48]} />
        <meshBasicMaterial
          color={paint.obstacle}
          transparent
          opacity={spinner.trace.opacity}
          depthWrite={false}
        />
      </mesh>
      <group ref={bar}>
        <RoundedBox
          args={[entry.length + THICKNESS * 2, spinner.height, THICKNESS * 2]}
          // Round ends of the capsule collider
          radius={THICKNESS}
          position={[0, spinner.height / 2, 0]}
          castShadow
        >
          <meshToonMaterial color={paint.obstacle} />
        </RoundedBox>
        <RoundedBox
          args={[entry.length, spinner.stripe, THICKNESS]}
          radius={spinner.stripe / 2}
          position={[0, spinner.height, 0]}
        >
          <meshToonMaterial color={paint['obstacle-top']} />
        </RoundedBox>
      </group>
      {/* Pivot standing through the bar */}
      <mesh position={[0, (spinner.height + spinner.hub.rise) / 2, 0]} castShadow>
        <cylinderGeometry
          args={[spinner.hub.radius, spinner.hub.radius, spinner.height + spinner.hub.rise, 24]}
        />
        <meshToonMaterial color={paint['obstacle-top']} />
      </mesh>
      <mesh position={[0, spinner.height + spinner.hub.rise, 0]}>
        <sphereGeometry args={[spinner.hub.radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color={paint.cloud} />
      </mesh>
    </group>
  )
}
