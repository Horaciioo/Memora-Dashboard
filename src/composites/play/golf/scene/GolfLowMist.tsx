'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, Object3D } from 'three'
import type { InstancedMesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import { holeSeed, seededRandom } from '@/composites/play/golf/scene/random'
import { overviewOf } from '@/composites/play/golf/scene/rig'
import type { GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { low } = GOLF_SCENE.mist
// Texture side, pixels
const SIDE = 128

/**
 * Lowest lawn height of a hole, the mist stays under it
 * @param {GolfHole} hole - Hole
 * @return {number} - Height
 */

export const lowestFloor = (hole: GolfHole): number =>
  Math.min(
    ...hole.pads.map(
      (pad) =>
        pad.h + Math.min(0, pad.gx * (pad.x1 - pad.x0)) + Math.min(0, pad.gz * (pad.z1 - pad.z0))
    )
  )

/**
 * Soft round puff, white fading out
 * @return {CanvasTexture} - Texture
 */

const puffTexture = (): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = SIDE
  canvas.height = SIDE
  const context = canvas.getContext('2d')
  if (context) {
    const fade = context.createRadialGradient(SIDE / 2, SIDE / 2, 0, SIDE / 2, SIDE / 2, SIDE / 2)
    fade.addColorStop(0, 'rgba(255,255,255,1)')
    fade.addColorStop(0.55, 'rgba(255,255,255,0.55)')
    fade.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = fade
    context.fillRect(0, 0, SIDE, SIDE)
  }

  return new CanvasTexture(canvas)
}

/**
 * Low mist layers under the slabs and at the foot of the walls, slowly drifting
 * @param {Object} props - Hole and colours
 * @param {GolfHole} props.hole - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfLowMist = ({ hole, paint }: { hole: GolfHole; paint: GolfPaint }) => {
  const mesh = useRef<InstancedMesh>(null)
  const texture = useMemo(() => puffTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])
  const { center, reach } = useMemo(() => overviewOf(hole), [hole])
  const top = useMemo(() => lowestFloor(hole) - low.top, [hole])
  const count = low.layers * 4
  // Layout of each puff: spot, size, drift phase
  const puffs = useMemo(() => {
    const random = seededRandom(holeSeed(hole) + 7)
    return Array.from({ length: count }, (_, index) => ({
      angle: index * 2.39996,
      distance: reach * low.spread * Math.sqrt((index + 0.5) / count),
      y: top - random() * low.depth,
      size: low.size * (0.6 + random() * 0.8),
      phase: random() * Math.PI * 2,
    }))
  }, [hole, reach, top, count])
  const holder = useMemo(() => new Object3D(), [])

  const lay = (seconds: number) => {
    if (!mesh.current) return
    puffs.forEach((puff, index) => {
      const sway = Math.sin(seconds * low.speed + puff.phase) * low.drift
      holder.position.set(
        Math.cos(puff.angle) * puff.distance + sway,
        puff.y,
        Math.sin(puff.angle) * puff.distance + sway * 0.6
      )
      holder.rotation.set(-Math.PI / 2, 0, puff.phase + seconds * low.speed * 0.2)
      holder.scale.setScalar(puff.size)
      holder.updateMatrix()
      mesh.current?.setMatrixAt(index, holder.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }
  useLayoutEffect(() => lay(0))
  useFrame(({ clock }) => lay(clock.elapsedTime))

  return (
    <group position={[center.x, 0, center.z]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry />
        <meshBasicMaterial
          color={paint.mist}
          alphaMap={texture}
          transparent
          opacity={low.opacity}
          depthWrite={false}
          side={DoubleSide}
        />
      </instancedMesh>
    </group>
  )
}
