'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { CourseRail } from '@/composites/academy/course/player/CourseRail'
import { CalendarRailPanel, CalendarSearchBar } from '@/composites/calendar/CalendarSidebar'
import { CalendarRailSwitch } from '@/composites/calendar/CalendarRailSwitch'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { CreatorAccountMenu } from '@/composites/shell/CreatorAccountMenu'
import { CreatorSwitch } from '@/composites/shell/CreatorSwitch'
import { RailDeadlineBubbles } from '@/composites/shell/RailDeadlineBubbles'
import { RailNav } from '@/composites/shell/RailNav'
import { RailSlides } from '@/composites/shell/RailSlides'
import { RoleSwitch } from '@/composites/shell/RoleSwitch'
import { SimulationBanner } from '@/composites/shell/SimulationBanner'
import { RailToolbar } from '@/composites/shell/RailToolbar'
import { RailShortcuts } from '@/composites/shell/RailShortcuts'
import { ReleaseNotice } from '@/composites/changelog/ReleaseNotice'
import { useCalendarRail } from '@/core/hooks/interaction/calendar/useCalendarRail'
import { useCalendarRailView } from '@/core/hooks/interaction/calendar/useCalendarRailView'
import { useRailEntries } from '@/core/hooks/interaction/layout/useRailEntries'
import { useCourseRail } from '@/core/hooks/interaction/scenes/useCourseRail'
import { useRailCompact } from '@/core/hooks/interaction/layout/useRailCompact'
import { SHELL_DIMENSIONS } from '@/declarations/ui/responsive'
import { ROUTES } from '@/declarations/navigation'
import { beaconProps } from '@/declarations/ui/beacons'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import {
  DEADLINE_NUDGE_COPY,
  MENTION_NUDGE_COPY,
  MENTION_NUDGE_SOMEONE,
} from '@/declarations/work/copy'
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
  const { isTouring, isIntroOpen, isUnlocked, next } = useTour()
  const pathname = usePathname()
  // The visit points at a page of the menu, which the calendar menu would hide
  const isPointing = isTouring && next !== null && pathname !== next
  // An open course puts its chapters where the destinations stand
  const courseRail = useCourseRail()
  // The calendar puts its month and switches there too, or steps aside for the classic menu
  const calendarRail = useCalendarRail()
  const [calendarView, chooseCalendarView] = useCalendarRailView()
  const [isRailCompact, toggleRailCompact] = useRailCompact()

  // A lone creator sits on top
  const hasCreators = viewContext.creators.length === 1

  // Chapters need their room
  const isCompact = isRailCompact && !courseRail

  // The calendar menu wears the page's own search, a folded rail keeps the classic glyphs
  const isCalendarMenu =
    Boolean(calendarRail) && calendarView === 'calendar' && !isPointing && !isCompact

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
    <RailNav
      groups={groups}
      isCompact={isCompact}
      isTouring={isTouring}
      live={viewContext.live}
      mentions={viewContext.mentions}
    />
  )

  // Shortcuts and the release notice, in every menu but a course's
  const topBlock = (
    <>
      <RailShortcuts items={shortcuts} isUnlocking={isTouring} />
      {/* Hangs under the news shortcut it announces */}
      {!isCompact && !isCalendarMenu && (
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

      {calendarRail && !courseRail && !isPointing && !isCompact && (
        <CalendarRailSwitch value={calendarView} onChange={chooseCalendarView} />
      )}

      {hasCreators && !isCompact && (
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
          <SearchLauncher
            expanded={!isCompact}
            className={isCompact ? LEFT_SIDEBAR.searchGlyph : undefined}
            iconClassName={isCompact ? LEFT_SIDEBAR.shortcutIcon : undefined}
          />
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

      {/* A late item or a mention lights its page */}
      {!courseRail && !calendarRail && !isIntroOpen && (
        <RailDeadlineBubbles
          bubbles={[
            ...(Object.keys(OVERDUE_ROUTES) as (keyof typeof OVERDUE_ROUTES)[])
              .filter((flag) => viewContext.overdue[flag])
              .map((flag) => ({ href: OVERDUE_ROUTES[flag], message: DEADLINE_NUDGE_COPY[flag] })),
            ...viewContext.mentions.map(({ href, actorName }) => ({
              href,
              message: MENTION_NUDGE_COPY.replace('{name}', actorName ?? MENTION_NUDGE_SOMEONE),
            })),
          ].filter(({ href }) => isUnlocked(href))}
        />
      )}

      {courseRail && !isCompact && <ReleaseNotice />}

      {session && (
        <div className={LEFT_SIDEBAR.footer}>
          <div className={isCompact ? LEFT_SIDEBAR.footerBare : LEFT_SIDEBAR.footerBox}>
            {viewContext.switchable && !isCompact && (
              <>
                <div className={LEFT_SIDEBAR.footerSwitch}>
                  <SimulationBanner viewContext={viewContext} />
                  <RoleSwitch viewContext={viewContext} />
                </div>
                <span className={LEFT_SIDEBAR.footerRule} aria-hidden="true" />
              </>
            )}

            <div className={LEFT_SIDEBAR.footerRow}>
              <CreatorAccountMenu viewContext={viewContext} isCompact={isCompact} />

              {/* A folded rail keeps the portrait alone */}
              {!isCompact && (
                <div className={LEFT_SIDEBAR.footerActions}>
                  <NotificationsBell
                    initialUnread={unreadCount}
                    iconClassName={LEFT_SIDEBAR.footerIcon}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
