'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

import { GolfBoosts } from '@/composites/play/golf/scene/GolfBoosts'
import { GolfBumper } from '@/composites/play/golf/scene/GolfBumper'
import { GolfOrb } from '@/composites/play/golf/scene/GolfOrb'
import { GolfTornado } from '@/composites/play/golf/scene/GolfTornado'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { seatColor } from '@/composites/play/golf/scene/paint'
import { isEffectActive } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { powers } = GOLF_SETTINGS
const { spinner } = GOLF_SCENE

/**
 * What every fixture reads
 * @typedef {Object} FixtureProps
 */

interface FixtureProps {
  hole: GolfHole
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
  // Server ms now
  serverNow: () => number
}

/**
 * Turning bar on its post, on the server clock
 * @param {FixtureProps & { index: number, startsAt: number }} props - Bar
 * @return {JSX.Element}
 */

const Spinner = ({
  hole,
  paint,
  index,
  startsAt,
  serverNow,
}: Omit<FixtureProps, 'motionRef'> & { index: number; startsAt: number }) => {
  const bar = useRef<Group>(null)
  const entry = hole.spinners[index]
  useFrame(() => {
    // Same angle as the physics
    const angle = entry.phase + entry.speed * ((serverNow() - startsAt) / 1000)
    if (bar.current) bar.current.rotation.y = -angle
  })

  return (
    <group position={[entry.x, entry.floor, entry.z]}>
      <group ref={bar}>
        <mesh position={[0, spinner.height / 2, 0]} castShadow>
          <boxGeometry
            args={[entry.length, spinner.height, GOLF_SETTINGS.physics.spinnerThickness * 2]}
          />
          <meshStandardMaterial color={paint.obstacle} />
        </mesh>
        <mesh position={[0, spinner.height + spinner.stripe / 2, 0]}>
          <boxGeometry
            args={[
              entry.length - spinner.stripe * 2,
              spinner.stripe,
              GOLF_SETTINGS.physics.spinnerThickness,
            ]}
          />
          <meshStandardMaterial color={paint['obstacle-top']} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Bumpers, bars, orbs and laid powers of a hole
 * @param {FixtureProps & Object} props - Hole and its state
 * @return {JSX.Element}
 */

export const GolfFixtures = ({
  hole,
  paint,
  motionRef,
  serverNow,
  startsAt,
  takenOrbs,
  hazards,
  seatOf,
}: FixtureProps & {
  startsAt: number
  takenOrbs: number[]
  hazards: GolfHazard[]
  seatOf: (accountId: string) => string
}) => (
  <>
    <GolfBoosts hole={hole} paint={paint} motionRef={motionRef} />
    {hole.bumpers.map((entry) => (
      <GolfBumper
        key={entry.id}
        {...entry}
        radius={entry.r}
        color={paint.bumper}
        paint={paint}
        motionRef={motionRef}
        hole={hole}
      />
    ))}
    {hole.spinners.map((_, index) => (
      <Spinner
        key={index}
        hole={hole}
        paint={paint}
        index={index}
        startsAt={startsAt}
        serverNow={serverNow}
      />
    ))}
    {hole.orbs.map((_, index) => (
      <GolfOrb
        key={index}
        hole={hole}
        paint={paint}
        index={index}
        takenUntil={takenOrbs[index] ?? 0}
        serverNow={serverNow}
      />
    ))}
    {hazards
      .filter((hazard) => isEffectActive(hazard, serverNow()))
      .map((hazard) =>
        hazard.power === GolfPowers.Tornado ? (
          <GolfTornado
            key={hazard.id}
            hazard={hazard}
            hole={hole}
            paint={paint}
            serverNow={serverNow}
          />
        ) : hazard.power !== GolfPowers.Bumper ? null : (
          <GolfBumper
            key={hazard.id}
            id={hazard.id}
            x={hazard.x}
            z={hazard.z}
            radius={powers.bumper.radius}
            color={seatColor(seatOf(hazard.ownerId))}
            paint={paint}
            motionRef={motionRef}
            hole={hole}
          />
        )
      )}
  </>
)
