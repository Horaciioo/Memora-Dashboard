import { padHeight, padUnder, toPad } from '@/core/lib/play/golf/terrain'
import type { GolfHole, GolfHoleLayout, GolfPoint, GolfWall } from '@/core/lib/play/golf/types'
import { edgeWalls } from '@/core/lib/play/golf/walls'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

// Compiled once per layout
const compiled = new WeakMap<GolfHoleLayout, GolfHole>()

/**
 * Four sides of a box obstacle
 * @param {GolfHole['blocks'][number]} block - Box
 * @return {GolfWall[]} - Sides
 */

const blockWalls = ({ x0, x1, z0, z1, floor }: GolfHole['blocks'][number]): GolfWall[] =>
  [
    [x0, z0, x1, z0],
    [x1, z0, x1, z1],
    [x1, z1, x0, z1],
    [x0, z1, x0, z0],
  ].map(([ax, az, bx, bz]) => ({
    ax,
    az,
    bx,
    bz,
    fa: floor,
    fb: floor,
    top: GOLF_SETTINGS.render.blockHeight,
    kind: 'block' as const,
    nx: 0,
    nz: 0,
  }))

/**
 * Hole ready for physics, compiled once
 * @param {GolfHoleLayout} layout - Drawn hole
 * @return {GolfHole} - Compiled hole
 */

export const compileHole = (layout: GolfHoleLayout): GolfHole => {
  const known = compiled.get(layout)
  if (known) return known

  const pads = layout.pads.map(toPad)
  const floorAt = ([x, z]: GolfPoint) => {
    const pad = padUnder(pads, x, z)

    return pad ? padHeight(pad, x, z) : 0
  }
  const blocks = (layout.blocks ?? []).map(({ at, size }) => ({
    x0: at[0],
    x1: at[0] + size[0],
    z0: at[1],
    z1: at[1] + size[1],
    floor: floorAt([at[0] + size[0] / 2, at[1] + size[1] / 2]),
  }))
  const margin = GOLF_SETTINGS.physics.worldMargin
  const hole: GolfHole = {
    tee: layout.tee,
    cup: layout.cup,
    pads,
    walls: [...edgeWalls(layout.pads, pads), ...blocks.flatMap(blockWalls)],
    blocks,
    bumpers: (layout.bumpers ?? []).map(({ at, radius }, index) => ({
      id: `fixed-${index}`,
      x: at[0],
      z: at[1],
      r: radius,
    })),
    spinners: (layout.spinners ?? []).map(({ at, length, speed, phase = 0 }) => ({
      x: at[0],
      z: at[1],
      length,
      speed,
      phase,
      floor: floorAt(at),
    })),
    orbs: layout.orbs ?? [],
    portals: (layout.portals ?? []).map(({ from, to, heading }, index) => ({
      id: `portal-${index}`,
      from,
      to,
      heading: heading ?? null,
    })),
    vortexes: (layout.vortexes ?? []).map(({ at, radius }, index) => ({
      id: `vortex-${index}`,
      x: at[0],
      z: at[1],
      r: radius,
    })),
    fans: (layout.fans ?? []).map(({ at, size, push }) => {
      const length = Math.hypot(push[0], push[1]) || 1

      return {
        x0: at[0],
        x1: at[0] + size[0],
        z0: at[1],
        z1: at[1] + size[1],
        push: [push[0] / length, push[1] / length] as const,
      }
    }),
    totems: (layout.totems ?? []).map(({ at, radius, period, phase = 0 }, index) => ({
      id: `totem-${index}`,
      x: at[0],
      z: at[1],
      r: radius,
      period,
      phase,
      floor: floorAt(at),
    })),
    bounds: {
      x0: Math.min(...pads.map((pad) => pad.x0)) - margin,
      x1: Math.max(...pads.map((pad) => pad.x1)) + margin,
      z0: Math.min(...pads.map((pad) => pad.z0)) - margin,
      z1: Math.max(...pads.map((pad) => pad.z1)) + margin,
    },
  }
  compiled.set(layout, hole)

  return hole
}

/**
 * Floor height at a point
 * @param {GolfHole} hole - Hole
 * @param {number} x - Point x
 * @param {number} z - Point z
 * @return {number | null} - Height or the void
 */

export const floorHeight = (hole: GolfHole, x: number, z: number): number | null => {
  const pad = padUnder(hole.pads, x, z)

  return pad ? padHeight(pad, x, z) : null
}
