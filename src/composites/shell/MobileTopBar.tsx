'use client'

import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { AccountSheet } from '@/composites/shell/AccountSheet'
import { NavSheet } from '@/composites/shell/NavSheet'
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
 * Top bar of the mobile shell: the menu on the left, the account on the right
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

      <button
        type="button"
        aria-label={NAV_COPY.account}
        onClick={() => setAccountOpen(true)}
        className={TOP_BAR.avatarButton}
      >
        <Avatar name={session.displayName} src={session.avatarUrl} size="sm" />
      </button>

      <NavSheet
        open={isMenuOpen}
        viewContext={viewContext}
        unreadCount={unreadCount}
        onClose={() => setMenuOpen(false)}
      />
      <AccountSheet
        open={isAccountOpen}
        viewContext={viewContext}
        onClose={() => setAccountOpen(false)}
      />
    </header>
  )
}
