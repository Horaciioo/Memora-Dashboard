'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Breadcrumbs } from '@/components/structures/Breadcrumbs'
import { SidebarNav } from '@/composites/shell/SidebarNav'
import { AccountMenu } from '@/composites/shell/AccountMenu'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { cn } from '@/utils/classnames'

export interface AppShellProps {
  children: ReactNode
}

/**
 * Chrome of the signed-in dashboard, a docked sidebar on desktop and a drawer below it
 * @param {ReactNode} children - Routed page content
 * @return {JSX.Element}
 */

export const AppShell = ({ children }: AppShellProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

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
        <header className={APP_SHELL.topbar}>
          <Button
            variant="icon"
            icon="dashboard"
            aria-label={NAV_COPY.openSidebar}
            className="lg:hidden"
            onClick={() => setSidebarOpen((open) => !open)}
          />
          <div className="hidden min-w-0 flex-1 sm:block">
            <Breadcrumbs />
          </div>
          <SearchLauncher />
          <AccountMenu />
        </header>
        <main className={APP_SHELL.content}>{children}</main>
      </div>
    </div>
  )
}
