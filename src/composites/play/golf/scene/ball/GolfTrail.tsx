'use client'

import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils, Object3D, Vector3 } from 'three'
import type { Group, InstancedMesh } from 'three'

import { GRID_UNIFORMS, gridCellOf } from '@/composites/play/golf/scene/decor/grid'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { trail } = GOLF_SCENE
const { physics } = GOLF_SETTINGS
const CELL = GOLF_SETTINGS.grid.cell

interface LitCell {
  column: number
  row: number
  y: number
  born: number
}

interface TrailStore {
  cells: Map<string, LitCell>
  head: Vector3
  last: Vector3
  hasLast: boolean
  time: number
  speed: number
}

/**
 * Ground cells lit under a rolling ball, fading out behind it
 * @param {Object} props - Ball and colour
 * @param {RefObject<Group | null>} props.target - Ball group
 * @param {Color} props.color - Player colour
 * @param {Color | null} props.frozen - Ink over a rink, none otherwise
 * @return {JSX.Element}
 */

export const GolfTrail = ({
  target,
  color,
  frozen,
}: {
  target: RefObject<Group | null>
  color: Color
  frozen: Color | null
}) => {
  const tiles = useRef<InstancedMesh>(null)
  const holder = useMemo(() => new Object3D(), [])
  const tint = useMemo(
    () => frozen ?? new Color('#ffffff').lerp(color, trail.tint),
    [color, frozen]
  )
  const store = useRef<TrailStore | null>(null)

  useFrame((_, delta) => {
    const mesh = tiles.current
    const ball = target.current
    if (!mesh || !ball) return
    store.current ??= {
      cells: new Map(),
      head: new Vector3(),
      last: new Vector3(),
      hasLast: false,
      time: 0,
      speed: 0,
    }
    const state = store.current
    const { head } = state
    const step = Math.max(delta, 1 / 240)
    state.time += step
    const origin = GRID_UNIFORMS.uGridOrigin.value

    // Floor under the ball
    head.copy(ball.position)
    head.y -= physics.ballRadius * ball.scale.y - trail.lift
    const moved = state.hasLast ? head.distanceTo(state.last) : 0
    const isLost = !ball.visible || moved > trail.jump
    if (isLost) state.cells.clear()

    const rate = 1 - Math.exp(-step / trail.easeSeconds)
    state.speed += ((isLost ? 0 : moved / step) - state.speed) * rate

    // Light every cell crossed since the last frame
    if (state.speed >= trail.restSpeed && ball.visible && !isLost) {
      const hops = Math.max(1, Math.ceil(moved / (CELL / 2)))
      for (let hop = 1; hop <= hops; hop += 1) {
        const at = hop / hops
        const x = MathUtils.lerp(state.last.x, head.x, at)
        const z = MathUtils.lerp(state.last.z, head.z, at)
        const [column, row] = gridCellOf(x + origin.x, z + origin.y)
        const key = `${column}:${row}`
        state.cells.delete(key)
        state.cells.set(key, { column, row, y: head.y, born: state.time })
      }
    }
    state.hasLast = ball.visible
    state.last.copy(head)

    // Pose the lit cells, each shrinking out as it ages
    let count = 0
    for (const [key, cell] of state.cells) {
      const age = (state.time - cell.born) / trail.seconds
      if (age >= 1) {
        state.cells.delete(key)
        continue
      }
      if (count >= trail.cells) continue
      const size = CELL * trail.fill * MathUtils.clamp((1 - age) / trail.fade, 0, 1)
      holder.position.set(
        (cell.column + 0.5) * CELL - origin.x,
        cell.y,
        (cell.row + 0.5) * CELL - origin.y
      )
      holder.scale.set(size + 1e-4, trail.thickness, size + 1e-4)
      holder.updateMatrix()
      mesh.setMatrixAt(count, holder.matrix)
      count += 1
    }
    mesh.count = count
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={tiles} args={[undefined, undefined, trail.cells]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={tint} />
    </instancedMesh>
  )
}
