'use client'

import type { ReactNode } from 'react'
import { WindowFrame } from '@/components/structures/page/WindowFrame'
import { MobileHold } from '@/components/structures/overlays/MobileHold'
import { BrandSplash } from '@/composites/splash/BrandSplash'
import { NudgeHost } from '@/composites/notifications/NudgeHost'
import { PlayInviteHost } from '@/composites/play/invites/PlayInviteHost'
import { AccessSignalListener } from '@/composites/access/AccessSignalListener'
import { LiveSignalListener } from '@/composites/lives/LiveSignalListener'
import { SealDialog } from '@/composites/security/SealDialog'
import { TourHost } from '@/composites/tour/TourHost'
import { LeftSidebar } from '@/composites/shell/LeftSidebar'
import { MobileDock } from '@/composites/shell/MobileDock'
import { MobileTopBar } from '@/composites/shell/MobileTopBar'
import { OfflineBanner } from '@/composites/pwa/OfflineBanner'
import { PwaHost } from '@/composites/pwa/PwaHost'
import { AssistantDock } from '@/composites/search/assistant/AssistantDock'
import { SealProvider } from '@/managers/infrastructure/Security/SealManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { frameToneOf } from '@/declarations/access/views'
import { beaconProps } from '@/declarations/ui/beacons'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import type { HeldRoutes } from '@/declarations/ui/responsive'
import { APP_SHELL, LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { useAutoRefresh } from '@/core/hooks/interaction/state/useAutoRefresh'
import { RailSlotProvider, useRailSlot } from '@/managers/front-end/RailSlotManager'
import { TourProvider } from '@/managers/front-end/TourManager'
import type { ViewContext } from '@/types/access'
import type { SealState, TwoFactorState } from '@/types/security'
import type { TourState } from '@/types/tour'
import { Permissions } from '@/utils/constants/permissions'

export interface AppShellProps {
  unreadCount: number
  viewContext: ViewContext
  twoFactor: TwoFactorState
  seal: SealState
  tour: TourState | null
  heldRoutes: HeldRoutes
  isPushReady: boolean
  children: ReactNode
}

/**
 * Chrome of the signed-in dashboard
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {TwoFactorState} twoFactor - Enrolment state resolved server-side
 * @param {SealState} seal - Unlock window resolved server-side
 * @param {TourState | null} tour - First visit resolved server-side
 * @param {HeldRoutes} heldRoutes - Areas held back on small screens
 * @param {boolean} isPushReady - Pushes configured on the server
 * @param {ReactNode} children - Routed page content
 * @return {JSX.Element}
 */

export const AppShell = ({
  unreadCount,
  viewContext,
  twoFactor,
  seal,
  tour,
  heldRoutes,
  isPushReady,
  children,
}: AppShellProps) => {
  return (
    <RailSlotProvider>
      <BrandSplash />
      {/* A visit reset on the server starts over, a visit under way is left alone */}
      <TourProvider key={String(tour !== null && !tour.isIntroSeen)} initial={tour}>
        <AppShellFrame
          unreadCount={unreadCount}
          viewContext={viewContext}
          twoFactor={twoFactor}
          seal={seal}
          heldRoutes={heldRoutes}
          isPushReady={isPushReady}
        >
          {children}
        </AppShellFrame>
      </TourProvider>
    </RailSlotProvider>
  )
}

/**
 * Shell inside the rail slot
 * @param {Omit<AppShellProps, 'tour'>} props - Shell props
 * @return {JSX.Element}
 */

const AppShellFrame = ({
  unreadCount,
  viewContext,
  twoFactor,
  seal,
  heldRoutes,
  isPushReady,
  children,
}: Omit<AppShellProps, 'tour'>) => {
  const { session, can } = useAuthContext()
  const { isClaimed, isBare, setSlot } = useRailSlot()

  useAutoRefresh()

  return (
    <SealProvider initialState={twoFactor} initialSeal={seal}>
      <div
        className={isBare ? APP_SHELL.frameBare : APP_SHELL.frame}
        data-tone={frameToneOf(viewContext.view)}
      >
        {isBare ? null : isClaimed ? (
          <aside className={LEFT_SIDEBAR.rail}>
            <div ref={setSlot} className={LEFT_SIDEBAR.slot} />
          </aside>
        ) : (
          <LeftSidebar viewContext={viewContext} unreadCount={unreadCount} />
        )}
        {!isBare && <WindowFrame />}

        <div className={APP_SHELL.main}>
          <OfflineBanner />
          {session && <MobileTopBar />}
          <main className={APP_SHELL.content} {...beaconProps(TOUR_BEACONS.page)}>
            <MobileHold routes={heldRoutes}>{children}</MobileHold>
          </main>
        </div>

        <SealDialog />
        {session && (
          <MobileDock
            session={session}
            viewContext={viewContext}
            unreadCount={unreadCount}
            held={heldRoutes.phone}
          />
        )}
        {session && <PwaHost isPushReady={isPushReady} />}
        {session && <NudgeHost />}
        {session && !isBare && <AssistantDock viewContext={viewContext} />}
        {session && !isBare && can(Permissions.PlayAccess) && <PlayInviteHost />}
        {session && <TourHost />}
        {session && <AccessSignalListener />}
        {session && can(Permissions.LiveRead) && <LiveSignalListener />}
      </div>
    </SealProvider>
  )
}
