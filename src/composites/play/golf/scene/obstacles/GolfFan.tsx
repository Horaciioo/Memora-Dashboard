'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import type { Group, InstancedMesh } from 'three'

import { GolfPropeller } from '@/composites/play/golf/scene/GolfPropeller'
import { FLAT } from '@/composites/play/golf/scene/obstacles/flat'
import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { floorHeight, isFanBlowing } from '@/core/lib/play/golf'
import type { GolfFan as GolfFanEntry, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { fan, propeller } = GOLF_SCENE
const { frame, streaks } = fan

/**
 * Fan at the wind source, its zone drawn on the ground, streaks blowing along the wind
 * @param {Object} props - Fan
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {() => number} props.clock - Seconds since the hole opened
 * @param {GolfFanEntry} props.entry - Fan
 * @return {JSX.Element}
 */

export const GolfFan = ({
  hole,
  paint,
  clock,
  entry,
}: {
  hole: GolfHole
  paint: GolfPaint
  clock: () => number
  entry: GolfFanEntry
}) => {
  const zone = useRef<Group>(null)
  const lines = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const [px, pz] = entry.push
  const width = entry.x1 - entry.x0
  const depth = entry.z1 - entry.z0
  const cx = (entry.x0 + entry.x1) / 2
  const cz = (entry.z0 + entry.z1) / 2
  // Zone length and span along the wind
  const reach = Math.abs(px) * width + Math.abs(pz) * depth
  const span = Math.abs(pz) * width + Math.abs(px) * depth
  const floor = floorHeight(hole, cx, cz) ?? 0
  const heading = Math.atan2(px, pz)

  useFrame((state) => {
    // A cycling fan shows its zone only while it blows
    if (zone.current) zone.current.visible = isFanBlowing(entry, clock())
    if (!lines.current) return
    for (let index = 0; index < streaks.count; index += 1) {
      // Each streak crosses the zone then starts over, fading at both ends
      const progress = (state.clock.elapsedTime * streaks.speed + index / streaks.count) % 1
      const along = (progress - 0.5) * (reach - streaks.length)
      const lateral = (((index * 0.618) % 1) - 0.5) * span * streaks.spread
      holder.position.set(px * along - pz * lateral, streaks.lift, pz * along + px * lateral)
      holder.rotation.set(0, heading, 0)
      holder.scale.set(1, 1, Math.sin(progress * Math.PI))
      holder.updateMatrix()
      lines.current.setMatrixAt(index, holder.matrix)
    }
    lines.current.instanceMatrix.needsUpdate = true
  })

  // Zone frame, four sides
  const sides: [number, number, number, number][] = [
    [0, -depth / 2, width, frame.width],
    [0, depth / 2, width, frame.width],
    [-width / 2, 0, frame.width, depth],
    [width / 2, 0, frame.width, depth],
  ]

  return (
    <group position={[cx, floor, cz]}>
      <GolfPropeller
        position={[
          -px * (reach / 2 - propeller.radius),
          fan.lift,
          -pz * (reach / 2 - propeller.radius),
        ]}
        paint={paint}
        size={Math.min(1.6, Math.max(1, span / (propeller.radius * 2.4)))}
      />
      <group ref={zone}>
        <mesh position={[0, fan.lift, 0]} rotation={FLAT}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial
            color={paint.gust}
            transparent
            opacity={frame.fill}
            depthWrite={false}
          />
        </mesh>
        {sides.map(([x, z, w, d], index) => (
          <mesh key={index} position={[x, fan.lift + 0.001, z]} rotation={FLAT}>
            <planeGeometry args={[w, d]} />
            <meshBasicMaterial
              color={paint.gust}
              transparent
              opacity={frame.opacity}
              depthWrite={false}
            />
          </mesh>
        ))}
        <instancedMesh ref={lines} args={[undefined, undefined, streaks.count]}>
          <boxGeometry args={[streaks.width, streaks.width, streaks.length]} />
          <meshBasicMaterial color={paint.gust} transparent opacity={0.8} />
        </instancedMesh>
      </group>
    </group>
  )
}
