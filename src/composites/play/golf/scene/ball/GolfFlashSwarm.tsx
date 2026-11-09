'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D } from 'three'
import type { Group, InstancedMesh } from 'three'

import { isTrackOver } from '@/core/lib/play/golf'
import type { GolfMotion } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { swarm } = GOLF_SCENE

// Spot of the ball at a moment
interface Waypoint {
  x: number
  y: number
  z: number
  time: number
}

/**
 * Rainbow cubes streaming behind a flashed ball for the whole stroke
 * @param {Object} props - Ball and motion
 * @param {RefObject<Group | null>} props.target - Ball group
 * @param {RefObject<GolfMotion>} props.motionRef - Motion
 * @param {string} props.id - Ball account
 * @return {JSX.Element}
 */

export const GolfFlashSwarm = ({
  target,
  motionRef,
  id,
}: {
  target: RefObject<Group | null>
  motionRef: RefObject<GolfMotion>
  id: string
}) => {
  const cubes = useRef<InstancedMesh>(null)
  const path = useRef<Waypoint[]>([])
  const level = useRef(0)
  const holder = useMemo(() => new Object3D(), [])
  const tint = useMemo(() => new Color(), [])

  // Instance colours exist from the start
  useLayoutEffect(() => {
    for (let index = 0; index < swarm.count; index += 1) cubes.current?.setColorAt(index, tint)
  }, [tint])

  useFrame(({ clock }, delta) => {
    const mesh = cubes.current
    const ball = target.current
    if (!mesh || !ball) return
    const track = motionRef.current.tracks.get(id)
    const isActive = Boolean(
      track?.isFlash && !isTrackOver(track, performance.now()) && ball.visible
    )
    level.current += ((isActive ? 1 : 0) - level.current) * (1 - Math.exp(-delta * swarm.ease))
    // Nothing left to show
    if (!isActive && level.current < 0.01) {
      mesh.visible = false
      path.current.length = 0
      return
    }
    mesh.visible = true
    const time = clock.elapsedTime

    // Remember the path just run
    if (isActive) {
      path.current.push({ x: ball.position.x, y: ball.position.y, z: ball.position.z, time })
      while (path.current.length > 1 && path.current[0].time < time - swarm.seconds) {
        path.current.shift()
      }
    }

    // Each cube sits further back, circling the path
    let waypoint = path.current.length - 1
    for (let index = 0; index < swarm.count; index += 1) {
      const share = index / swarm.count
      const wanted = time - share * swarm.seconds
      while (waypoint > 0 && path.current[waypoint].time > wanted) waypoint -= 1
      const spot = path.current[waypoint] ?? ball.position
      const angle = time * swarm.spin + index * swarm.turn
      const reach = swarm.spread * (0.25 + share)
      const twinkle =
        1 - swarm.twinkle * (0.5 + 0.5 * Math.sin(time * swarm.twinkleSpeed + index * swarm.turn))
      holder.position.set(
        spot.x + Math.cos(angle) * reach,
        spot.y + swarm.lift + Math.sin(angle * swarm.wave) * reach * swarm.flatten,
        spot.z + Math.sin(angle) * reach
      )
      holder.rotation.set(angle, angle * swarm.wave, 0)
      holder.scale.setScalar(
        swarm.size * (1 - swarm.shrink * share) * twinkle * level.current + 1e-4
      )
      holder.updateMatrix()
      mesh.setMatrixAt(index, holder.matrix)
      mesh.setColorAt(index, tint.setHSL((share + time * swarm.hue) % 1, 1, 0.6))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={cubes}
      args={[undefined, undefined, swarm.count]}
      frustumCulled={false}
      visible={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="white" toneMapped={false} />
    </instancedMesh>
  )
}
