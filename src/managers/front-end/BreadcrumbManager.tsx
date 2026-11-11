'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Breadcrumb context
 * @typedef {Object} BreadcrumbContextValue
 * @property {Record<string, string>} overrides - Path label mapping
 * @property {(href: string, label: string) => void} setLabel - Register label
 */

interface BreadcrumbContextValue {
  overrides: Record<string, string>
  setLabel: (href: string, label: string) => void
  tabs: BreadcrumbTabs
  setTab: (href: string, strip: string, tab: RememberedTab) => void
}

/**
 * Tab left open on a page
 * @typedef {Object} RememberedTab
 * @property {string} value - Tab identifier
 * @property {string} label - Tab display label
 */

export interface RememberedTab {
  value: string
  label: string
}

// Open tab per strip, per page path
export type BreadcrumbTabs = Record<string, Record<string, RememberedTab>>

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

/**
 * Breadcrumb provider
 * @param {Object} props - Provider config
 * @param {ReactNode} props.children - Tree children
 * @return {JSX.Element} - Provider with state
 */

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  const setLabel = useCallback((href: string, label: string) => {
    setOverrides((current) => (current[href] === label ? current : { ...current, [href]: label }))
  }, [])

  const [tabs, setTabs] = useState<BreadcrumbTabs>({})

  const setTab = useCallback((href: string, strip: string, tab: RememberedTab) => {
    setTabs((current) => {
      const known = current[href]?.[strip]
      if (known?.value === tab.value && known.label === tab.label) return current

      return { ...current, [href]: { ...current[href], [strip]: tab } }
    })
  }, [])

  const value = useMemo<BreadcrumbContextValue>(
    () => ({ overrides, setLabel, tabs, setTab }),
    [overrides, setLabel, tabs, setTab]
  )

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

/**
 * Use breadcrumb overrides
 * @return {Record<string, string>} - Path label map
 */

export const useBreadcrumbOverrides = (): Record<string, string> =>
  useContext(BreadcrumbContext)?.overrides ?? {}

/**
 * Use breadcrumb label
 * @param {string} href - Path segment
 * @param {string | undefined} label - Label to register
 * @return {void} - Register label
 */

export const useBreadcrumbLabel = (href: string, label: string | undefined): void => {
  const context = useContext(BreadcrumbContext)
  const setLabel = context?.setLabel

  useEffect(() => {
    if (label && setLabel) setLabel(href, label)
  }, [href, label, setLabel])
}

/**
 * Use remembered tabs
 * @return {BreadcrumbTabs} - Open tabs by page path
 */

export const useBreadcrumbTabs = (): BreadcrumbTabs => useContext(BreadcrumbContext)?.tabs ?? {}

/**
 * Use tab memory
 * @param {string} href - Page path
 * @param {string} strip - Tab strip name
 * @return {{ remembered: string | undefined, remember: (tab: RememberedTab) => void }} - Memory handle
 */

export const useTabMemory = (href: string, strip: string) => {
  const context = useContext(BreadcrumbContext)
  const setTab = context?.setTab

  const remember = useCallback(
    (tab: RememberedTab) => setTab?.(href, strip, tab),
    [href, strip, setTab]
  )

  return { remembered: context?.tabs[href]?.[strip]?.value, remember }
}
