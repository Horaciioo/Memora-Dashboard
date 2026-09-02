'use client'

import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/structures/Breadcrumbs'
import { SealDialog } from '@/composites/security/SealDialog'
import { BottomNav } from '@/composites/shell/BottomNav'
import { LeftSidebar } from '@/composites/shell/LeftSidebar'
import { MobileTopBar } from '@/composites/shell/MobileTopBar'
import { RightSidebar } from '@/composites/shell/RightSidebar'
import { SealProvider } from '@/managers/infrastructure/Security/SealManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { APP_SHELL } from '@/declarations/ui/blocks'
import type { ViewContext } from '@/types/access'
import type { SealState, TwoFactorState } from '@/types/security'

export interface AppShellProps {
  unreadCount: number
  viewContext: ViewContext
  twoFactor: TwoFactorState
  seal: SealState
  sidebarCollapsed: boolean
  children: ReactNode
}

/**
 * Chrome of the signed-in dashboard — destinations on the left, account on the right
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {TwoFactorState} twoFactor - Enrolment state resolved server-side
 * @param {SealState} seal - Unlock window resolved server-side
 * @param {boolean} sidebarCollapsed - Fold remembered by the browser
 * @param {ReactNode} children - Routed page content
 * @return {JSX.Element}
 */

export const AppShell = ({
  unreadCount,
  viewContext,
  twoFactor,
  seal,
  sidebarCollapsed,
  children,
}: AppShellProps) => {
  const { session } = useAuthContext()

  return (
    <SealProvider initialState={twoFactor} initialSeal={seal}>
      <div className={APP_SHELL.frame}>
        <LeftSidebar view={viewContext.view} initialCollapsed={sidebarCollapsed} />

        <div className={APP_SHELL.main}>
          {session && (
            <MobileTopBar session={session} unreadCount={unreadCount} viewContext={viewContext} />
          )}
          <main className={APP_SHELL.content}>
            <Breadcrumbs />
            {children}
          </main>
        </div>

        <RightSidebar unreadCount={unreadCount} viewContext={viewContext} />

        {session && <BottomNav viewContext={viewContext} />}
        <SealDialog />
      </div>
    </SealProvider>
  )
}
