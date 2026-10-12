'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LiveStartedBubble } from '@/composites/lives/LiveStartedBubble'
import { visibleNavGroups } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import { TOUR_RAIL } from '@/declarations/ui/variants'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface RailNavProps {
  groups: ReturnType<typeof visibleNavGroups>
  isCompact: boolean
  isTouring: boolean
  live: ViewContext['live']
}

/**
 * Destinations of the rail, grouped and foldable
 * @param {ReturnType<typeof visibleNavGroups>} groups - Groups to draw
 * @param {boolean} isCompact - Rail is folded to its glyphs
 * @param {boolean} isTouring - First visit tour is running
 * @param {ViewContext['live']} live - Open live, lights its entry
 * @return {JSX.Element}
 */

export const RailNav = ({ groups, isCompact, isTouring, live }: RailNavProps) => {
  const pathname = usePathname()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const ChevronIcon = ICONS.expand
  // Live entry, light runs until opened
  const [openedLive, setOpenedLive] = useState(false)
  const [liveAnchor, setLiveAnchor] = useState<HTMLElement | null>(null)

  const toggleGroup = (label: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current)

      if (next.has(label)) next.delete(label)
      else next.add(label)

      return next
    })
  }

  return (
    <nav className={LEFT_SIDEBAR.nav}>
      {groups.map((group) => {
        const isGroupCollapsed = collapsedGroups.has(group.label) && !isCompact

        return (
          <div key={group.label} className={LEFT_SIDEBAR.navGroup}>
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              aria-expanded={!isGroupCollapsed}
              className={LEFT_SIDEBAR.navGroupLabel}
            >
              {group.label}
              <ChevronIcon
                className={cn(
                  LEFT_SIDEBAR.navGroupChevron,
                  isGroupCollapsed && LEFT_SIDEBAR.navGroupChevronCollapsed
                )}
                aria-hidden="true"
              />
            </button>

            <div className="fold" data-open={!isGroupCollapsed} inert={isGroupCollapsed}>
              <div className={LEFT_SIDEBAR.navGroupItems}>
                {group.items.map((item) => {
                  const Icon = railIcon(item.icon)
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const isLit = Boolean(item.onLive && live) && !openedLive && !isActive

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      ref={item.onLive ? setLiveAnchor : undefined}
                      onClick={item.onLive ? () => setOpenedLive(true) : undefined}
                      title={isCompact ? item.label : undefined}
                      aria-label={isCompact ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
                      className={cn(
                        LEFT_SIDEBAR.navLink,
                        isActive && LEFT_SIDEBAR.navLinkActive,
                        isTouring && TOUR_RAIL.unlock
                      )}
                    >
                      <Icon
                        className={cn(LEFT_SIDEBAR.navIcon, isActive && LEFT_SIDEBAR.navIconActive)}
                        aria-hidden="true"
                      />
                      <span className={LEFT_SIDEBAR.navLabel}>{item.label}</span>
                      {isLit && (
                        <span className={LEFT_SIDEBAR.livePulse} aria-hidden="true">
                          <span className={LEFT_SIDEBAR.livePulseRing} />
                          <span className={LEFT_SIDEBAR.livePulseDot} />
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Out of the folds, which clip */}
      {live?.unseenStart &&
        liveAnchor &&
        createPortal(
          <div
            className={LEFT_SIDEBAR.liveBubbleAnchor}
            style={{
              left: liveAnchor.getBoundingClientRect().right,
              top:
                liveAnchor.getBoundingClientRect().top +
                liveAnchor.getBoundingClientRect().height / 2,
            }}
          >
            <LiveStartedBubble liveId={live.unseenStart.id} />
          </div>,
          document.body
        )}
    </nav>
  )
}
