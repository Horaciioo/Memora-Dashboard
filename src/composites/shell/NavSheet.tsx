'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { BottomSheet } from '@/components/structures/overlays/BottomSheet'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { RailNav } from '@/composites/shell/RailNav'
import { RailShortcuts } from '@/composites/shell/RailShortcuts'
import { RoleSwitch } from '@/composites/shell/RoleSwitch'
import { SimulationBanner } from '@/composites/shell/SimulationBanner'
import { useRailEntries } from '@/core/hooks/interaction/layout/useRailEntries'
import { ROUTES } from '@/declarations/navigation'
import { NAV_SHEET, SEARCH_LAUNCHER } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { BOTTOM_SHEET } from '@/declarations/ui/variants'
import { useTour } from '@/managers/front-end/TourManager'
import type { ViewContext } from '@/types/access'
import type { SessionUser } from '@/types/auth'

export interface NavSheetProps {
  open: boolean
  viewContext: ViewContext
  unreadCount: number
  session: SessionUser
  onClose: () => void
  // Opens the account box
  onAccount: () => void
}

/**
 * The rail's pages in a sheet rising from the bottom: level switch first, then the search,
 * the shortcuts and every group
 * @param {boolean} open - Sheet is mounted
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {SessionUser} session - Signed-in member
 * @param {() => void} onClose - Dismiss handler
 * @param {() => void} onAccount - Opens the account box
 * @return {JSX.Element | null}
 */

export const NavSheet = ({
  open,
  viewContext,
  unreadCount,
  session,
  onClose,
  onAccount,
}: NavSheetProps) => {
  const pathname = usePathname()
  const { isTouring } = useTour()
  const { shortcuts, groups } = useRailEntries(viewContext)
  const BellIcon = ICONS.bell

  // A page reached by the sheet closes it
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={NAV_COPY.menuTitle}
      figure={
        <>
          <h2 className={BOTTOM_SHEET.figureTitle} aria-hidden="true">
            {NAV_COPY.menuTitle}
          </h2>
          <p className={BOTTOM_SHEET.figureLine}>{NAV_COPY.menuLine}</p>
        </>
      }
    >
      {/* A tap on any link leaves the sheet, even on the page already open */}
      <div
        className={NAV_SHEET.stack}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) onClose()
        }}
      >
        {viewContext.switchable && (
          <div className={NAV_SHEET.switch}>
            <SimulationBanner viewContext={viewContext} />
            <RoleSwitch viewContext={viewContext} />
          </div>
        )}
        <div className={NAV_SHEET.searchRow}>
          <SearchLauncher expanded className={SEARCH_LAUNCHER.sheetBar} onOpen={onClose} />
          <Link
            href={ROUTES.notifications}
            aria-label={NAV_COPY.notifications}
            className={NAV_SHEET.notifications}
          >
            <BellIcon className={NAV_SHEET.notificationsIcon} aria-hidden="true" />
            {unreadCount > 0 && <span className={NAV_SHEET.dot} aria-hidden="true" />}
          </Link>
        </div>
        <RailShortcuts items={shortcuts} isUnlocking={isTouring} />
        <RailNav
          groups={groups}
          isCompact={false}
          isTouring={isTouring}
          live={viewContext.live}
          mentions={viewContext.mentions}
        />
        <hr className={NAV_SHEET.divider} />
        <button
          type="button"
          aria-label={NAV_COPY.account}
          onClick={onAccount}
          className={NAV_SHEET.account}
        >
          <Avatar name={session.displayName} src={session.avatarUrl} size="sm" />
          <span className={NAV_SHEET.accountName}>{session.displayName}</span>
        </button>
      </div>
    </BottomSheet>
  )
}
