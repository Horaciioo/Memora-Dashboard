import type { GolfHoleLayout, GolfPoint } from '@/core/lib/play/golf/types'

/**
 * Layout with every length scaled, heights and winds kept
 * @param {GolfHoleLayout} layout - Drawn hole
 * @param {number} k - Scale
 * @return {GolfHoleLayout} - Narrower hole
 */

export const scaleLayout = (layout: GolfHoleLayout, k: number): GolfHoleLayout => {
  const point = ([x, z]: GolfPoint): GolfPoint => [x * k, z * k]

  return {
    ...layout,
    tee: point(layout.tee),
    cup: point(layout.cup),
    pads: layout.pads.map((pad) => ({ ...pad, at: point(pad.at), size: point(pad.size) })),
    blocks: layout.blocks?.map(({ at, size }) => ({ at: point(at), size: point(size) })),
    bumpers: layout.bumpers?.map(({ at, radius }) => ({ at: point(at), radius: radius * k })),
    spinners: layout.spinners?.map((spinner) => ({
      ...spinner,
      at: point(spinner.at),
      length: spinner.length * k,
    })),
    orbs: layout.orbs?.map(point),
    portals: layout.portals?.map((portal) => ({
      ...portal,
      from: point(portal.from),
      to: point(portal.to),
    })),
    vortexes: layout.vortexes?.map(({ at, radius }) => ({ at: point(at), radius: radius * k })),
    fans: layout.fans?.map((fan) => ({ ...fan, at: point(fan.at), size: point(fan.size) })),
    totems: layout.totems?.map((totem) => ({
      ...totem,
      at: point(totem.at),
      radius: totem.radius * k,
    })),
  }
}
