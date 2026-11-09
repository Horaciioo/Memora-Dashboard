'use client'

import { create } from 'zustand'

/**
 * Ball just holed, its words floating over the cup
 * @typedef {Object} GolfCupCheer
 * @property {string} id - Ball
 * @property {number} at - Local ms
 * @property {number} x - Ball x when it dropped
 * @property {number} z - Ball z when it dropped
 */

export interface GolfCupCheer {
  id: string
  at: number
  x: number
  z: number
}

/**
 * Golf cheer store, the balls just holed
 * @typedef {Object} GolfCheerStore
 * @property {GolfCupCheer[]} cheers - Words still floating
 * @property {(id: string, x: number, z: number) => void} cheerHole - Add a ball holed
 * @property {(before: number) => void} prune - Drop the old ones
 */

interface GolfCheerStore {
  cheers: GolfCupCheer[]
  cheerHole: (id: string, x: number, z: number) => void
  prune: (before: number) => void
}

export const useGolfCheerStore = create<GolfCheerStore>()((set) => ({
  cheers: [],
  cheerHole: (id, x, z) =>
    set(({ cheers }) => ({
      cheers: [...cheers.filter((cheer) => cheer.id !== id), { id, at: performance.now(), x, z }],
    })),
  prune: (before) =>
    set(({ cheers }) => ({ cheers: cheers.filter((cheer) => cheer.at >= before) })),
}))
