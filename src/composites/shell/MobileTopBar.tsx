'use client'

import { useState } from 'react'
import { AccountSheet } from '@/composites/shell/AccountSheet'
import { NavSheet } from '@/composites/shell/NavSheet'
import { TOP_BAR_CRUMBS_HOST_ID, TOP_BAR_TOOLS_HOST_ID } from '@/declarations/ui/banners'
import { TOP_BAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import type { ViewContext } from '@/types/access'
import type { SessionUser } from '@/types/auth'

export interface MobileTopBarProps {
  session: SessionUser
  viewContext: ViewContext
  unreadCount: number
}

/**
 * Top bar of the mobile shell holding the menu
 * @param {SessionUser} session - Signed-in member
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @return {JSX.Element}
 */

export const MobileTopBar = ({ session, viewContext, unreadCount }: MobileTopBarProps) => {
  const [isAccountOpen, setAccountOpen] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const MenuIcon = ICONS.menu

  return (
    <header className={TOP_BAR.bar}>
      <button
        type="button"
        aria-label={NAV_COPY.openMenu}
        onClick={() => setMenuOpen(true)}
        className={TOP_BAR.menuButton}
      >
        <MenuIcon className={TOP_BAR.menuIcon} aria-hidden="true" />
      </button>
      {/* The page trail lands here, carried by the page banner */}
      <div id={TOP_BAR_CRUMBS_HOST_ID} className={TOP_BAR.crumbsHost} />
      <div id={TOP_BAR_TOOLS_HOST_ID} className={TOP_BAR.toolsHost} />

      <NavSheet
        open={isMenuOpen}
        viewContext={viewContext}
        unreadCount={unreadCount}
        session={session}
        onClose={() => setMenuOpen(false)}
        onAccount={() => {
          setMenuOpen(false)
          setAccountOpen(true)
        }}
      />
      <AccountSheet
        open={isAccountOpen}
        viewContext={viewContext}
        onClose={() => setAccountOpen(false)}
      />
    </header>
  )
}
