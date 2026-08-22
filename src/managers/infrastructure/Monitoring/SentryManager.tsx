'use client'

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

import { captureException, captureMessage, isSentryEnabled, setSentryUser } from '@/core/lib/sentry'

/**
 * Sentry context value
 * @typedef {Object} SentryManagerContextValue
 * @property {(error: Error, context?: Record<string, unknown>) => void} captureException - Capture error
 * @property {(message: string, level?: Sentry.SeverityLevel) => void} captureMessage - Capture message
 * @property {(user: {id: string, identifier: string} | null) => void} setUser - Set user
 * @property {(message: string, category?: string) => void} addBreadcrumb - Add breadcrumb
 * @property {boolean} isEnabled - Enabled status
 */

interface SentryManagerContextValue {
  captureException: (error: Error, context?: Record<string, unknown>) => void
  captureMessage: (message: string, level?: Sentry.SeverityLevel) => void
  setUser: (user: { id: string; identifier: string } | null) => void
  addBreadcrumb: (message: string, category?: string) => void
  isEnabled: boolean
}

const SentryManagerContext = createContext<SentryManagerContextValue | null>(null)

/**
 * Sentry manager provider
 * @param {Object} props - Provider props
 * @param {ReactNode} props.children - Wrapped tree
 * @return {JSX.Element} - Provider
 */

export const SentryManagerProvider = ({ children }: { children: ReactNode }) => {
  // Stable helpers from module state
  const value = useMemo<SentryManagerContextValue>(
    () => ({
      captureException,
      captureMessage,
      setUser: setSentryUser,
      addBreadcrumb: (message: string, category?: string) => {
        if (!isSentryEnabled) return

        Sentry.addBreadcrumb({ message, category })
      },
      isEnabled: isSentryEnabled,
    }),
    []
  )

  return <SentryManagerContext.Provider value={value}>{children}</SentryManagerContext.Provider>
}

/**
 * Use Sentry manager
 * @return {SentryManagerContextValue} - Helpers
 */

export const useSentryManager = (): SentryManagerContextValue => {
  const context = useContext(SentryManagerContext)

  if (!context) throw new Error('useSentryManager must be used within SentryManagerProvider')

  return context
}
