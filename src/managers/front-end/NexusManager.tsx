'use client'

import { createContext, useCallback, useContext } from 'react'
import type { ReactNode } from 'react'

import { isNexusInput } from '@/core/lib/nexus/intercept'
import { NEXUS_OPEN_EVENT } from '@/declarations/nexus/unlock'

const NexusContext = createContext(false)

/**
 * Tells the page whether the console is open to this member
 * @param {Object} props - Provider config
 * @param {boolean} props.isReady - Console open to the member
 * @param {ReactNode} props.children - Subtree
 * @return {JSX.Element}
 */

export const NexusProvider = ({ isReady, children }: { isReady: boolean; children: ReactNode }) => (
  <NexusContext.Provider value={isReady}>{children}</NexusContext.Provider>
)

/**
 * Console is open to this member
 * @return {boolean} - Ready
 */

export const useNexusReady = (): boolean => useContext(NexusContext)

/**
 * Hand a typed command to the console, only for its owner
 * @return {(text: string) => boolean} - True when the console took the text
 */

export const useNexusHandoff = (): ((text: string) => boolean) => {
  const isReady = useNexusReady()

  return useCallback(
    (text: string) => {
      if (!isReady || !isNexusInput(text)) return false

      // Typed, never run: one more Enter does that
      window.dispatchEvent(new CustomEvent(NEXUS_OPEN_EVENT, { detail: { input: text.trim() } }))

      return true
    },
    [isReady]
  )
}
