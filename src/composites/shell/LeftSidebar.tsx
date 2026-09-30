'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { CourseRail } from '@/composites/academy/course/CourseRail'
import { CalendarRailPanel, CalendarSearchBar } from '@/composites/calendar/CalendarSidebar'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { CreatorAccountMenu } from '@/composites/shell/CreatorAccountMenu'
import { CreatorSwitch } from '@/composites/shell/CreatorSwitch'
import { ReleaseNotice } from '@/composites/changelog/ReleaseNotice'
import { useCalendarRail } from '@/core/hooks/interaction/useCalendarRail'
import { useCourseRail } from '@/core/hooks/interaction/useCourseRail'
import { APP_VERSION_LABEL } from '@/declarations/app'
import { ROUTE_STEPS } from '@/declarations/maturity/steps'
import { ROUTES, visibleNavGroups } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
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
  // An open course puts its chapters where the destinations stand
  const courseRail = useCourseRail()
  // The calendar puts its month and switches there too
  const calendarRail = useCalendarRail()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // A lone creator sits on top, several move to the footer box
  const hasCreators = viewContext.creators.length === 1
  const ChevronIcon = ICONS.expand

  const toggleGroup = (label: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current)

      if (next.has(label)) next.delete(label)
      else next.add(label)

      return next
    })
  }

  return (
    <aside aria-label={NAV_COPY.sidebar} className={LEFT_SIDEBAR.rail}>
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
          <SearchLauncher expanded />
        )}
      </div>

      {courseRail ? (
        <CourseRail rail={courseRail} />
      ) : calendarRail ? (
        <CalendarRailPanel {...calendarRail} />
      ) : (
        <nav className={LEFT_SIDEBAR.nav}>
          {visibleNavGroups(viewContext.view, session, can).map((group) => {
            const isGroupCollapsed = collapsedGroups.has(group.label)

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
                      const Icon = ICONS[item.icon]
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
                          className={cn(
                            LEFT_SIDEBAR.navLink,
                            isActive && LEFT_SIDEBAR.navLinkActive
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
                              steps={ROUTE_STEPS[item.href]}
                              interactive={false}
                              className={LEFT_SIDEBAR.navMaturity}
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
      <ReleaseNotice pointed />

      {session && (
        <div className={LEFT_SIDEBAR.footer}>
          <CreatorAccountMenu viewContext={viewContext} unreadCount={unreadCount} />

          <div className={LEFT_SIDEBAR.footerActions}>
            <NotificationsBell
              initialUnread={unreadCount}
              iconClassName={LEFT_SIDEBAR.footerIcon}
            />
          </div>
        </div>
      )}
    </aside>
  )
}
