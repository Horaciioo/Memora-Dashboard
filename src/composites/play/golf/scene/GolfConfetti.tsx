'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, Object3D } from 'three'
import type { InstancedMesh, Mesh, MeshBasicMaterial } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { seededRandom } from '@/composites/play/golf/scene/random'
import { CUP_PULSE, floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { confetti } = GOLF_SCENE

// Paint keys the flakes take
const FLAKE_PAINT = ['flag', 'boost', 'bumper', 'aim-low', 'ice', 'pole'] as const

/**
 * Burst of confetti, a light pillar and a ring over the cup when a ball drops
 * @param {Object} props - Hole and motion
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {RefObject<GolfMotion>} props.motionRef - Motion, the cup pulse
 * @return {JSX.Element}
 */

export const GolfConfetti = ({
  hole,
  paint,
  motionRef,
}: {
  hole: GolfHole
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
}) => {
  const flakes = useRef<InstancedMesh>(null)
  const beam = useRef<Mesh>(null)
  const ring = useRef<Mesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const cupFloor = floorHeight(hole, hole.cup[0], hole.cup[1]) ?? 0

  // Fixed launch of every flake
  const launches = useMemo(() => {
    const random = seededRandom(confetti.count)
    return Array.from({ length: confetti.count }, () => {
      const angle = random() * Math.PI * 2
      const spread = confetti.spread * (0.4 + random() * 0.6)
      return {
        vx: Math.cos(angle) * spread,
        vz: Math.sin(angle) * spread,
        vy: confetti.lift * (0.6 + random() * 0.4),
        spin: (random() - 0.5) * confetti.spin,
      }
    })
  }, [])

  // One colour per flake
  useLayoutEffect(() => {
    launches.forEach((_, index) => {
      flakes.current?.setColorAt(index, new Color(paint[FLAKE_PAINT[index % FLAKE_PAINT.length]]))
    })
    if (flakes.current?.instanceColor) flakes.current.instanceColor.needsUpdate = true
  }, [launches, paint])

  useFrame(() => {
    const mesh = flakes.current
    if (!mesh) return
    const firedAt = motionRef.current.pulses.get(CUP_PULSE)
    const age = firedAt === undefined ? Infinity : (performance.now() - firedAt) / 1000
    mesh.visible = age < confetti.seconds
    // Pillar rises and thins, ring spreads and fades
    const pillar = Math.max(0, 1 - age / confetti.beam.seconds)
    const wave = Math.max(0, 1 - age / confetti.ring.seconds)
    if (beam.current) {
      beam.current.visible = pillar > 0
      beam.current.scale.set(pillar, 1, pillar)
      ;(beam.current.material as MeshBasicMaterial).opacity = confetti.beam.opacity * pillar
    }
    if (ring.current) {
      ring.current.visible = wave > 0
      ring.current.scale.setScalar(0.1 + (1 - wave) * confetti.ring.reach)
      ;(ring.current.material as MeshBasicMaterial).opacity = confetti.ring.opacity * wave
    }
    if (!mesh.visible) return
    launches.forEach((flake, index) => {
      // Thrown up, falling slowly
      holder.position.set(
        hole.cup[0] + flake.vx * age,
        cupFloor + flake.vy * age - (confetti.gravity * age * age) / 2,
        hole.cup[1] + flake.vz * age
      )
      holder.rotation.set(flake.spin * age, flake.spin * age * 0.7, 0)
      holder.scale.setScalar(1 - age / confetti.seconds)
      holder.updateMatrix()
      mesh.setMatrixAt(index, holder.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={flakes} args={[undefined, undefined, confetti.count]} visible={false}>
        <planeGeometry args={[confetti.size, confetti.size * 0.6]} />
        <meshBasicMaterial side={DoubleSide} />
      </instancedMesh>
      <mesh
        ref={beam}
        position={[hole.cup[0], cupFloor + confetti.beam.height / 2, hole.cup[1]]}
        visible={false}
      >
        <cylinderGeometry
          args={[confetti.beam.radius, confetti.beam.radius, confetti.beam.height, 16, 1, true]}
        />
        <meshBasicMaterial color={paint.boost} transparent depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh
        ref={ring}
        position={[hole.cup[0], cupFloor + 0.02, hole.cup[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <ringGeometry args={[1 - confetti.ring.width, 1, 48]} />
        <meshBasicMaterial color={paint.pole} transparent depthWrite={false} />
      </mesh>
    </>
  )
}
