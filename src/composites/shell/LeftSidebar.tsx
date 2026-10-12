'use client'

import { useEffect } from 'react'
import { CourseRail } from '@/composites/academy/course/CourseRail'
import { CalendarRailPanel, CalendarSearchBar } from '@/composites/calendar/CalendarSidebar'
import { CalendarRailSwitch } from '@/composites/calendar/CalendarRailSwitch'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { CreatorAccountMenu } from '@/composites/shell/CreatorAccountMenu'
import { CreatorSwitch } from '@/composites/shell/CreatorSwitch'
import { RailDeadlineBubble } from '@/composites/shell/RailDeadlineBubble'
import { RailNav } from '@/composites/shell/RailNav'
import { RailSlides } from '@/composites/shell/RailSlides'
import { RoleSwitch } from '@/composites/shell/RoleSwitch'
import { ViewToggle } from '@/composites/shell/ViewToggle'
import { RailToolbar } from '@/composites/shell/RailToolbar'
import { RailShortcuts } from '@/composites/shell/RailShortcuts'
import { ReleaseNotice } from '@/composites/changelog/ReleaseNotice'
import { useCalendarRail } from '@/core/hooks/interaction/useCalendarRail'
import { useCalendarRailView } from '@/core/hooks/interaction/useCalendarRailView'
import { useRailEntries } from '@/core/hooks/interaction/useRailEntries'
import { useCourseRail } from '@/core/hooks/interaction/useCourseRail'
import { useRailCompact } from '@/core/hooks/interaction/useRailCompact'
import { SHELL_DIMENSIONS } from '@/declarations/ui/responsive'
import { ROUTES } from '@/declarations/navigation'
import { beaconProps } from '@/declarations/ui/beacons'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { DEADLINE_NUDGE_COPY } from '@/declarations/work/copy'
import { OVERDUE_ROUTES } from '@/declarations/work/registries'
import { useTour } from '@/managers/front-end/TourManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'

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
  const { session } = useAuthContext()
  const { isTouring, isIntroOpen, isUnlocked } = useTour()
  // An open course puts its chapters where the destinations stand
  const courseRail = useCourseRail()
  // The calendar puts its month and switches there too, or steps aside for the classic menu
  const calendarRail = useCalendarRail()
  const [calendarView, chooseCalendarView] = useCalendarRailView()
  const [isRailCompact, toggleRailCompact] = useRailCompact()

  // A lone creator sits on top
  const hasCreators = viewContext.creators.length === 1

  // The calendar menu wears the page's own search and hides the shortcuts
  const isCalendarMenu = Boolean(calendarRail) && calendarView === 'calendar'

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

  const { shortcuts, groups } = useRailEntries(viewContext)
  const newsAt = shortcuts.findIndex((item) => item.href === ROUTES.changelog)

  const nav = (
    <RailNav groups={groups} isCompact={isCompact} isTouring={isTouring} live={viewContext.live} />
  )

  // Shortcuts and the release notice, in every menu but a course's
  const topBlock = (
    <>
      <RailShortcuts items={shortcuts} isUnlocking={isTouring} />
      {/* Hangs under the news shortcut it announces */}
      {!isCompact && (
        <ReleaseNotice pointedAt={newsAt >= 0 ? (newsAt + 0.5) / shortcuts.length : undefined} />
      )}
    </>
  )

  return (
    <aside
      aria-label={NAV_COPY.sidebar}
      data-compact={isCompact || undefined}
      className={LEFT_SIDEBAR.rail}
      {...beaconProps(TOUR_BEACONS.rail)}
    >
      <RailToolbar isCompact={isCompact} onToggle={toggleRailCompact} />

      {calendarRail && !courseRail && (
        <CalendarRailSwitch value={calendarView} onChange={chooseCalendarView} />
      )}

      {hasCreators && (
        <div className={LEFT_SIDEBAR.creatorRow}>
          <CreatorSwitch
            creators={viewContext.creators}
            activeYoutuberId={viewContext.activeYoutuberId}
          />
        </div>
      )}

      <div className={LEFT_SIDEBAR.searchRow}>
        {isCalendarMenu && calendarRail ? (
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

      {!courseRail && topBlock}

      {courseRail ? (
        <CourseRail rail={courseRail} />
      ) : calendarRail ? (
        <RailSlides
          index={isCalendarMenu ? 0 : 1}
          panes={[<CalendarRailPanel key="calendar" {...calendarRail} />, nav]}
        />
      ) : (
        nav
      )}

      {/* A late item lights its page */}
      {!courseRail &&
        !calendarRail &&
        !isIntroOpen &&
        (Object.keys(OVERDUE_ROUTES) as (keyof typeof OVERDUE_ROUTES)[])
          .filter((flag) => viewContext.overdue[flag] && isUnlocked(OVERDUE_ROUTES[flag]))
          .map((flag) => (
            <RailDeadlineBubble
              key={flag}
              href={OVERDUE_ROUTES[flag]}
              message={DEADLINE_NUDGE_COPY[flag]}
            />
          ))}

      {courseRail && !isCompact && <ReleaseNotice />}

      {session && (
        <div className={LEFT_SIDEBAR.footer}>
          <div className={LEFT_SIDEBAR.footerBox}>
            {viewContext.switchable && (
              <>
                <div className={LEFT_SIDEBAR.footerSwitch}>
                  {isCompact ? (
                    <ViewToggle viewContext={viewContext} />
                  ) : (
                    <RoleSwitch viewContext={viewContext} />
                  )}
                </div>
                <span className={LEFT_SIDEBAR.footerRule} aria-hidden="true" />
              </>
            )}

            <div className={LEFT_SIDEBAR.footerRow}>
              <CreatorAccountMenu viewContext={viewContext} />

              <div className={LEFT_SIDEBAR.footerActions}>
                <NotificationsBell
                  initialUnread={unreadCount}
                  iconClassName={LEFT_SIDEBAR.footerIcon}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
