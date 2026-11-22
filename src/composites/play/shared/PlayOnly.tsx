'use client'

import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'

export interface PlayOnlyProps {
  // Screen the content is drawn for
  on: 'phone' | 'desk'
  children: ReactNode
}

// Nothing to subscribe to: only the server and hydration answer differently
const noSubscription = () => () => undefined

/**
 * Content for one screen kind: both sit in the first paint, hidden by CSS, then the other one leaves the DOM
 * @param {PlayOnlyProps} props - Screen and content
 * @return {JSX.Element | null}
 */

export const PlayOnly = ({ on, children }: PlayOnlyProps) => {
  const isPhone = useIsMobileShell()
  // The server cannot tell the screen, so CSS leads until hydration is done
  const isReady = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false
  )

  if (isReady && isPhone !== (on === 'phone')) return null

  return <>{children}</>
}
