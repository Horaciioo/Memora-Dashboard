'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { LoadingBar } from '@/components/tools/LoadingBar'
import { createQueryClient } from '@/core/lib/query/client'
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

// Overlay
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
 * Composes every client-side manager once
 * @param {SessionUser | null} initialSession - Session resolved server-side
 * @param {ReactNode} children - App tree
 * @return {JSX.Element}
 */

export const Providers = ({ initialSession, children }: ProvidersProps) => {
  // One client per browser tab
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
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
                <LoadingBar />
              </HintsProvider>
            </MenuProvider>
          </BreadcrumbProvider>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  )
}
