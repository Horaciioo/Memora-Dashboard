'use client'

import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import type { Group, InstancedMesh, Mesh, MeshBasicMaterial } from 'three'

import { fxStage } from '@/composites/play/golf/scene/fx/stage'
import type { GolfPowerClock } from '@/composites/play/golf/scene/fx/stage'
import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import { GOLF_POWER_FX } from '@/declarations/play/golf/fx'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import type { GolfPowerName } from '@/utils/constants/play'

const { castBurst } = GOLF_SCENE

// Golden angle spreads the squares
const TURN = 2.39996

// Shared placement helper
const dummy = new Object3D()

/**
 * Power changing right now on a ball, newest first
 * @param {GolfPowerClock} clock - Power times
 * @param {number} now - Local ms
 * @return {{ power: GolfPowerName, isEnd: boolean, t: number } | null} - Change
 */

const changeOf = (clock: GolfPowerClock, now: number) => {
  let found: { power: GolfPowerName; isEnd: boolean; t: number; at: number } | null = null
  for (const [power, times] of clock) {
    const { stage, t } = fxStage(times, now, GOLF_POWER_FX[power])
    if (stage !== 'cast' && stage !== 'end') continue
    const at = stage === 'end' ? (times.off ?? 0) : times.on
    if (!found || at > found.at) found = { power, isEnd: stage === 'end', t, at }
  }

  return found
}

/**
 * Squares bursting out of a ball a power lands on, a smaller puff when it wears off, tinted bonus or malus
 * @param {Object} props - Ball and colours
 * @param {RefObject<Group | null>} props.target - Ball drawn
 * @param {RefObject<GolfPowerClock>} props.clockRef - Power times of the ball
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfCastBurst = ({
  target,
  clockRef,
  paint,
}: {
  target: RefObject<Group | null>
  clockRef: RefObject<GolfPowerClock>
  paint: GolfPaint
}) => {
  const squares = useRef<InstancedMesh>(null)
  const ring = useRef<Mesh>(null)

  useFrame(() => {
    const mesh = squares.current
    const halo = ring.current
    const ball = target.current
    if (!mesh || !halo || !ball) return
    const change = changeOf(clockRef.current, performance.now())
    mesh.visible = Boolean(change) && ball.visible
    halo.visible = mesh.visible
    if (!change || !mesh.visible) return

    const color = GOLF_POWERS.get(change.power).isBonus ? paint['aim-low'] : paint.bad
    ;(mesh.material as MeshBasicMaterial).color.copy(color)
    const ringMaterial = halo.material as MeshBasicMaterial
    ringMaterial.color.copy(color)
    ringMaterial.opacity = 1 - change.t
    const reach = castBurst.reach * (change.isEnd ? castBurst.endShare : 1)
    const { x, y, z } = ball.position
    halo.position.set(x, y, z)
    halo.scale.setScalar(Math.max(1e-3, castBurst.ring + change.t * reach * 2))

    for (let index = 0; index < castBurst.count; index += 1) {
      const angle = index * TURN
      const spread = reach * change.t * (0.6 + (index % 4) * 0.13)
      dummy.position.set(
        x + Math.cos(angle) * spread,
        y + castBurst.rise * change.t * (1 - change.t) * 4 * ((index % 3) / 3),
        z + Math.sin(angle) * spread
      )
      dummy.rotation.set(angle, angle * 2, 0)
      dummy.scale.setScalar(Math.max(1e-3, 1 - change.t))
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh
        ref={squares}
        args={[undefined, undefined, castBurst.count]}
        visible={false}
        frustumCulled={false}
      >
        <boxGeometry args={[castBurst.size, castBurst.size, castBurst.size]} />
        <meshBasicMaterial depthWrite={false} />
      </instancedMesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[castBurst.ringInner, 1, castBurst.segments]} />
        <meshBasicMaterial transparent depthWrite={false} />
      </mesh>
    </>
  )
}
