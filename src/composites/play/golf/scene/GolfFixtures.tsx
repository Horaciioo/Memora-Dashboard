'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { seatColor } from '@/composites/play/golf/scene/paint'
import { floorHeight, isEffectActive } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

const { render, powers } = GOLF_SETTINGS
const { bumper, spinner, orb, tornado } = GOLF_SCENE

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
 * One bumper, swelling when hit
 * @param {Object} props - Bumper
 * @return {JSX.Element}
 */

const Bumper = ({
  id,
  x,
  z,
  radius,
  color,
  motionRef,
  hole,
}: {
  id: string
  x: number
  z: number
  radius: number
  color: GolfPaint['bumper']
  motionRef: RefObject<GolfMotion>
  hole: GolfHole
}) => {
  const body = useRef<Mesh>(null)
  useFrame(() => {
    const hitAt = motionRef.current.pulses.get(id)
    const age = hitAt === undefined ? Infinity : performance.now() - hitAt
    const swell = age < bumper.pulseMs ? 1 + bumper.pulse * (1 - age / bumper.pulseMs) : 1
    body.current?.scale.set(swell, 1, swell)
  })

  return (
    <mesh ref={body} position={[x, (floorHeight(hole, x, z) ?? 0) + render.blockHeight / 2, z]}>
      <cylinderGeometry args={[radius, radius, render.blockHeight, bumper.segments]} />
      <meshStandardMaterial color={color} roughness={bumper.roughness} />
    </mesh>
  )
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
      <mesh position={[0, spinner.height, 0]}>
        <cylinderGeometry args={[spinner.postRadius, spinner.postRadius, spinner.height * 2]} />
        <meshStandardMaterial color={paint.block} />
      </mesh>
      <group ref={bar}>
        <mesh position={[0, spinner.height / 2, 0]}>
          <boxGeometry
            args={[entry.length, spinner.height, GOLF_SETTINGS.physics.spinnerThickness * 2]}
          />
          <meshStandardMaterial color={paint.spinner} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Orb floating over its spot, gone while taken
 * @param {FixtureProps & { index: number, takenUntil: number }} props - Orb
 * @return {JSX.Element}
 */

const Orb = ({
  hole,
  paint,
  index,
  takenUntil,
  serverNow,
}: Omit<FixtureProps, 'motionRef'> & { index: number; takenUntil: number }) => {
  const gem = useRef<Mesh>(null)
  const [x, z] = hole.orbs[index]
  const floor = floorHeight(hole, x, z) ?? 0
  useFrame(({ clock }) => {
    if (!gem.current) return
    gem.current.visible = serverNow() >= takenUntil
    gem.current.rotation.y = clock.elapsedTime * orb.spin
    gem.current.position.y =
      floor + render.orbHover + Math.sin(clock.elapsedTime * orb.bobSpeed + index) * orb.bob
  })

  return (
    <mesh ref={gem} position={[x, floor + render.orbHover, z]}>
      <icosahedronGeometry args={[orb.size, 0]} />
      <meshStandardMaterial
        color={paint.orb}
        emissive={paint.orb}
        emissiveIntensity={orb.glow}
        flatShading
      />
    </mesh>
  )
}

/**
 * Tornado laid by a player, rings turning over its reach
 * @param {Object} props - Tornado
 * @return {JSX.Element}
 */

const Tornado = ({
  hazard,
  hole,
  paint,
}: {
  hazard: GolfHazard
  hole: GolfHole
  paint: GolfPaint
}) => {
  const funnel = useRef<Group>(null)
  const floor = floorHeight(hole, hazard.x, hazard.z) ?? 0
  useFrame((_, delta) => {
    if (funnel.current) funnel.current.rotation.y += delta * tornado.spin
  })

  return (
    <group position={[hazard.x, floor, hazard.z]}>
      <mesh position={[0, GOLF_SCENE.chevron.lift, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[powers.tornado.radius * tornado.edge, powers.tornado.radius, tornado.segments]}
        />
        <meshBasicMaterial color={paint.tornado} transparent opacity={tornado.opacity} />
      </mesh>
      <group ref={funnel}>
        {Array.from({ length: tornado.rings }, (_, ring) => (
          <mesh
            key={ring}
            position={[0, tornado.ground * (1 + ring * tornado.rise), 0]}
            rotation={[Math.PI / 2, 0, ring]}
          >
            <torusGeometry
              args={[
                tornado.base + ring * tornado.step,
                tornado.tube,
                6,
                tornado.segments / 2,
                Math.PI * tornado.arc,
              ]}
            />
            <meshBasicMaterial
              color={paint.tornado}
              transparent
              opacity={tornado.ringOpacity - ring * tornado.fade}
            />
          </mesh>
        ))}
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
    {hole.bumpers.map((entry) => (
      <Bumper
        key={entry.id}
        {...entry}
        radius={entry.r}
        color={paint.bumper}
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
      <Orb
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
          <Tornado key={hazard.id} hazard={hazard} hole={hole} paint={paint} />
        ) : (
          <Bumper
            key={hazard.id}
            id={hazard.id}
            x={hazard.x}
            z={hazard.z}
            radius={powers.bumper.radius}
            color={seatColor(seatOf(hazard.ownerId))}
            motionRef={motionRef}
            hole={hole}
          />
        )
      )}
  </>
)
