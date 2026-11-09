import type { GolfBody } from '@/core/lib/play/golf/physics/body'
import { segmentDistance } from '@/core/lib/play/golf/colliders/hit'
import type { GolfWorld } from '@/core/lib/play/golf/physics/world'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import { SECOND_MS } from '@/utils/constants/time'

const { orbs, render } = GOLF_SETTINGS

/**
 * Ground reach of a sphere contact at a height gap
 * @param {number} gap - Height between both centres
 * @param {number} radius - Ball radius
 * @return {number} - Reach on the ground, below zero when out of reach
 */

export const orbReach = (gap: number, radius: number): number => {
  const reach = orbs.radius + radius

  return Math.abs(gap) >= reach ? -1 : Math.sqrt(reach * reach - gap * gap)
}

/**
 * Ball sphere touched the orb sphere during its last move
 * @param {GolfBody} body - Body
 * @param {number[]} orb - Orb x, z and floor
 * @return {boolean} - Touched
 */

export const touchesOrb = (body: GolfBody, [x, z, floor]: number[]): boolean => {
  const reach = orbReach(floor + render.orbHover - (body.y + body.radius), body.radius)
  if (reach < 0) return false

  // Swept from the spot before the move
  return segmentDistance([x, z], [body.lastX, body.lastZ, body.x, body.z]) <= reach
}

/**
 * Free hand takes an orb it touches, a full hand says so once
 * @param {GolfWorld} world - Simulation
 * @param {GolfBody} body - Body
 * @param {number} at - Server ms
 * @return {void}
 */

export const pickOrbs = (world: GolfWorld, body: GolfBody, at: number): void => {
  world.input.hole.orbs.forEach(([x, z], index) => {
    if (world.orbs[index] > at || !touchesOrb(body, [x, z, world.orbFloors[index]])) return
    if (!body.canPick) {
      const key = `${body.id}:${index}`
      if (!world.fullHands.has(key)) world.emit('full', body.id)
      world.fullHands.add(key)
      return
    }
    world.orbs[index] = at + orbs.respawnSeconds * SECOND_MS
    body.canPick = false
    world.pickups.push({ id: body.id, orb: index, at })
    world.emit('orb', body.id)
  })
}
