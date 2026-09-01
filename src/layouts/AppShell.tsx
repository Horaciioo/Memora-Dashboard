'use client'

import type { ReactNode } from 'react'
import { Breadcrumbs } from '@/components/structures/Breadcrumbs'
import { SealDialog } from '@/composites/security/SealDialog'
import { BottomNav } from '@/composites/shell/BottomNav'
import { MobileTopBar } from '@/composites/shell/MobileTopBar'
import { SidebarNav } from '@/composites/shell/SidebarNav'
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
  children: ReactNode
}

/**
 * Chrome of the signed-in dashboard
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {TwoFactorState} twoFactor - Enrolment state resolved server-side
 * @param {SealState} seal - Unlock window resolved server-side
 * @param {ReactNode} children - Routed page content
 * @return {JSX.Element}
 */

export const AppShell = ({
  unreadCount,
  viewContext,
  twoFactor,
  seal,
  children,
}: AppShellProps) => {
  const { session } = useAuthContext()

  return (
    <SealProvider initialState={twoFactor} initialSeal={seal}>
      <div className={APP_SHELL.frame}>
        <SidebarNav unreadCount={unreadCount} viewContext={viewContext} onNavigate={() => {}} />
        <div className={APP_SHELL.main}>
          {session && (
            <MobileTopBar session={session} unreadCount={unreadCount} viewContext={viewContext} />
          )}
          <main className={APP_SHELL.content}>
            <Breadcrumbs />
            {children}
          </main>
        </div>
        {session && <BottomNav viewContext={viewContext} />}
        <SealDialog />
      </div>
    </SealProvider>
  )
}
