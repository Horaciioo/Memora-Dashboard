'use client'

import { create } from 'zustand'

/**
 * Speed readout of a Concordat game, hidden until the gauge key opens it
 * @typedef {Object} ConcordatMeterStore
 * @property {boolean} isOpen - Readout shown
 * @property {() => void} toggle - Open or close it
 */

interface ConcordatMeterStore {
  isOpen: boolean
  toggle: () => void
}

export const useConcordatMeterStore = create<ConcordatMeterStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
