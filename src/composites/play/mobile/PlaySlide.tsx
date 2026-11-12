'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { PointerEvent as ReactPointerEvent } from 'react'

import { playTabIndexOf, PLAY_PHONE_TABS } from '@/composites/play/mobile/tabs'
import { isInScroller } from '@/core/lib/gestures/scroller'
import { useSwipe } from '@/core/hooks/interaction/gestures/useSwipe'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { PLAY_TABS } from '@/declarations/ui/variants'
import { ROUTES } from '@/declarations/navigation'

// Pages where a game fills the screen
const SESSION_PREFIX = ROUTES.playSession('')

// Unbounded travel
const FAR = 10000

/**
 * Page slides in from the side of its tab
 * @param {Object} props - Page
 * @param {ReactNode} props.children - Play page
 * @return {JSX.Element}
 */

export const PlaySlide = ({ children }: { children: ReactNode }) => {
  const path = usePathname()
  const router = useRouter()
  const isMobile = useIsMobileShell()
  const phoneIndex = playTabIndexOf(path, PLAY_PHONE_TABS)
  const hasPrev = phoneIndex > 0
  const hasNext = phoneIndex < PLAY_PHONE_TABS.length - 1
  const [seen, setSeen] = useState({ path, index: playTabIndexOf(path), from: '' })

  // Direction from the tab left behind
  if (seen.path !== path) {
    const index = playTabIndexOf(path)
    const from =
      index > seen.index
        ? PLAY_TABS.slideRight
        : index < seen.index
          ? PLAY_TABS.slideLeft
          : PLAY_TABS.slideUp
    setSeen({ path, index, from })
  }

  const swipe = useSwipe({
    axis: 'x',
    enabled: isMobile && !path.startsWith(SESSION_PREFIX),
    clamp: [hasNext ? -FAR : 0, hasPrev ? FAR : 0],
    onSwipe: (direction) => {
      const target = PLAY_PHONE_TABS[phoneIndex + (direction === 'left' ? 1 : -1)]
      if (target) router.push(target.href)
    },
  })

  const onPointerDown = (event: ReactPointerEvent) => {
    if (isInScroller(event.target)) return
    swipe.handlers.onPointerDown(event)
  }

  return (
    <div
      key={path}
      className={`${PLAY_TABS.slide} ${seen.from}`}
      {...swipe.handlers}
      onPointerDown={onPointerDown}
      style={{
        ...swipe.axisStyle,
        transform: swipe.offset ? `translateX(${swipe.offset}px)` : undefined,
        transition: swipe.isDragging ? 'none' : undefined,
      }}
    >
      {children}
    </div>
  )
}
