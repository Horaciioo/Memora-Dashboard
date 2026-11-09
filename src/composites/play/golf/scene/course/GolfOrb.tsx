'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import type { Group, Mesh, MeshBasicMaterial } from 'three'

import { orbCardTexture, softShadeTexture } from '@/composites/play/golf/scene/course/orbTextures'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import { floorHeight } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { orb } = GOLF_SCENE
const { render, orbs, physics } = GOLF_SETTINGS

// Sway kept under half a ball, the hitbox sits at the mean height
const BOB = Math.min(orb.bob, physics.ballRadius / 2)

// Back-out ease, overshooting the size
const popScale = (progress: number): number => {
  const shifted = progress - 1

  return 1 + (orb.popOvershoot + 1) * shifted ** 3 + orb.popOvershoot * shifted ** 2
}

/**
 * Orb textures, dropped with the paint
 * @param {GolfPaint} paint - Colours
 * @return {Object} - Card and shade
 */

const useOrbTextures = (paint: GolfPaint) => {
  const textures = useMemo(
    () => ({
      card: orbCardTexture(getComputedStyle(document.body).fontFamily),
      shade: softShadeTexture(paint.shade),
    }),
    [paint]
  )
  useEffect(() => () => Object.values(textures).forEach((texture) => texture.dispose()), [textures])

  return textures
}

/**
 * Power card: rainbow card floating over a soft shade, popping in when it returns
 * @param {Object} props - Orb
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {number} props.index - Orb index, its phase
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
  const sphere = useRef<Mesh>(null)
  const shade = useRef<Mesh>(null)
  const shadeMaterial = useRef<MeshBasicMaterial>(null)
  const appearedAt = useRef<number | null>(null)
  const takenAt = useRef<number | null>(null)
  const textures = useOrbTextures(paint)
  const [x, z] = hole.orbs[index]
  const floor = floorHeight(hole, x, z) ?? 0

  useFrame(({ clock }) => {
    if (!body.current || !shade.current) return
    const time = clock.elapsedTime
    const isReady = serverNow() >= takenUntil
    // Taken: implodes, spins in, then gone until it returns
    if (!isReady && appearedAt.current !== null) takenAt.current ??= performance.now()
    const implode = takenAt.current
      ? MathUtils.clamp((performance.now() - takenAt.current) / orb.implodeMs, 0, 1)
      : 0
    const isShown = isReady || (takenAt.current !== null && implode < 1)
    body.current.visible = isShown
    shade.current.visible = isShown
    // Pop-in clock restarts on every return
    if (!isReady) {
      appearedAt.current = null
      if (!isShown) {
        takenAt.current = null
        return
      }
    } else takenAt.current = null
    appearedAt.current ??= isReady ? performance.now() : null
    const progress = appearedAt.current
      ? MathUtils.clamp((performance.now() - appearedAt.current) / orb.popMs, 0, 1)
      : 1
    const grow = Math.max(
      isReady
        ? popScale(progress)
        : (1 - implode) * (1 + orb.implodeSwell * Math.sin(implode * Math.PI)),
      1e-3
    )
    const sway = Math.sin(time * orb.bobSpeed + index * orb.phase)

    body.current.scale.setScalar(grow)
    body.current.position.y = floor + render.orbHover + sway * BOB
    sphere.current?.rotation.set(0, Math.sin(time * orb.spin + index) * orb.card.swing, 0)
    // Shade shrinks and fades as the orb rises
    const lift = (sway + 1) / 2
    shade.current.scale.setScalar(grow * (1 - lift * orb.shade.shrink))
    if (shadeMaterial.current) {
      shadeMaterial.current.opacity = orb.shade.opacity * (1 - lift * orb.shade.shrink)
    }
  })

  return (
    <>
      <mesh ref={shade} position={[x, floor + orb.shade.lift, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[orbs.radius * orb.shade.size, orbs.radius * orb.shade.size]} />
        <meshBasicMaterial
          ref={shadeMaterial}
          map={textures.shade}
          transparent
          depthWrite={false}
          opacity={orb.shade.opacity}
        />
      </mesh>
      <group ref={body} position={[x, floor + render.orbHover, z]}>
        <mesh ref={sphere} castShadow>
          <boxGeometry
            args={[
              orbs.radius * orb.card.width,
              orbs.radius * orb.card.height,
              orbs.radius * orb.card.depth,
            ]}
          />
          <meshBasicMaterial map={textures.card} toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}
