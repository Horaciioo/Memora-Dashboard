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
 * @property {boolean} isBare - A page wants no rail at all
 * @property {() => () => void} claimBare - Drop the rail
 */

interface RailSlotContextValue {
  slot: HTMLElement | null
  setSlot: (node: HTMLElement | null) => void
  isClaimed: boolean
  claim: () => () => void
  isBare: boolean
  claimBare: () => () => void
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
  const [bares, setBares] = useState(0)

  // Returns the release
  const claim = useCallback(() => {
    setClaims((count) => count + 1)

    return () => setClaims((count) => Math.max(0, count - 1))
  }, [])

  // Returns the release
  const claimBare = useCallback(() => {
    setBares((count) => count + 1)

    return () => setBares((count) => Math.max(0, count - 1))
  }, [])

  const value = useMemo(
    () => ({ slot, setSlot, isClaimed: claims > 0, claim, isBare: bares > 0, claimBare }),
    [slot, claims, claim, bares, claimBare]
  )

  return <RailSlotContext.Provider value={value}>{children}</RailSlotContext.Provider>
}

/**
 * Read the rail slot
 * @return {RailSlotContextValue} - Slot state
 */

export const useRailSlot = (): RailSlotContextValue =>
  useContext(RailSlotContext) ?? {
    slot: null,
    setSlot: () => undefined,
    isClaimed: false,
    claim: () => () => undefined,
    isBare: false,
    claimBare: () => () => undefined,
  }
