'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, Object3D } from 'three'
import type { Group, InstancedMesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { seededRandom } from '@/composites/play/golf/scene/random'
import { puffTexture, streakTexture } from '@/composites/play/golf/scene/weatherTextures'
import { floorHeight, hazardSpot } from '@/core/lib/play/golf'
import type { GolfHazard, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { tornado } = GOLF_SCENE
const { radius } = GOLF_SETTINGS.powers.tornado

// Debris paint keys
const DEBRIS_PAINT = ['turf', 'leaf', 'sand', 'trunk'] as const

/**
 * Funnel radius at a height
 * @param {number} height - Share of the funnel, zero at the foot
 * @return {number} - Metres
 */

const funnelRadius = (height: number): number =>
  tornado.base + (tornado.top - tornado.base) * height ** tornado.curve

/**
 * Sideways lean of the funnel, growing with height
 * @param {number} height - Share of the funnel
 * @param {number} seconds - Scene seconds
 * @param {number} phase - Layer phase
 * @return {[number, number]} - Offset x, z
 */

const lean = (height: number, seconds: number, phase: number): [number, number] => {
  const amount = tornado.bend * height ** 1.5
  const angle = seconds * tornado.bendSpeed + phase

  return [Math.cos(angle) * amount, Math.sin(angle * 0.8) * amount]
}

/**
 * Growth then fade of the whole tornado
 * @param {GolfHazard} hazard - Tornado
 * @param {number} now - Server ms
 * @return {number} - Zero to one
 */

const presence = (hazard: GolfHazard, now: number): number => {
  const grown = Math.min(1, Math.max(0, (now - (hazard.laidAt ?? now)) / 1000 / tornado.grow))
  const left =
    hazard.until === undefined ? 1 : Math.min(1, (hazard.until - now) / 1000 / tornado.fade)

  return Math.max(0, grown * left)
}

/**
 * Tornado laid by a player: turning funnel of wisps, debris thrown round it, dust at its foot and a cloud on top
 * @param {Object} props - Tornado
 * @param {GolfHazard} props.hazard - Laid power
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {() => number} props.serverNow - Server ms now
 * @return {JSX.Element}
 */

export const GolfTornado = ({
  hazard,
  hole,
  paint,
  serverNow,
}: {
  hazard: GolfHazard
  hole: GolfHole
  paint: GolfPaint
  serverNow: () => number
}) => {
  const body = useRef<Group>(null)
  const layers = useRef<Group>(null)
  const dust = useRef<Group>(null)
  const cloud = useRef<Group>(null)
  const debris = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const random = useMemo(
    () => seededRandom(hazard.id.length * 7919 + hazard.id.charCodeAt(0)),
    [hazard.id]
  )
  const streaks = useMemo(() => streakTexture(random), [random])
  const puff = useMemo(() => puffTexture(), [])
  useEffect(
    () => () => {
      streaks.dispose()
      puff.dispose()
    },
    [streaks, puff]
  )

  // Layers from the foot up, dusty then stormy
  const stack = useMemo(() => {
    const step = 1 / tornado.layers

    return Array.from({ length: tornado.layers }, (_, index) => {
      const low = index * step
      const high = (index + 1) * step

      return {
        low,
        bottom: funnelRadius(low),
        top: funnelRadius(high),
        phase: random() * Math.PI * 2,
        color: paint.dust.clone().lerp(paint['funnel-dark'], low),
        opacity: tornado.opacity * (0.7 + 0.5 * (1 - low)),
      }
    })
  }, [paint, random])

  // Debris launched at fixed phases
  const flakes = useMemo(
    () =>
      Array.from({ length: tornado.debris.count }, () => ({
        phase: random(),
        angle: random() * Math.PI * 2,
        reach: 1 + (random() - 0.5) * tornado.debris.spread * 2,
        speed: 0.7 + random() * 0.6,
        tumble: (random() - 0.5) * 12,
      })),
    [random]
  )
  useLayoutEffect(() => {
    flakes.forEach((_, index) => {
      const key = DEBRIS_PAINT[index % DEBRIS_PAINT.length]
      debris.current?.setColorAt(index, new Color(paint[key]))
    })
    if (debris.current?.instanceColor) debris.current.instanceColor.needsUpdate = true
  }, [flakes, paint])

  // Cloud puffs round the top
  const puffs = useMemo(
    () =>
      Array.from({ length: tornado.cloud.puffs }, (_, index) => ({
        angle: (index / tornado.cloud.puffs) * Math.PI * 2 + random() * 0.4,
        size: tornado.cloud.size * (0.7 + random() * 0.6),
        lift: random() * 0.12,
      })),
    [random]
  )

  useFrame(({ clock }) => {
    const group = body.current
    if (!group) return
    const seconds = clock.elapsedTime
    const now = serverNow()
    const { x, z } = hazardSpot(hazard, now)
    group.position.set(x, floorHeight(hole, x, z) ?? group.position.y, z)
    // Wide first, tall as it settles
    const show = presence(hazard, now)
    group.scale.set(0.4 + 0.6 * show, show, 0.4 + 0.6 * show)

    // Layers turn faster low, lean further high
    layers.current?.children.forEach((layer, index) => {
      const entry = stack[index]
      const [dx, dz] = lean(entry.low, seconds, entry.phase)
      layer.position.x = dx
      layer.position.z = dz
      layer.rotation.y =
        seconds * (tornado.spinBase + (tornado.spinTop - tornado.spinBase) * entry.low) +
        entry.phase
    })

    // Foot dust turns against the funnel
    dust.current?.children.forEach((disc, index) => {
      disc.rotation.z = seconds * tornado.dust.spin * (index % 2 ? -1 : 1) * (1 + index * 0.3)
      disc.scale.setScalar(1 + Math.sin(seconds * 2 + index) * tornado.dust.pulse)
    })

    // Cloud drifts round the top
    if (cloud.current) cloud.current.rotation.y = seconds * tornado.cloud.spin

    // Debris climbs the wall of the funnel
    const mesh = debris.current
    if (!mesh) return
    flakes.forEach((flake, index) => {
      const height = (flake.phase + seconds * tornado.debris.rise * flake.speed) % 1
      const spin = flake.angle + (seconds * tornado.debris.speed * flake.speed) / (0.4 + height)
      const around = funnelRadius(height) * flake.reach + tornado.debris.ground
      const [dx, dz] = lean(height, seconds, 0)
      holder.position.set(
        dx + Math.cos(spin) * around,
        height * tornado.height,
        dz + Math.sin(spin) * around
      )
      holder.rotation.set(seconds * flake.tumble, seconds * flake.tumble * 0.7, 0)
      holder.scale.setScalar(1 - height * 0.5)
      holder.updateMatrix()
      mesh.setMatrixAt(index, holder.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  const step = tornado.height / tornado.layers

  return (
    <group ref={body} position={[hazard.x, floorHeight(hole, hazard.x, hazard.z) ?? 0, hazard.z]}>
      {/* Reach on the ground */}
      <mesh position={[0, tornado.ring.lift, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * tornado.ring.edge, radius, tornado.ring.segments]} />
        <meshBasicMaterial color={paint.dust} transparent opacity={tornado.ring.opacity} />
      </mesh>

      {/* Dust at the foot */}
      <group ref={dust} position={[0, tornado.dust.lift, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: tornado.dust.discs }, (_, index) => (
          <mesh key={index} position={[0, 0, index * 0.004]}>
            <circleGeometry args={[tornado.dust.radius * (1 - index * 0.18), 32]} />
            <meshBasicMaterial
              color={paint.dust}
              alphaMap={puff}
              transparent
              opacity={tornado.dust.opacity}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Funnel of wisps */}
      <group ref={layers}>
        {stack.map((entry, index) => (
          <mesh key={index} position={[0, entry.low * tornado.height + step / 2, 0]}>
            <cylinderGeometry
              args={[entry.top, entry.bottom, step * tornado.overlap, tornado.segments, 1, true]}
            />
            <meshBasicMaterial
              color={entry.color}
              alphaMap={streaks}
              transparent
              opacity={entry.opacity}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Debris */}
      <instancedMesh
        ref={debris}
        args={[undefined, undefined, tornado.debris.count]}
        frustumCulled={false}
      >
        <boxGeometry args={[tornado.debris.size, tornado.debris.size, tornado.debris.size]} />
        <meshBasicMaterial />
      </instancedMesh>

      {/* Storm cloud */}
      <group ref={cloud} position={[0, tornado.height, 0]}>
        {puffs.map((entry, index) => (
          <mesh
            key={index}
            position={[
              Math.cos(entry.angle) * tornado.cloud.radius * 0.55,
              entry.lift,
              Math.sin(entry.angle) * tornado.cloud.radius * 0.55,
            ]}
            scale={[entry.size, entry.size * tornado.cloud.squash, entry.size]}
          >
            <sphereGeometry args={[1, 14, 10]} />
            <meshBasicMaterial
              color={paint['funnel-dark']}
              transparent
              opacity={tornado.cloud.opacity}
              depthWrite={false}
            />
          </mesh>
        ))}
        <mesh
          scale={[
            tornado.cloud.radius * 0.7,
            tornado.cloud.radius * 0.7 * tornado.cloud.squash,
            tornado.cloud.radius * 0.7,
          ]}
        >
          <sphereGeometry args={[1, 14, 10]} />
          <meshBasicMaterial
            color={paint.funnel}
            transparent
            opacity={tornado.cloud.opacity}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}
