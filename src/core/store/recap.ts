'use client'

import { create } from 'zustand'

import type { Recap } from '@/types/recap'

/**
 * Recap shared by the shell, the bell and the sheet
 * @typedef {Object} RecapStore
 * @property {Recap | null} recap - Recap on the sheet
 * @property {boolean} isOpen - Deck shown
 * @property {boolean} isManual - Asked by hand, not met on arrival
 * @property {boolean} isLoading - A recap is being fetched
 * @property {boolean} isDemoOffered - The dev build can show a made-up recap
 * @property {string | null} lastSince - Start of the last window shown, a manual opening goes back to it
 */

interface RecapStore {
  recap: Recap | null
  isOpen: boolean
  isManual: boolean
  isLoading: boolean
  isDemoOffered: boolean
  lastSince: string | null
  show: (recap: Recap, isManual?: boolean) => void
  hide: () => void
  setLoading: (isLoading: boolean) => void
  offerDemo: (isOffered: boolean) => void
}

export const useRecapStore = create<RecapStore>((set) => ({
  recap: null,
  isOpen: false,
  isManual: false,
  isLoading: false,
  isDemoOffered: false,
  lastSince: null,
  show: (recap, isManual = false) => set({ recap, isOpen: true, isManual, lastSince: recap.since }),
  hide: () => set({ isOpen: false }),
  setLoading: (isLoading) => set({ isLoading }),
  offerDemo: (isDemoOffered) => set({ isDemoOffered }),
}))
