'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Rail slot context
 * @typedef {Object} RailSlotContextValue
 * @property {HTMLElement | null} slot - Node replacing the rail
 * @property {(node: HTMLElement | null) => void} setSlot - Slot ref callback
 * @property {boolean} isClaimed - A page holds the rail
 * @property {() => () => void} claim - Take the rail
 */

interface RailSlotContextValue {
  slot: HTMLElement | null
  setSlot: (node: HTMLElement | null) => void
  isClaimed: boolean
  claim: () => () => void
}

const RailSlotContext = createContext<RailSlotContextValue | null>(null)

/**
 * Rail slot provider
 * @param {Object} props - Provider props
 * @param {ReactNode} props.children - Tree children
 * @return {JSX.Element}
 */

export const RailSlotProvider = ({ children }: { children: ReactNode }) => {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const [claims, setClaims] = useState(0)

  // Returns the release
  const claim = useCallback(() => {
    setClaims((count) => count + 1)

    return () => setClaims((count) => Math.max(0, count - 1))
  }, [])

  const value = useMemo(
    () => ({ slot, setSlot, isClaimed: claims > 0, claim }),
    [slot, claims, claim]
  )

  return <RailSlotContext.Provider value={value}>{children}</RailSlotContext.Provider>
}

/**
 * Read the rail slot
 * @return {RailSlotContextValue} - Slot state, inert outside
 */

export const useRailSlot = (): RailSlotContextValue =>
  useContext(RailSlotContext) ?? {
    slot: null,
    setSlot: () => undefined,
    isClaimed: false,
    claim: () => () => undefined,
  }
