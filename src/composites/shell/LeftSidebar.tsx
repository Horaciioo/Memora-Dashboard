'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CourseRail } from '@/composites/academy/course/CourseRail'
import { CalendarRailPanel, CalendarSearchBar } from '@/composites/calendar/CalendarSidebar'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { CreatorAccountMenu } from '@/composites/shell/CreatorAccountMenu'
import { CreatorSwitch } from '@/composites/shell/CreatorSwitch'
import { RailLiveCall } from '@/composites/shell/RailLiveCall'
import { RailToolbar } from '@/composites/shell/RailToolbar'
import { RailShortcuts } from '@/composites/shell/RailShortcuts'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { ReleaseNotice } from '@/composites/changelog/ReleaseNotice'
import { useCalendarRail } from '@/core/hooks/interaction/useCalendarRail'
import { useCourseRail } from '@/core/hooks/interaction/useCourseRail'
import { useRailCompact } from '@/core/hooks/interaction/useRailCompact'
import { APP_VERSION_LABEL } from '@/declarations/app'
import { SHELL_DIMENSIONS } from '@/declarations/ui/responsive'
import { ROUTES, visibleNavGroups } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE, beaconProps, routeBeacon } from '@/declarations/ui/beacons'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { TOUR_RAIL } from '@/declarations/ui/variants'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { railIcon } from '@/declarations/ui/railIcons'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { useTour } from '@/managers/front-end/TourManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface LeftSidebarProps {
  viewContext: ViewContext
  unreadCount: number
}

/**
 * Destinations of the signed-in member
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @return {JSX.Element}
 */

export const LeftSidebar = ({ viewContext, unreadCount }: LeftSidebarProps) => {
  const pathname = usePathname()
  const { can, session } = useAuthContext()
  // The first visit shows pages as it explains them
  const { isTouring, isUnlocked } = useTour()
  // An open course puts its chapters where the destinations stand
  const openCourse = useCourseRail()
  const courseRail = openCourse
  // The calendar puts its month and switches there too
  const calendarRail = useCalendarRail()
  const [isRailCompact, toggleRailCompact] = useRailCompact()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // A lone creator sits on top
  const hasCreators = viewContext.creators.length === 1
  const ChevronIcon = ICONS.expand

  // Chapters and the month need their room
  const isCompact = isRailCompact && !courseRail && !calendarRail

  // Windows and panels read the rail width from the body
  useEffect(() => {
    if (!isCompact) return

    const { style } = document.body
    // Restored, not removed: the layout set it inline and React won't set it again
    const previous = style.getPropertyValue('--shell-sidebar-w')

    style.setProperty('--shell-sidebar-w', `${SHELL_DIMENSIONS.sidebarCompact}px`)

    return () => {
      style.setProperty('--shell-sidebar-w', previous)
    }
  }, [isCompact])

  // The live entry leaves the groups while a live runs
  const entries = visibleNavGroups(viewContext.view, session, can, viewContext.live !== null)
  const liveItem = entries.flatMap((group) => group.items).find((item) => item.onlyLive)
  // Shortcuts leave the groups too
  const shortcuts = [
    ...entries.flatMap((group) => group.items).filter((item) => item.quick),
    { href: ROUTES.preferences, label: NAV_COPY.preferences, icon: 'settings' as const },
  ].filter((item) => isUnlocked(item.href))
  const newsAt = shortcuts.findIndex((item) => item.href === ROUTES.changelog)
  const groups = entries
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !(item.onlyLive && viewContext.live) && !item.quick && isUnlocked(item.href)
      ),
    }))
    .filter((group) => group.items.length > 0)

  const toggleGroup = (label: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current)

      if (next.has(label)) next.delete(label)
      else next.add(label)

      return next
    })
  }

  return (
    <aside
      aria-label={NAV_COPY.sidebar}
      data-compact={isCompact || undefined}
      className={LEFT_SIDEBAR.rail}
      {...beaconProps(TOUR_BEACONS.rail)}
    >
      <RailToolbar isCompact={isCompact} onToggle={toggleRailCompact} />

      {hasCreators && (
        <div className={LEFT_SIDEBAR.creatorRow}>
          <CreatorSwitch
            creators={viewContext.creators}
            activeYoutuberId={viewContext.activeYoutuberId}
          />
        </div>
      )}

      <div className={LEFT_SIDEBAR.searchRow}>
        {calendarRail ? (
          <>
            <CalendarSearchBar value={calendarRail.search} onChange={calendarRail.onSearch} />
            {/* Kept mounted so the palette shortcut still answers */}
            <div className="hidden">
              <SearchLauncher />
            </div>
          </>
        ) : (
          <SearchLauncher expanded={!isCompact} />
        )}
      </div>

      {!courseRail && !calendarRail && (
        <>
          <RailShortcuts items={shortcuts} isUnlocking={isTouring} />
          {/* Hangs under the news shortcut it announces */}
          <ReleaseNotice pointedAt={newsAt >= 0 ? (newsAt + 0.5) / shortcuts.length : undefined} />
        </>
      )}

      {liveItem && viewContext.live && !courseRail && !calendarRail && (
        <RailLiveCall item={liveItem} live={viewContext.live} />
      )}

      {courseRail ? (
        <CourseRail rail={courseRail} />
      ) : calendarRail ? (
        <CalendarRailPanel {...calendarRail} />
      ) : (
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
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
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
                            className={cn(
                              LEFT_SIDEBAR.navIcon,
                              isActive && LEFT_SIDEBAR.navIconActive
                            )}
                            aria-hidden="true"
                          />
                          <span className={LEFT_SIDEBAR.navLabel}>{item.label}</span>
                          {item.maturity && (
                            <MaturityTag
                              maturity={item.maturity}
                              interactive={false}
                              compact
                              className="rail-fold ml-auto"
                            />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      )}

      <Link href={ROUTES.changelog} className={LEFT_SIDEBAR.version}>
        {APP_VERSION_LABEL}
      </Link>
      {(courseRail || calendarRail) && <ReleaseNotice />}

      {session && (
        <div className={LEFT_SIDEBAR.footer}>
          <div className={LEFT_SIDEBAR.footerBox}>
            <CreatorAccountMenu viewContext={viewContext} unreadCount={unreadCount} />

            <div className={LEFT_SIDEBAR.footerActions}>
              <NotificationsBell
                initialUnread={unreadCount}
                iconClassName={LEFT_SIDEBAR.footerIcon}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
