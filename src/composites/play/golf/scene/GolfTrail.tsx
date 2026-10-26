'use client'

import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils, Object3D } from 'three'
import type { Group, InstancedMesh } from 'three'

import { makeTrailState, recordPath, samplePath } from '@/composites/play/golf/scene/trailPath'
import type { TrailState } from '@/composites/play/golf/scene/trailPath'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { trail } = GOLF_SCENE
const { ring } = trail
const { physics } = GOLF_SETTINGS
const TILES = trail.rows * trail.cols
const QUARTER = Math.PI / 2

// Stable 0..1 per tile
const chance = (index: number): number => {
  const value = Math.sin((index + 1) * 12.9898) * 43758.5453

  return value - Math.floor(value)
}

const CHANCES = Array.from({ length: TILES }, (_, index) => chance(index))

/**
 * Shortest turn of a square
 * @param {number} from - Start angle
 * @param {number} to - End angle
 * @return {number} - Shortest step
 */

const squareTurn = (from: number, to: number): number =>
  MathUtils.euclideanModulo(to - from + QUARTER / 2, QUARTER) - QUARTER / 2

/**
 * Square tiles lying on the path behind a rolling ball, and circling it at rest
 * @param {Object} props - Ball and colour
 * @param {RefObject<Group | null>} props.target - Ball group
 * @param {Color} props.color - Player colour
 * @return {JSX.Element}
 */

export const GolfTrail = ({ target, color }: { target: RefObject<Group | null>; color: Color }) => {
  const tiles = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const tint = useMemo(() => new Color('#ffffff').lerp(color, trail.tint), [color])
  const store = useRef<TrailState | null>(null)

  useFrame((_, delta) => {
    const mesh = tiles.current
    const ball = target.current
    if (!mesh || !ball) return
    store.current ??= makeTrailState(trail.rows, TILES)
    const state = store.current
    const { head, last, points, samples, mix } = state
    const step = Math.max(delta, 1 / 240)
    state.time += step

    // Floor under the ball
    head.copy(ball.position)
    head.y -= physics.ballRadius * ball.scale.y - trail.lift
    const moved = state.hasLast ? head.distanceTo(last) : 0
    const isLost = !ball.visible || moved > trail.jump
    if (isLost) points.length = 0
    state.hasLast = ball.visible
    last.copy(head)

    // Smoothed speed
    const rate = 1 - Math.exp(-step / trail.easeSeconds)
    state.speed += ((isLost ? 0 : moved / step) - state.speed) * rate
    const isResting = state.speed < trail.restSpeed
    if (isResting) points.length = 0
    else recordPath(points, head, trail.step, trail.points)

    // Path rows and length
    const reached = samplePath({
      points,
      head,
      start: trail.start,
      pitch: trail.pitch,
      out: samples,
    })
    const wanted = MathUtils.lerp(
      trail.lengthMin,
      trail.lengthMax,
      MathUtils.clamp(state.speed / trail.fullSpeed, 0, 1)
    )
    const rowSpan = Math.max(1, Math.min(wanted / trail.pitch, reached))
    const centre = (trail.cols - 1) / 2
    const pulse = 1 + Math.sin(state.time * ring.pulseSpeed) * ring.pulse

    for (let index = 0; index < TILES; index += 1) {
      const row = Math.floor(index / trail.cols)
      const side = (index % trail.cols) - centre
      const luck = CHANCES[index]

      // Ease towards ring or ribbon
      const goal = isResting && ball.visible ? 1 : 0
      const speed = (goal ? ring.gather : ring.release) * (0.7 + luck * 0.6)
      mix[index] += (goal - mix[index]) * (1 - Math.exp(-step * speed))
      const blend = MathUtils.smoothstep(mix[index], 0, 1)

      // Ribbon pose, tapered and ragged
      const sample = samples[row]
      const along = row / rowSpan
      const half = MathUtils.lerp(trail.near, trail.far, along)
      const edge = MathUtils.clamp(half + 0.5 - Math.abs(side), 0, 1)
      const limit = trail.solid + (1 - trail.solid) * luck
      const tail = MathUtils.clamp((limit - along) / trail.fade, 0, 1)
      const twinkle =
        1 -
        trail.twinkle *
          (0.5 + 0.5 * Math.sin(state.time * trail.twinkleSpeed - row * 0.9 + side * 1.7))
      const isOnPath = row < reached && !isLost
      const ribbonSize = isOnPath
        ? trail.size * edge * tail * twinkle * (1 - trail.taper * along)
        : 0
      const turn = Math.atan2(-sample.forward.z, sample.forward.x)
      const lateral = side * trail.pitch
      const ribbonX = sample.position.x - sample.forward.z * lateral
      const ribbonZ = sample.position.z + sample.forward.x * lateral

      // Ring pose, one tile per slot
      const slot = index % ring.tiles
      const angle = (slot / ring.tiles) * Math.PI * 2 + state.time * ring.spin
      const wave =
        1 - ring.wave * (0.5 + 0.5 * Math.sin(state.time * trail.twinkleSpeed - slot * 1.3))
      const ringSize = index < ring.tiles ? trail.size * wave : 0
      const reach = ring.radius * pulse

      // Blend both poses
      holder.position.set(
        MathUtils.lerp(ribbonX, head.x + Math.cos(angle) * reach, blend),
        head.y,
        MathUtils.lerp(ribbonZ, head.z + Math.sin(angle) * reach, blend)
      )
      holder.rotation.set(0, turn + squareTurn(turn, -angle) * blend, 0)
      const size = MathUtils.lerp(ribbonSize, ringSize, blend)
      holder.scale.set(size + 1e-4, size * 0.2 + 1e-4, size + 1e-4)
      holder.updateMatrix()
      mesh.setMatrixAt(index, holder.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={tiles} args={[undefined, undefined, TILES]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={tint} />
    </instancedMesh>
  )
}
