'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { BeforeInstallPromptEvent } from '@/types/pwa'

/**
 * Installed application state of this tab
 * @typedef {Object} PwaStore
 * @property {ServiceWorkerRegistration | null} registration - Worker in charge
 * @property {ServiceWorker | null} waiting - New version ready
 * @property {BeforeInstallPromptEvent | null} installOffer - Browser install offer
 * @property {boolean} isOnline - Network reachable
 */

interface PwaStore {
  registration: ServiceWorkerRegistration | null
  waiting: ServiceWorker | null
  installOffer: BeforeInstallPromptEvent | null
  isOnline: boolean
  setRegistration: (registration: ServiceWorkerRegistration) => void
  setWaiting: (waiting: ServiceWorker | null) => void
  setInstallOffer: (offer: BeforeInstallPromptEvent | null) => void
  setOnline: (isOnline: boolean) => void
}

export const usePwaStore = create<PwaStore>()((set) => ({
  registration: null,
  waiting: null,
  installOffer: null,
  isOnline: true,
  setRegistration: (registration) => set({ registration }),
  setWaiting: (waiting) => set({ waiting }),
  setInstallOffer: (installOffer) => set({ installOffer }),
  setOnline: (isOnline) => set({ isOnline }),
}))

/**
 * Install hint kept in the browser
 * @typedef {Object} InstallHintStore
 * @property {number} visits - Sessions opened in this browser
 * @property {boolean} isDismissed - Refused for good
 * @property {boolean} isSnoozed - Put off until the next visit
 */

interface InstallHintStore {
  visits: number
  isDismissed: boolean
  isSnoozed: boolean
  countVisit: () => void
  snooze: () => void
  dismiss: () => void
}

export const useInstallHintStore = create<InstallHintStore>()(
  persist(
    (set) => ({
      visits: 0,
      isDismissed: false,
      isSnoozed: false,
      // A new visit lifts the snooze
      countVisit: () => set((state) => ({ visits: state.visits + 1, isSnoozed: false })),
      snooze: () => set({ isSnoozed: true }),
      dismiss: () => set({ isDismissed: true }),
    }),
    { name: 'memora:install-hint' }
  )
)
