'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import type { CanvasTexture, Group, MeshBasicMaterial } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { chevronTileTexture } from '@/composites/play/golf/scene/obstacles/textures'
import { boostTexture } from '@/composites/play/golf/scene/textures'
import { boostId, floorHeight } from '@/core/lib/play/golf'
import type { GolfHole, GolfMotion, GolfPad } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { chevron, boost } = GOLF_SCENE

// Flash tone of the chevrons
const WHITE = new Color('white')

/**
 * Chevron strip moved up its plate, toward the push
 * @param {CanvasTexture} strip - Shared strip
 * @param {number} step - Tiles
 * @return {void}
 */

const scrollStrip = (strip: CanvasTexture, step: number): void => {
  strip.offset.y = (strip.offset.y - step) % 1
}

interface GolfBoostProps {
  hole: GolfHole
  pad: GolfPad
  index: number
  plate: CanvasTexture
  chevrons: CanvasTexture
  tint: Color
  motionRef: RefObject<GolfMotion>
}

/**
 * Boost slab decal, chevrons scrolling along the push, flashing when a ball rolls on
 * @param {GolfBoostProps} props - Slab
 * @return {JSX.Element}
 */

const GolfBoost = ({ hole, pad, index, plate, chevrons, tint, motionRef }: GolfBoostProps) => {
  const body = useRef<Group>(null)
  const light = useRef<MeshBasicMaterial>(null)
  const [pushX, pushZ] = pad.push ?? [0, 0]
  const x = (pad.x0 + pad.x1) / 2
  const z = (pad.z0 + pad.z1) / 2
  const floor = (floorHeight(hole, x, z) ?? 0) + chevron.lift
  const size = Math.min(chevron.size, pad.x1 - pad.x0, pad.z1 - pad.z0)
  useFrame(() => {
    const hitAt = motionRef.current.pulses.get(boostId(index))
    const age = hitAt === undefined ? Infinity : performance.now() - hitAt
    const progress = Math.min(1, age / boost.pulseMs)
    const swell = Math.sin(Math.PI * progress)
    body.current?.scale.setScalar(1 + boost.pop * swell)
    body.current?.position.set(x, floor + boost.rise * swell, z)
    light.current?.color.copy(tint).lerp(WHITE, 1 - progress)
  })

  return (
    <group ref={body} position={[x, floor, z]} rotation={[0, Math.atan2(-pushX, -pushZ), 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={plate} transparent />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size * chevron.inner, size * chevron.inner]} />
        <meshBasicMaterial ref={light} map={chevrons} color={tint} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Boost plate decal on each boost slab
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @param {RefObject<GolfMotion>} props.motionRef - Motion
 * @return {JSX.Element}
 */

export const GolfBoosts = ({
  hole,
  paint,
  motionRef,
}: {
  hole: GolfHole
  paint: GolfPaint
  motionRef: RefObject<GolfMotion>
}) => {
  const plate = useMemo(() => boostTexture(paint.obstacle, paint['obstacle-top']), [paint])
  // One strip for every plate, scrolled once a frame
  const chevrons = useMemo(() => {
    const texture = chevronTileTexture()
    texture.repeat.set(1, chevron.tiles)
    return texture
  }, [])
  useEffect(
    () => () => {
      plate.dispose()
      chevrons.dispose()
    },
    [plate, chevrons]
  )
  useFrame((_, delta) => {
    scrollStrip(chevrons, delta * chevron.speed)
  })

  return (
    <>
      {hole.pads.map((pad, index) =>
        pad.push ? (
          <GolfBoost
            key={index}
            hole={hole}
            pad={pad}
            index={index}
            plate={plate}
            chevrons={chevrons}
            tint={paint['obstacle-top']}
            motionRef={motionRef}
          />
        ) : null
      )}
    </>
  )
}
