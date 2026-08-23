'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/structures/Breadcrumbs'
import { SidebarNav } from '@/composites/shell/SidebarNav'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface AppShellProps {
  children: ReactNode
}

/**
 * Chrome of the signed-in dashboard — a docked sidebar carrying search, navigation and the
 * account, and the routed page beside it with no bar above it
 * @param {ReactNode} children - Routed page content
 * @return {JSX.Element}
 */

export const AppShell = ({ children }: AppShellProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const MenuIcon = ICONS.dashboard

  return (
    <div className={APP_SHELL.frame}>
      {isSidebarOpen && (
        <div
          className={APP_SHELL.scrim}
          role="presentation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <SidebarNav
        className={cn(!isSidebarOpen && APP_SHELL.sidebarHidden)}
        onNavigate={() => setSidebarOpen(false)}
      />
      <div className={APP_SHELL.main}>
        <main className={APP_SHELL.content}>
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <button
        type="button"
        aria-label={isSidebarOpen ? NAV_COPY.closeSidebar : NAV_COPY.openSidebar}
        aria-expanded={isSidebarOpen}
        className={APP_SHELL.menuButton}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <MenuIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
