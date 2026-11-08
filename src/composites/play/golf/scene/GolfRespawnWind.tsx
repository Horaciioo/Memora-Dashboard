'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/paint'
import type { GolfRespawnPose } from '@/composites/play/golf/scene/respawn'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'

const { respawn } = GOLF_SCENE
const { wind } = respawn

// Golden angle spreads the squares
const TURN = 2.39996

// Shared placement helper
const dummy = new Object3D()

/**
 * Air rushing up while a ball drops back, dust ring on impact, one draw call
 * @param {Object} props - Pose and colours
 * @param {RefObject<GolfRespawnPose | null>} props.poseRef - Ball coming back
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfRespawnWind = ({
  poseRef,
  paint,
}: {
  poseRef: RefObject<GolfRespawnPose | null>
  paint: GolfPaint
}) => {
  const mesh = useRef<InstancedMesh>(null)

  useFrame(() => {
    const squares = mesh.current
    if (!squares) return
    const pose = poseRef.current
    const isDrop = pose?.phase === 'drop'
    squares.visible = Boolean(pose && (isDrop || pose.phase === 'bounce'))
    if (!pose || !squares.visible) return

    for (let index = 0; index < wind.count; index += 1) {
      const angle = index * TURN
      const share = (index % 3) / 3
      if (isDrop) {
        // Streaks trailing up behind the ball
        const radius = wind.spread * (0.5 + share)
        dummy.position.set(
          pose.x + Math.cos(angle) * radius,
          pose.y + wind.rise * ((share + pose.progress) % 1),
          pose.z + Math.sin(angle) * radius
        )
        dummy.scale.set(1, wind.streak * (1 - share * 0.5), 1)
      } else {
        // Ring of dust spreading on the ground
        const radius = wind.spread + wind.reach * pose.progress * (0.7 + share * 0.3)
        dummy.position.set(
          pose.x + Math.cos(angle) * radius,
          pose.y,
          pose.z + Math.sin(angle) * radius
        )
        dummy.scale.setScalar(Math.max(1e-3, 1 - pose.progress))
      }
      dummy.rotation.set(0, angle, 0)
      dummy.updateMatrix()
      squares.setMatrixAt(index, dummy.matrix)
    }
    squares.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, wind.count]} visible={false}>
      <boxGeometry args={[wind.size, wind.size, wind.size]} />
      <meshBasicMaterial color={paint.pole} transparent opacity={wind.opacity} depthWrite={false} />
    </instancedMesh>
  )
}
