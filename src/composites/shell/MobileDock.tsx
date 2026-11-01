'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { AccountSheet } from '@/composites/shell/AccountSheet'
import { NavSheet } from '@/composites/shell/NavSheet'
import { useNotificationFeed } from '@/core/hooks/data/system/useNotificationFeed'
import { useDockEntries, useKeyboardOpen } from '@/core/hooks/pwa'
import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { NavigationItem } from '@/declarations/navigation'
import { DOCK_COPY } from '@/declarations/pwa/copy'
import { DOCK_HOME_PATH } from '@/declarations/pwa/dock'
import { MOBILE_DOCK } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import type { LucideIcon } from '@/declarations/ui/icons'
import type { ViewContext } from '@/types/access'
import type { SessionUser } from '@/types/auth'
import { cn } from '@/utils/classnames'
import { LiveStatuses } from '@/utils/constants/lives'

export interface MobileDockProps {
  session: SessionUser
  viewContext: ViewContext
  unreadCount: number
  held: readonly string[]
}

// Glyph of the middle button
const HOME_ICON = railIcon('dashboard')

/**
 * One page of the dock
 * @param {Object} props - Entry
 * @param {NavigationItem} props.item - Destination
 * @param {LucideIcon} props.Icon - Glyph
 * @param {boolean} props.isActive - Page on screen
 * @param {boolean} props.hasDot - Something unread waits
 * @return {JSX.Element}
 */

const DockLink = ({
  item,
  Icon,
  isActive,
  hasDot,
}: {
  item: NavigationItem
  Icon: LucideIcon
  isActive: boolean
  hasDot: boolean
}) => {
  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(MOBILE_DOCK.item, isActive ? MOBILE_DOCK.itemActive : MOBILE_DOCK.itemRest)}
    >
      <Icon className={MOBILE_DOCK.icon} aria-hidden="true" />
      <span className={MOBILE_DOCK.label}>{item.label}</span>
      {hasDot && <span className={MOBILE_DOCK.dot} aria-hidden="true" />}
    </Link>
  )
}

/**
 * Phone navigation: chosen pages around Home, the full menu last
 * @param {SessionUser} session - Signed-in member
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {readonly string[]} held - Pages held back on a phone
 * @return {JSX.Element | null}
 */

export const MobileDock = ({ session, viewContext, unreadCount, held }: MobileDockProps) => {
  const pathname = usePathname()
  const [sheet, setSheet] = useState<'menu' | 'account' | null>(null)
  const { left, right } = useDockEntries(viewContext, held)
  const { unread } = useNotificationFeed(
    { entries: [], unread: unreadCount },
    NOTIFICATION_SETTINGS.panelSize
  )
  const isTyping = useKeyboardOpen()
  const MenuIcon = ICONS.menu

  const reaches = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const isHome = reaches(DOCK_HOME_PATH)

  // One drawing per side
  const linkOf = (item: NavigationItem) => (
    <DockLink
      key={item.href}
      item={item}
      // A creator on air turns the glyph into the live dot
      Icon={railIcon(
        item.onLive && viewContext.live?.status === LiveStatuses.Live ? 'liveDot' : item.icon
      )}
      isActive={reaches(item.href)}
      hasDot={false}
    />
  )

  return (
    <>
      {/* The keyboard covers the bottom edge, the dock steps aside */}
      {!isTyping && (
        <nav aria-label={DOCK_COPY.label} className={MOBILE_DOCK.bar}>
          {left.map(linkOf)}
          <Link
            href={DOCK_HOME_PATH}
            aria-label={NAV_COPY.home}
            aria-current={isHome ? 'page' : undefined}
            className={cn(MOBILE_DOCK.home, isHome ? MOBILE_DOCK.homeActive : MOBILE_DOCK.homeRest)}
          >
            <HOME_ICON className={MOBILE_DOCK.homeIcon} aria-hidden="true" />
          </Link>
          {right.map(linkOf)}
          <button
            type="button"
            aria-label={NAV_COPY.openMenu}
            aria-expanded={sheet === 'menu'}
            onClick={() => setSheet('menu')}
            className={cn(MOBILE_DOCK.item, MOBILE_DOCK.itemRest)}
          >
            <MenuIcon className={MOBILE_DOCK.icon} aria-hidden="true" />
            <span className={MOBILE_DOCK.label}>{DOCK_COPY.menu}</span>
            {unread > 0 && <span className={MOBILE_DOCK.dot} aria-hidden="true" />}
          </button>
        </nav>
      )}

      <NavSheet
        open={sheet === 'menu'}
        viewContext={viewContext}
        unreadCount={unread}
        session={session}
        onClose={() => setSheet((current) => (current === 'menu' ? null : current))}
        onAccount={() => setSheet('account')}
      />
      <AccountSheet
        open={sheet === 'account'}
        viewContext={viewContext}
        displayName={session.displayName}
        onClose={() => setSheet(null)}
      />
    </>
  )
}
