'use client'

import { create } from 'zustand'

import type { PlayTrophyRarity } from '@/declarations/play/trophies'
import type { IconName } from '@/declarations/ui/icons'

/**
 * What a celebration announces
 * @typedef {Object} PlayCelebrationItem
 */

export type PlayCelebrationItem =
  | { kind: 'quest'; xp: number }
  | { kind: 'trophy'; label: string; goal: string; icon: IconName; rarity: PlayTrophyRarity }
  | { kind: 'level'; level: number }

export type PlayCelebrationEntry = PlayCelebrationItem & { id: number }

/**
 * Celebration store, one at a time, the others wait their turn
 * @typedef {Object} PlayCelebrationStore
 * @property {PlayCelebrationEntry[]} queue - Celebrations waiting, the first one on screen
 * @property {(item: PlayCelebrationItem) => void} fire - Queue a celebration
 * @property {() => void} next - Drop the one on screen
 */

interface PlayCelebrationStore {
  queue: PlayCelebrationEntry[]
  fire: (item: PlayCelebrationItem) => void
  next: () => void
}

let counter = 0

export const usePlayCelebrationStore = create<PlayCelebrationStore>()((set) => ({
  queue: [],
  fire: (item) => set(({ queue }) => ({ queue: [...queue, { ...item, id: (counter += 1) }] })),
  next: () => set(({ queue }) => ({ queue: queue.slice(1) })),
}))
