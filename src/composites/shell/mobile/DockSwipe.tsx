'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

import { useSwipe } from '@/core/hooks/interaction/gestures/useSwipe'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { useDockEntries } from '@/core/hooks/pwa'
import { isInField, isInScroller } from '@/core/lib/gestures/scroller'
import { ROUTES } from '@/declarations/navigation'
import { DOCK_HOME_PATH } from '@/declarations/pwa/dock'
import type { ViewContext } from '@/types/access'

// Unbounded travel
const FAR = 10000

export interface DockSwipeProps {
  viewContext: ViewContext
  held: readonly string[]
  children: ReactNode
}

/**
 * Swipe sideways between the pages of the dock
 * @param {ViewContext} viewContext - View on screen
 * @param {readonly string[]} held - Pages held back on a phone
 * @param {ReactNode} children - Routed page
 * @return {JSX.Element}
 */

export const DockSwipe = ({ viewContext, held, children }: DockSwipeProps) => {
  const path = usePathname()
  const router = useRouter()
  const isMobile = useIsMobileShell()
  const { left, right } = useDockEntries(viewContext, held)

  // Dock order, Home in the middle
  const order = [
    ...left.map((item) => item.href),
    DOCK_HOME_PATH,
    ...right.map((item) => item.href),
  ]
  const index = order.findIndex((href) => path === href || path.startsWith(`${href}/`))
  const isPlay = path === ROUTES.play || path.startsWith(`${ROUTES.play}/`)
  const hasPrev = index > 0
  const hasNext = index >= 0 && index < order.length - 1

  const swipe = useSwipe({
    axis: 'x',
    enabled: isMobile && !isPlay && index >= 0,
    clamp: [hasNext ? -FAR : 0, hasPrev ? FAR : 0],
    onSwipe: (direction) => {
      const target = order[index + (direction === 'left' ? 1 : -1)]
      if (target) router.push(target)
    },
  })

  const onPointerDown = (event: ReactPointerEvent) => {
    if (isInScroller(event.target) || isInField(event.target)) return
    swipe.handlers.onPointerDown(event)
  }

  return (
    <div
      {...swipe.handlers}
      onPointerDown={onPointerDown}
      className="flex min-h-full flex-1 flex-col gap-6"
      style={{
        ...swipe.axisStyle,
        // A transform would trap fixed children, so only while dragging
        transform: swipe.offset ? `translateX(${swipe.offset}px)` : undefined,
        transition: swipe.isDragging ? 'none' : undefined,
      }}
    >
      {children}
    </div>
  )
}
