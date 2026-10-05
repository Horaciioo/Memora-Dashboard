'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { LiveStartedBubble } from '@/composites/lives/LiveStartedBubble'
import type { NavigationItem } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface RailLiveCallProps {
  item: NavigationItem
  live: NonNullable<ViewContext['live']>
}

/**
 * Live link under the search
 * @param {NavigationItem} item - Live entry
 * @param {ViewContext['live']} live - Open live
 * @return {JSX.Element}
 */

export const RailLiveCall = ({ item, live }: RailLiveCallProps) => {
  const pathname = usePathname()
  const [isClicked, setClicked] = useState(false)
  const ArrowIcon = ICONS.next

  // Light runs until opened
  const isWaiting = !isClicked && !pathname.startsWith(item.href)

  return (
    <div className={LEFT_SIDEBAR.liveRow}>
      <Link
        href={item.href}
        onClick={() => setClicked(true)}
        {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
        className={LEFT_SIDEBAR.liveLink}
      >
        <span className={cn(LEFT_SIDEBAR.liveLabel, isWaiting && LEFT_SIDEBAR.liveSweep)}>
          {item.label}
        </span>
        <ArrowIcon className={LEFT_SIDEBAR.liveArrow} aria-hidden="true" />
      </Link>
      {live.unseenStart && (
        <LiveStartedBubble liveId={live.unseenStart.id} creator={live.unseenStart.creator} />
      )}
    </div>
  )
}
