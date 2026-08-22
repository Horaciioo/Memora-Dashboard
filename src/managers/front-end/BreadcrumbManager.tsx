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
}

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

  const value = useMemo<BreadcrumbContextValue>(
    () => ({ overrides, setLabel }),
    [overrides, setLabel]
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
