'use client'

import type { CSSProperties } from 'react'

import { useSwipe } from '@/core/hooks/interaction/useSwipe'

// UseTabSwipeOptions
export interface UseTabSwipeOptions {
  // Ordered keys of the
  keys: string[]
  activeKey: string
  onChange: (key: string) => void
  enabled?: boolean
}

// UseTabSwipeResult
export interface UseTabSwipeResult {
  handlers: ReturnType<typeof useSwipe>['handlers']
  style: CSSProperties
}

/**
 * Horizontal swipe over a tabbed screen, moving to the neighbouring tab
 * @param {UseTabSwipeOptions} options - Ordered keys, active key and change handler
 * @return {UseTabSwipeResult} - Handlers and the axis lock style for the panel container
 */

export const useTabSwipe = ({
  keys,
  activeKey,
  onChange,
  enabled = true,
}: UseTabSwipeOptions): UseTabSwipeResult => {
  const { handlers, axisStyle } = useSwipe({
    axis: 'x',
    enabled: enabled && keys.length > 1,
    onSwipe: (direction) => {
      const index = keys.indexOf(activeKey)
      if (index === -1) return

      const next = direction === 'left' ? index + 1 : index - 1
      const key = keys[next]

      if (key) onChange(key)
    },
  })

  return { handlers, style: axisStyle }
}
