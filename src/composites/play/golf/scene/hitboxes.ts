import { floorHeight, isEffectActive } from '@/core/lib/play/golf'
import { CUP_HOLE } from '@/core/lib/play/golf/cup'
import type { GolfHazard, GolfHole } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { GolfPowers } from '@/utils/constants/play'

// Polyline in 3D
export type GolfHitboxLine = [number, number, number][]

/**
 * Ring of points
 * @param {number} x - Centre x
 * @param {number} y - Height
 * @param {number} z - Centre z
 * @param {number} radius - Radius
 * @return {GolfHitboxLine} - Closed ring
 */

const ringOf = (x: number, y: number, z: number, radius: number): GolfHitboxLine =>
  Array.from({ length: GOLF_SCENE.hitbox.segments + 1 }, (_, index) => {
    const angle = (index / GOLF_SCENE.hitbox.segments) * 2 * Math.PI

    return [x + Math.cos(angle) * radius, y, z + Math.sin(angle) * radius]
  })

/**
 * Wireframe of every collider of a hole, the cup disc included
 * @param {GolfHole} hole - Hole
 * @param {GolfHazard[]} hazards - Laid powers
 * @param {number} at - Server ms
 * @return {GolfHitboxLine[]} - Lines
 */

export const hitboxLines = (
  hole: GolfHole,
  hazards: GolfHazard[],
  at: number
): GolfHitboxLine[] => {
  const { lift } = GOLF_SCENE.hitbox
  const { physics, powers } = GOLF_SETTINGS
  const floorAt = (x: number, z: number) => floorHeight(hole, x, z) ?? 0

  // Walls at their contact line
  const walls = hole.walls.map((wall): GolfHitboxLine => [
    [wall.ax, wall.fa + lift, wall.az],
    [wall.bx, wall.fb + lift, wall.bz],
  ])
  // Round shapes and the spinner reach
  const bumpers = [
    ...hole.bumpers,
    ...hazards
      .filter((hazard) => hazard.power === GolfPowers.Bumper && isEffectActive(hazard, at))
      .map((hazard) => ({ x: hazard.x, z: hazard.z, r: powers.bumper.radius })),
  ].map((bumper) => ringOf(bumper.x, floorAt(bumper.x, bumper.z) + lift, bumper.z, bumper.r))
  const totems = hole.totems.map((totem) => ringOf(totem.x, totem.floor + lift, totem.z, totem.r))
  const spinners = hole.spinners.map((spinner) =>
    ringOf(
      spinner.x,
      spinner.floor + lift,
      spinner.z,
      spinner.length / 2 + physics.spinnerThickness
    )
  )
  const cup = hole.cups.flatMap(({ x, z }) => {
    const rim = floorAt(x, z) + lift

    return [
      ringOf(x, rim, z, GOLF_SETTINGS.cup.radius),
      ringOf(x, rim - GOLF_SETTINGS.cup.drop, z, CUP_HOLE),
    ]
  })

  return [...walls, ...bumpers, ...totems, ...spinners, ...cup]
}
