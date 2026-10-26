'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import type { Group, InstancedMesh } from 'three'

import { GolfPropeller } from '@/composites/play/golf/scene/GolfPropeller'
import { overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight, gustFans, isEffectActive } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GolfPowers } from '@/utils/constants/play'

const { gust, propeller } = GOLF_SCENE

interface GustProps {
  hazard: GolfHazard
  hole: GolfHole
  paint: GolfPaint
  serverNow: () => number
}

/**
 * Grow then fade of a gust
 * @param {GolfHazard} hazard - Gust
 * @param {number} now - Server ms
 * @return {number} - Zero to one
 */

const presenceOf = (hazard: GolfHazard, now: number): number => {
  const grown = Math.min(1, Math.max(0, (now - (hazard.laidAt ?? now)) / 1000 / propeller.grow))
  const left =
    hazard.until === undefined ? 1 : Math.min(1, (hazard.until - now) / 1000 / propeller.fade)

  return Math.max(0, grown * left)
}

/**
 * White streaks sweeping the course along one gust
 * @param {GustProps} props - Gust
 * @return {JSX.Element}
 */

const Streaks = ({ hazard, hole, paint }: Omit<GustProps, 'serverNow'>) => {
  const streaks = useRef<Group>(null)
  const { center, reach } = overviewOf(hole)
  const dx = hazard.vx ?? 0
  const dz = hazard.vz ?? 0

  useFrame(({ clock }) => {
    streaks.current?.children.forEach((streak, index) => {
      // Each streak crosses the course then starts over
      const progress = (clock.elapsedTime * gust.speed + index / gust.streaks) % 1
      const along = (progress - 0.5) * reach * 1.4
      const lateral = (((index * 0.61) % 1) - 0.5) * reach * gust.spread
      streak.position.set(
        center.x + dx * along - dz * lateral,
        gust.height + (index % 3) * 0.3,
        center.z + dz * along + dx * lateral
      )
      streak.scale.setScalar(Math.sin(progress * Math.PI))
    })
  })

  return (
    <group ref={streaks}>
      {Array.from({ length: gust.streaks }, (_, index) => (
        <mesh key={index} rotation={[0, Math.atan2(dx, dz), 0]}>
          <boxGeometry args={[gust.thickness, gust.thickness, gust.length]} />
          <meshBasicMaterial color={paint.gust} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Little white squares streaming off every fan along the wind
 * @param {Object} props - Fans
 * @param {GolfHazard} props.hazard - Gust
 * @param {[number, number, number][]} props.spots - Fan spots with their floor
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

const WindSquares = ({
  hazard,
  spots,
  paint,
}: {
  hazard: GolfHazard
  spots: [number, number, number][]
  paint: GolfPaint
}) => {
  const squares = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const { squares: perFan, size, length, speed, height, spread } = propeller.wind
  const dx = hazard.vx ?? 0
  const dz = hazard.vz ?? 0

  useFrame(({ clock }) => {
    const mesh = squares.current
    if (!mesh) return
    spots.forEach(([x, floor, z], fan) => {
      for (let index = 0; index < perFan; index += 1) {
        // Each square leaves the fan, drifts away and thins out
        const progress = (clock.elapsedTime * speed + index / perFan + fan * 0.137) % 1
        const lateral = (((index * 0.61 + fan * 0.29) % 1) - 0.5) * spread
        holder.position.set(
          x + dx * progress * length - dz * lateral,
          floor + height + (index % 3) * 0.04,
          z + dz * progress * length + dx * lateral
        )
        holder.rotation.set(0, Math.atan2(dx, dz), 0)
        holder.scale.set(Math.sin(progress * Math.PI), 1, Math.sin(progress * Math.PI) * 3)
        holder.updateMatrix()
        mesh.setMatrixAt(fan * perFan + index, holder.matrix)
      }
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={squares}
      args={[undefined, undefined, spots.length * perFan]}
      frustumCulled={false}
    >
      <boxGeometry args={[size, size, size]} />
      <meshBasicMaterial color={paint.gust} transparent opacity={0.85} />
    </instancedMesh>
  )
}

/**
 * Fans of one gust, spinning flat on the course, their squares and the sweeping streaks
 * @param {GustProps} props - Gust
 * @return {JSX.Element}
 */

const Wind = ({ hazard, hole, paint, serverNow }: GustProps) => {
  // Same spots as the physics
  const spots = useMemo(
    () =>
      gustFans(hazard, hole).map(([x, z]): [number, number, number] => [
        x,
        floorHeight(hole, x, z) ?? 0,
        z,
      ]),
    [hazard, hole]
  )
  const presence = () => presenceOf(hazard, serverNow())

  return (
    <>
      <Streaks hazard={hazard} hole={hole} paint={paint} />
      <WindSquares hazard={hazard} spots={spots} paint={paint} />
      {spots.map(([x, floor, z], index) => (
        <GolfPropeller
          key={index}
          position={[x, floor + propeller.lift, z]}
          paint={paint}
          direction={index % 2 ? -1 : 1}
          presence={presence}
        />
      ))}
    </>
  )
}

/**
 * Fans and streaks of every gust blowing
 * @param {Object} props - Hole and gusts
 * @return {JSX.Element}
 */

export const GolfGusts = ({
  hole,
  paint,
  hazards,
  serverNow,
}: {
  hole: GolfHole
  paint: GolfPaint
  hazards: GolfHazard[]
  serverNow: () => number
}) => (
  <>
    {hazards
      .filter((hazard) => hazard.power === GolfPowers.Gust && isEffectActive(hazard, serverNow()))
      .map((hazard) => (
        <Wind key={hazard.id} hazard={hazard} hole={hole} paint={paint} serverNow={serverNow} />
      ))}
  </>
)
