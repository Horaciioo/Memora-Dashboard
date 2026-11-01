'use client'

import { InstallHint } from '@/composites/pwa/InstallHint'
import { UpdateBanner } from '@/composites/pwa/UpdateBanner'
import {
  useAppBadge,
  useInstallOffer,
  useNetworkStatus,
  usePushResync,
  useServiceWorker,
  useWorkerMessages,
} from '@/core/hooks/pwa'

export interface PwaHostProps {
  isPushReady: boolean
}

/**
 * Installed application wiring: worker, updates, badge, network, install hint
 * @param {boolean} isPushReady - Pushes configured on the server
 * @return {JSX.Element}
 */

export const PwaHost = ({ isPushReady }: PwaHostProps) => {
  useServiceWorker()
  useWorkerMessages()
  useAppBadge()
  useNetworkStatus()
  useInstallOffer()
  usePushResync(isPushReady)

  return (
    <>
      <UpdateBanner />
      <InstallHint />
    </>
  )
}
