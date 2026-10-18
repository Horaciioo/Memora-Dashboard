'use client'

import { useSyncExternalStore } from 'react'

// The slot never changes once the banner is mounted
const subscribeNothing = () => () => undefined

/**
 * Slot of the page banner a client component carries its content into
 * @param {string} hostId - Identifier of the slot
 * @return {HTMLElement | null} - Slot, null until the banner is mounted
 */

export const useBannerHost = (hostId: string): HTMLElement | null =>
  useSyncExternalStore(
    subscribeNothing,
    () => document.getElementById(hostId),
    () => null
  )
