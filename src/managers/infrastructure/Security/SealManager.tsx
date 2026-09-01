'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useTwoFactor } from '@/core/hooks/data/useTwoFactor'
import type { TwoFactorCollection } from '@/core/hooks/data/useTwoFactor'
import type { SealState, TwoFactorState } from '@/types/security'

/**
 * Seal context
 * @typedef {Object} SealContextValue
 * @property {TwoFactorCollection} factor - Second factor state and mutations
 * @property {boolean} isPrompting - Unlock prompt is on screen
 * @property {() => void} promptUnlock - Ask for a code
 * @property {() => void} dismissPrompt - Close the prompt
 */

interface SealContextValue {
  factor: TwoFactorCollection
  isPrompting: boolean
  promptUnlock: () => void
  dismissPrompt: () => void
}

const SealContext = createContext<SealContextValue | null>(null)

export interface SealProviderProps {
  initialState: TwoFactorState
  initialSeal: SealState
  children: ReactNode
}

/**
 * Seal provider
 * @param {TwoFactorState} initialState - Enrolment state resolved server-side
 * @param {SealState} initialSeal - Unlock window resolved server-side
 * @param {ReactNode} children - Tree children
 * @return {JSX.Element}
 */

export const SealProvider = ({ initialState, initialSeal, children }: SealProviderProps) => {
  const factor = useTwoFactor(initialState, initialSeal)
  const [isPrompting, setPrompting] = useState(false)

  const value = useMemo<SealContextValue>(
    () => ({
      factor,
      isPrompting,
      promptUnlock: () => setPrompting(true),
      dismissPrompt: () => setPrompting(false),
    }),
    [factor, isPrompting]
  )

  return <SealContext.Provider value={value}>{children}</SealContext.Provider>
}

/**
 * Use seal context
 * @return {SealContextValue} - Seal state and prompt
 */

export const useSeal = (): SealContextValue => {
  const context = useContext(SealContext)
  if (!context) throw new Error('useSeal must be used within SealProvider')

  return context
}
