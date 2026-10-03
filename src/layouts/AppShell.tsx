'use client'

import type { ReactNode } from 'react'
import { WindowFrame } from '@/components/structures/WindowFrame'
import { NudgeHost } from '@/composites/notifications/NudgeHost'
import { LiveSignalListener } from '@/composites/lives/LiveSignalListener'
import { SealDialog } from '@/composites/security/SealDialog'
import { BottomNav } from '@/composites/shell/BottomNav'
import { LeftSidebar } from '@/composites/shell/LeftSidebar'
import { MobileTopBar } from '@/composites/shell/MobileTopBar'
import { SealProvider } from '@/managers/infrastructure/Security/SealManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { frameToneOf } from '@/declarations/access/views'
import { APP_SHELL, LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { RailSlotProvider, useRailSlot } from '@/managers/front-end/RailSlotManager'
import type { ViewContext } from '@/types/access'
import type { SealState, TwoFactorState } from '@/types/security'
import { Permissions } from '@/utils/constants/permissions'

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
  return (
    <RailSlotProvider>
      <AppShellFrame
        unreadCount={unreadCount}
        viewContext={viewContext}
        twoFactor={twoFactor}
        seal={seal}
      >
        {children}
      </AppShellFrame>
    </RailSlotProvider>
  )
}

/**
 * Shell inside the rail slot
 * @param {AppShellProps} props - Shell props
 * @return {JSX.Element}
 */

const AppShellFrame = ({ unreadCount, viewContext, twoFactor, seal, children }: AppShellProps) => {
  const { session, can } = useAuthContext()
  const { isClaimed, setSlot } = useRailSlot()

  return (
    <SealProvider initialState={twoFactor} initialSeal={seal}>
      <div className={APP_SHELL.frame} data-tone={frameToneOf(viewContext.view, session?.role)}>
        {isClaimed ? (
          <aside className={LEFT_SIDEBAR.rail}>
            <div ref={setSlot} className={LEFT_SIDEBAR.slot} />
          </aside>
        ) : (
          <LeftSidebar viewContext={viewContext} unreadCount={unreadCount} />
        )}
        <WindowFrame />

        <div className={APP_SHELL.main}>
          {session && (
            <MobileTopBar session={session} unreadCount={unreadCount} viewContext={viewContext} />
          )}
          <main className={APP_SHELL.content}>{children}</main>
        </div>

        {session && <BottomNav viewContext={viewContext} />}
        <SealDialog />
        {session && <NudgeHost />}
        {session && can(Permissions.LiveRead) && <LiveSignalListener />}
      </div>
    </SealProvider>
  )
}
