'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/managers/infrastructure/Security/AuthManager'
import { NotificationProvider } from '@/managers/infrastructure/Network/NotificationsManager'
import {
  AppearanceManager,
  BreadcrumbProvider,
  ColorVisionManager,
  DisplayPreferencesManager,
  HintsProvider,
  MenuProvider,
  ThemeManager,
} from '@/managers/front-end'
import type { SessionUser } from '@/types/auth'

// Overlay, empty until a toast fires — kept out of the initial bundle
const NotificationsToaster = dynamic(
  () =>
    import('@/components/structures/NotificationsToaster').then((mod) => mod.NotificationsToaster),
  { ssr: false }
)

export interface ProvidersProps {
  initialSession: SessionUser | null
  children: ReactNode
}

/**
 * Composes every client-side manager once, at the root of the app
 * @param {SessionUser | null} initialSession - Session resolved server-side
 * @param {ReactNode} children - App tree
 * @return {JSX.Element}
 */

export const Providers = ({ initialSession, children }: ProvidersProps) => (
  <NotificationProvider>
    <AuthProvider initialSession={initialSession}>
      <ThemeManager />
      <AppearanceManager />
      <ColorVisionManager />
      <DisplayPreferencesManager preferences={initialSession?.display ?? null} />
      <BreadcrumbProvider>
        <MenuProvider>
          <HintsProvider>
            {children}
            <NotificationsToaster />
          </HintsProvider>
        </MenuProvider>
      </BreadcrumbProvider>
    </AuthProvider>
  </NotificationProvider>
)
