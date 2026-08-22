'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

import { FLOATING_HINT } from '@/declarations/ui/blocks'
import { MOTION_TIMERS } from '@/declarations/ui/motion'
import { cn } from '@/utils/classnames'

/**
 * Floating hint
 * @typedef {Object} FloatingHint
 * @property {string} id - Message identifier
 * @property {string} message - Hint text
 * @property {LucideIcon} [icon] - Leading icon
 * @property {number} x - Screen x coordinate
 * @property {number} y - Screen y coordinate
 */

export interface FloatingHint {
  id: string
  message: string
  icon?: LucideIcon
  // Click origin
  x: number
  y: number
}

/**
 * Hints context
 * @typedef {Object} HintsContextValue
 * @property {FloatingHint[]} hints - Visible hints
 * @property {(message: string, origin: {x: number, y: number}, icon?: LucideIcon) => void} showHint - Raise hint
 */

interface HintsContextValue {
  hints: FloatingHint[]
  // Auto-fades after animation
  showHint: (message: string, origin: { x: number; y: number }, icon?: LucideIcon) => void
}

const HintsContext = createContext<HintsContextValue | null>(null)

/**
 * Hints provider
 * @param {Object} props - Provider config
 * @param {React.ReactNode} props.children - Tree children
 * @return {JSX.Element} - Provider with layer
 */

export const HintsProvider = ({ children }: { children: React.ReactNode }) => {
  const [hints, setHints] = useState<FloatingHint[]>([])

  const showHint = useCallback(
    (message: string, origin: { x: number; y: number }, icon?: LucideIcon) => {
      const id = crypto.randomUUID()

      setHints((current) => [...current, { id, message, icon, x: origin.x, y: origin.y }])
      setTimeout(
        () => setHints((current) => current.filter((hint) => hint.id !== id)),
        MOTION_TIMERS.hintLifetimeMs
      )
    },
    []
  )

  const value = useMemo<HintsContextValue>(() => ({ hints, showHint }), [hints, showHint])

  return (
    <HintsContext.Provider value={value}>
      {children}
      <HintLayer hints={hints} />
    </HintsContext.Provider>
  )
}

/**
 * Hint layer
 * @param {Object} props - Layer config
 * @param {FloatingHint[]} props.hints - Hints to render
 * @return {JSX.Element} - Hint overlay
 */

const HintLayer = ({ hints }: { hints: FloatingHint[] }) => (
  <div className={FLOATING_HINT.layer} aria-live="polite">
    {hints.map((hint) => {
      const Icon = hint.icon

      return (
        <span
          key={hint.id}
          className={cn(FLOATING_HINT.bubble)}
          style={{ left: hint.x, top: hint.y }}
        >
          {Icon && <Icon className={FLOATING_HINT.icon} aria-hidden="true" />}
          {hint.message}
        </span>
      )
    })}
  </div>
)

/**
 * Use hints
 * @return {HintsContextValue} - State and actions
 */

export const useHints = (): HintsContextValue => {
  const context = useContext(HintsContext)
  if (!context) throw new Error('useHints must be used within HintsProvider')

  return context
}
