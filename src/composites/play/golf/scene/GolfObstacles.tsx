'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

import { GolfPropeller } from '@/composites/play/golf/scene/GolfPropeller'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfFan, GolfHole, GolfPoint, GolfTotem } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { portal, vortex, fan, totem } = GOLF_SCENE
const { obstacles } = GOLF_SETTINGS

// Lying flat on the ground
const FLAT: [number, number, number] = [-Math.PI / 2, 0, 0]

interface ObstacleProps {
  hole: GolfHole
  paint: GolfPaint
  // Seconds since the hole opened
  clock: () => number
}

/**
 * Glowing ring on the ground, turning and pulsing
 * @param {Object} props - Ring
 * @return {JSX.Element}
 */

const PortalRing = ({
  hole,
  at,
  color,
}: {
  hole: GolfHole
  at: GolfPoint
  color: GolfPaint['portal']
}) => {
  const ring = useRef<Group>(null)
  const disc = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * portal.spin
    disc.current?.scale.setScalar(
      1 + Math.sin(clock.elapsedTime * portal.pulseSpeed) * portal.pulse
    )
  })

  return (
    <group
      position={[at[0], (floorHeight(hole, at[0], at[1]) ?? 0) + portal.lift, at[1]]}
      rotation={FLAT}
    >
      <group ref={ring}>
        <mesh>
          <torusGeometry
            args={[obstacles.portalRadius, portal.tube, 8, portal.segments, Math.PI * 1.5]}
          />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
      <mesh ref={disc}>
        <circleGeometry args={[obstacles.portalRadius, portal.segments]} />
        <meshBasicMaterial color={color} transparent opacity={portal.opacity} />
      </mesh>
    </group>
  )
}

/**
 * Black hole: dark core inside turning spiral rings
 * @param {Object} props - Vortex
 * @return {JSX.Element}
 */

const Vortex = ({
  hole,
  paint,
  entry,
}: Pick<ObstacleProps, 'hole' | 'paint'> & { entry: GolfHole['vortexes'][number] }) => {
  const spiral = useRef<Group>(null)
  useFrame((_, delta) => {
    if (spiral.current) spiral.current.rotation.z -= delta * vortex.spin
  })

  return (
    <group
      position={[entry.x, (floorHeight(hole, entry.x, entry.z) ?? 0) + vortex.lift, entry.z]}
      rotation={FLAT}
    >
      <mesh>
        <circleGeometry args={[entry.r, vortex.segments]} />
        <meshBasicMaterial color={paint.vortex} transparent opacity={vortex.opacity} />
      </mesh>
      <group ref={spiral}>
        {Array.from({ length: vortex.rings }, (_, ring) => (
          <mesh key={ring} rotation={[0, 0, ring * 2]}>
            <torusGeometry
              args={[
                (entry.r * (ring + 1)) / (vortex.rings + 0.5),
                vortex.tube,
                6,
                vortex.segments,
                Math.PI * 1.3,
              ]}
            />
            <meshBasicMaterial color={paint.portal} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[obstacles.vortexCore * vortex.core, vortex.segments]} />
        <meshBasicMaterial color={paint.vortex} />
      </mesh>
    </group>
  )
}

/**
 * Fan blowing across its zone, white puffs streaming along the wind
 * @param {Object} props - Fan
 * @return {JSX.Element}
 */

const Fan = ({
  hole,
  paint,
  entry,
}: Pick<ObstacleProps, 'hole' | 'paint'> & { entry: GolfFan }) => {
  const puffs = useRef<Group>(null)
  const [px, pz] = entry.push
  const width = entry.x1 - entry.x0
  const depth = entry.z1 - entry.z0
  const cx = (entry.x0 + entry.x1) / 2
  const cz = (entry.z0 + entry.z1) / 2
  // Zone length and span along the wind
  const reach = Math.abs(px) * width + Math.abs(pz) * depth
  const span = Math.abs(pz) * width + Math.abs(px) * depth
  const floor = floorHeight(hole, cx, cz) ?? 0

  useFrame(({ clock }) => {
    puffs.current?.children.forEach((puff, index) => {
      // Each puff travels the zone then starts over
      const progress = (clock.elapsedTime * fan.speed + index / fan.puffs) % 1
      const along = (progress - 0.5) * reach
      const lateral = (((index * 0.37) % 1) - 0.5) * span * fan.spread
      puff.position.set(px * along - pz * lateral, 0, pz * along + px * lateral)
      puff.scale.setScalar(Math.sin(progress * Math.PI))
    })
  })

  return (
    <group position={[cx, floor, cz]}>
      {/* Ventilator at the wind source */}
      <GolfPropeller
        position={[
          -px * (reach / 2 - GOLF_SCENE.propeller.radius),
          fan.lift,
          -pz * (reach / 2 - GOLF_SCENE.propeller.radius),
        ]}
        paint={paint}
        size={Math.min(1.6, Math.max(1, span / (GOLF_SCENE.propeller.radius * 2.4)))}
      />
      <group ref={puffs} position={[0, fan.puffLift, 0]}>
        {Array.from({ length: fan.puffs }, (_, puff) => (
          <mesh key={puff}>
            <sphereGeometry args={[fan.puff, 8, 6]} />
            <meshBasicMaterial color={paint.gust} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Segmented post rising and sinking on the hole clock
 * @param {Object} props - Totem
 * @return {JSX.Element}
 */

const Totem = ({ hole, paint, clock, entry }: ObstacleProps & { entry: GolfTotem }) => {
  const post = useRef<Group>(null)
  const floor = floorHeight(hole, entry.x, entry.z) ?? entry.floor
  const piece = totem.height / totem.segments
  useFrame(() => {
    if (!post.current) return
    // Same wave as the physics
    const wave = Math.sin((2 * Math.PI * clock()) / entry.period + entry.phase)
    post.current.scale.y = Math.max(totem.floor, Math.min(1, wave * totem.rise))
  })

  return (
    <group position={[entry.x, floor, entry.z]}>
      <group ref={post}>
        {Array.from({ length: totem.segments }, (_, index) => (
          <mesh key={index} position={[0, piece * (index + 0.5), 0]} castShadow>
            <cylinderGeometry
              args={[entry.r * totem.shrink ** index, entry.r * totem.shrink ** index, piece, 16]}
            />
            <meshStandardMaterial color={index % 2 ? paint.block : paint.totem} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Portals, black holes, fans and totems of a hole
 * @param {ObstacleProps} props - Hole and clock
 * @return {JSX.Element}
 */

export const GolfObstacles = ({ hole, paint, clock }: ObstacleProps) => (
  <>
    {hole.portals.map((entry) => (
      <group key={entry.id}>
        <PortalRing hole={hole} at={entry.from} color={paint.portal} />
        <PortalRing hole={hole} at={entry.to} color={paint['portal-exit']} />
      </group>
    ))}
    {hole.vortexes.map((entry) => (
      <Vortex key={entry.id} hole={hole} paint={paint} entry={entry} />
    ))}
    {hole.fans.map((entry, index) => (
      <Fan key={index} hole={hole} paint={paint} entry={entry} />
    ))}
    {hole.totems.map((entry) => (
      <Totem key={entry.id} hole={hole} paint={paint} clock={clock} entry={entry} />
    ))}
  </>
)
