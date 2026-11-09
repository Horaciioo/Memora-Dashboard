'use client'

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

import { isPathOpenIn } from '@/declarations/features'
import type { ClosedFeatures } from '@/types/features'

/**
 * Features context
 * @typedef {Object} FeaturesContextValue
 * @property {ClosedFeatures} closed - Features closed to the viewer
 * @property {boolean} isAdmin - Viewer holds the system
 * @property {boolean} canSwitch - Viewer is the root administrator, the only one to move a switch
 * @property {(key: string) => boolean} isOpen - Feature open to the viewer
 * @property {(path: string) => boolean} isPathOpen - Screen open to the viewer
 */

interface FeaturesContextValue {
  closed: ClosedFeatures
  isAdmin: boolean
  canSwitch: boolean
  isOpen: (key: string) => boolean
  isPathOpen: (path: string) => boolean
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null)

// Nothing closed, for trees mounted outside the provider
const OPEN_EVERYTHING: FeaturesContextValue = {
  closed: {},
  isAdmin: false,
  canSwitch: false,
  isOpen: () => true,
  isPathOpen: () => true,
}

/**
 * Closed features of the viewer, resolved server-side
 * @param {Object} props - Provider config
 * @param {ClosedFeatures} props.closed - Closed features
 * @param {boolean} props.isAdmin - Viewer holds the system
 * @param {boolean} props.canSwitch - Viewer is the root administrator
 * @param {ReactNode} props.children - Tree children
 * @return {JSX.Element}
 */

export const FeaturesProvider = ({
  closed,
  isAdmin,
  canSwitch,
  children,
}: {
  closed: ClosedFeatures
  isAdmin: boolean
  canSwitch: boolean
  children: ReactNode
}) => {
  const value = useMemo<FeaturesContextValue>(
    () => ({
      closed,
      isAdmin,
      canSwitch,
      isOpen: (key) => !(key in closed),
      isPathOpen: (path) => isPathOpenIn(closed, path),
    }),
    [closed, isAdmin, canSwitch]
  )

  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>
}

/**
 * Read the features open to the viewer
 * @return {FeaturesContextValue} - Features state
 */

export const useFeatures = (): FeaturesContextValue =>
  useContext(FeaturesContext) ?? OPEN_EVERYTHING
