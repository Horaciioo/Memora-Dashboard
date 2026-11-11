'use client'

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { MODVIEW_MOBILE_COPY as COPY, MODVIEW_MOBILE_PAGES } from '@/declarations/modview/mobile'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import type { MobilePageKey } from '@/types/modview'
import { cn } from '@/utils/classnames'

// Name of each page
const TITLES: Record<MobilePageKey, string> = {
  settings: COPY.pageSettings,
  team: COPY.pageTeam,
  live: COPY.pageLive,
  feed: COPY.pageFeed,
}

interface Held {
  page: MobilePageKey
  // Left edge of the block in the stage, in pixels
  left: number
  // Where the finger took the block
  grab: number
  order: MobilePageKey[]
}

/**
 * Pages as dashed blocks laid along the swipe, dragged to where they should sit
 * @return {JSX.Element}
 */

export const PageOrderPanel = () => {
  const { preferences, preview } = useModPreferences()
  const stage = useRef<HTMLDivElement>(null)
  const [held, setHeld] = useState<Held | null>(null)
  const order = held?.order ?? preferences.pageOrder
  const isDefault = preferences.pageOrder.every((page, at) => page === MODVIEW_MOBILE_PAGES[at])

  const lift = (page: MobilePageKey, event: PointerEvent<HTMLDivElement>) => {
    const box = stage.current?.getBoundingClientRect()
    if (!box) return
    const slot = event.currentTarget.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)
    setHeld({
      page,
      left: slot.left - box.left,
      grab: event.clientX - slot.left,
      order: [...order],
    })
  }

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const box = stage.current?.getBoundingClientRect()
    if (!held || !box) return
    const slotWidth = box.width / held.order.length
    const left = Math.min(Math.max(event.clientX - box.left - held.grab, 0), box.width - slotWidth)
    // The block takes the slot its middle lies over
    const target = Math.min(
      held.order.length - 1,
      Math.max(0, Math.floor((left + slotWidth / 2) / slotWidth))
    )
    const next = [...held.order]
    next.splice(target, 0, next.splice(next.indexOf(held.page), 1)[0]!)
    setHeld({ ...held, left, order: next })
  }

  // The new order applies once the block is let go
  const drop = () => {
    if (held) preview({ pageOrder: held.order })
    setHeld(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className={MODVIEW_MOBILE.pagesHint}>{COPY.pagesHint}</p>
      <div className={MODVIEW_MOBILE.pagesSteps}>
        <span>{COPY.pagesFirst}</span>
        <span>{COPY.pagesLast}</span>
      </div>
      <div ref={stage} className={MODVIEW_MOBILE.pagesStage}>
        {MODVIEW_MOBILE_PAGES.map((page) => {
          const isHeld = held?.page === page

          return (
            <div
              key={page}
              className={cn(MODVIEW_MOBILE.pagesSlot, isHeld && MODVIEW_MOBILE.pagesSlotHeld)}
              style={{ left: isHeld ? `${held.left}px` : `${order.indexOf(page) * 25}%` }}
              onPointerDown={(event) => lift(page, event)}
              onPointerMove={drag}
              onPointerUp={drop}
              onPointerCancel={drop}
            >
              <div className={cn(MODVIEW_MOBILE.pagesCard, isHeld && MODVIEW_MOBILE.pagesCardHeld)}>
                {TITLES[page]}
              </div>
            </div>
          )
        })}
      </div>
      <Button
        variant="ghost"
        icon="restore"
        disabled={isDefault}
        onClick={() => preview({ pageOrder: [...MODVIEW_MOBILE_PAGES] })}
      >
        {COPY.pagesReset}
      </Button>
    </div>
  )
}
