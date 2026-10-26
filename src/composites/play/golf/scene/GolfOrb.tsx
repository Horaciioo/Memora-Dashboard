'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import type { Group, Mesh, MeshBasicMaterial } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { questionTexture } from '@/composites/play/golf/scene/textures'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { orb } = GOLF_SCENE
const { render } = GOLF_SETTINGS

// Back-out ease, overshooting the size
const popScale = (progress: number): number => {
  const shifted = progress - 1

  return 1 + (orb.popOvershoot + 1) * shifted ** 3 + orb.popOvershoot * shifted ** 2
}

/**
 * Power orb: glass shell, prism core, satellites and a ground ring, popping in when it returns
 * @param {Object} props - Orb
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {number} props.index - Orb index
 * @param {number} props.takenUntil - Server ms it returns
 * @param {() => number} props.serverNow - Server ms now
 * @return {JSX.Element}
 */

export const GolfOrb = ({
  hole,
  paint,
  index,
  takenUntil,
  serverNow,
}: {
  hole: GolfHole
  paint: GolfPaint
  index: number
  takenUntil: number
  serverNow: () => number
}) => {
  const body = useRef<Group>(null)
  const shell = useRef<Group>(null)
  const core = useRef<Mesh>(null)
  const coreMaterial = useRef<MeshBasicMaterial>(null)
  const satellites = useRef<Group>(null)
  const ring = useRef<Mesh>(null)
  const appearedAt = useRef<number | null>(null)
  const mark = useMemo(() => questionTexture(orb.pixels, paint.shade), [paint.shade])
  useEffect(() => () => mark.dispose(), [mark])
  const [x, z] = hole.orbs[index]
  const floor = floorHeight(hole, x, z) ?? 0

  useFrame(({ clock }) => {
    if (!body.current || !ring.current) return
    const time = clock.elapsedTime
    const isReady = serverNow() >= takenUntil
    body.current.visible = isReady
    ring.current.visible = isReady
    // Pop-in clock restarts on every return
    if (!isReady) {
      appearedAt.current = null
      return
    }
    appearedAt.current ??= performance.now()
    const progress = MathUtils.clamp((performance.now() - appearedAt.current) / orb.popMs, 0, 1)
    const grow = popScale(progress)

    body.current.scale.setScalar(Math.max(grow, 1e-3))
    body.current.position.y =
      floor + render.orbHover + Math.sin(time * orb.bobSpeed + index) * orb.bob
    shell.current?.rotation.set(orb.tilt, time * orb.spin, orb.tilt)
    core.current?.rotation.set(time * orb.coreSpin, time * orb.coreSpin * orb.coreTumble, 0)
    if (satellites.current) satellites.current.rotation.set(0, time * orb.orbitSpeed, orb.tilt)
    // Core shifts through the rainbow, any power may hide inside
    coreMaterial.current?.color.setHSL((time * orb.coreHue + index * orb.hueGap) % 1, 1, 0.6)
    const beat = 1 + Math.sin(time * orb.ring.pulseSpeed + index) * orb.ring.pulse
    ring.current.scale.setScalar(beat * Math.max(grow, 1e-3))
  })

  return (
    <>
      <mesh
        ref={ring}
        position={[x, floor + GOLF_SCENE.chevron.lift, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[orb.ring.inner, orb.ring.outer, GOLF_SCENE.portal.segments]} />
        <meshBasicMaterial color={paint.ice} transparent opacity={orb.ring.opacity} />
      </mesh>
      <group ref={body} position={[x, floor + render.orbHover, z]}>
        <group ref={shell}>
          <mesh castShadow>
            <boxGeometry args={[orb.size, orb.size, orb.size]} />
            <meshStandardMaterial
              color={paint.ice}
              transparent
              opacity={orb.opacity}
              roughness={orb.roughness}
            />
          </mesh>
          <mesh scale={orb.mark}>
            <boxGeometry args={[orb.size, orb.size, orb.size]} />
            <meshBasicMaterial map={mark} transparent depthWrite={false} />
          </mesh>
        </group>
        <mesh ref={core}>
          <boxGeometry args={[orb.core, orb.core, orb.core]} />
          <meshBasicMaterial ref={coreMaterial} toneMapped={false} />
        </mesh>
        <group ref={satellites}>
          {Array.from({ length: orb.satellites }, (_, satellite) => {
            const angle = (satellite / orb.satellites) * Math.PI * 2

            return (
              <mesh
                key={satellite}
                position={[Math.cos(angle) * orb.orbit, 0, Math.sin(angle) * orb.orbit]}
              >
                <boxGeometry args={[orb.satellite, orb.satellite, orb.satellite]} />
                <meshBasicMaterial color={paint.ice} />
              </mesh>
            )
          })}
        </group>
      </group>
    </>
  )
}
