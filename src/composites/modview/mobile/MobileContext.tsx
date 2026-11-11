'use client'

import { createContext, useContext } from 'react'

const MobileModContext = createContext(false)

export const MobileModProvider = MobileModContext.Provider

/**
 * True inside the phone version of the Mod View
 * @return {boolean} - Phone layout in force
 */

export const useMobileMod = (): boolean => useContext(MobileModContext)

export interface MobileSlotValue {
  // Header corner the page controls go to
  slot: HTMLElement | null
  isActive: boolean
}

const MobileSlotContext = createContext<MobileSlotValue>({ slot: null, isActive: false })

export const MobileSlotProvider = MobileSlotContext.Provider

/**
 * Header corner of the page in view
 * @return {MobileSlotValue} - Slot and whether the page shows
 */

export const useMobileSlot = (): MobileSlotValue => useContext(MobileSlotContext)
