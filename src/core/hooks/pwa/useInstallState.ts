'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'

import { browserSnapshot } from '@/core/lib/pwa/browserSnapshot'
import { isAppleMobile, isAppleOtherBrowser, isStandalone } from '@/core/lib/pwa/platform'
import { usePwaStore } from '@/core/store/pwa'
import type { InstallRoute } from '@/types/pwa'

/**
 * How this device installs without a browser offer
 * @return {Exclude<InstallRoute, 'prompt' | null>} - Route
 */

const readDeviceRoute = (): Exclude<InstallRoute, 'prompt' | null> => {
  if (isStandalone()) return 'installed'
  if (isAppleOtherBrowser()) return 'appleOther'

  return isAppleMobile() ? 'apple' : 'manual'
}

/**
 * Install route of this device and the gesture that opens the browser dialog
 * @return {{ route: InstallRoute, install: () => Promise<void> }} - Route and gesture
 */

export const useInstallState = (): { route: InstallRoute; install: () => Promise<void> } => {
  const offer = usePwaStore((state) => state.installOffer)
  const [isAccepted, setAccepted] = useState(false)
  // Unknown until the browser answers
  const device = useSyncExternalStore(...browserSnapshot(readDeviceRoute))

  const install = useCallback(async () => {
    if (!offer) return

    await offer.prompt()
    const { outcome } = await offer.userChoice
    // An offer is good for one dialog
    usePwaStore.getState().setInstallOffer(null)
    if (outcome === 'accepted') setAccepted(true)
  }, [offer])

  const route = isAccepted ? 'installed' : device === 'installed' || !offer ? device : 'prompt'

  return { route, install }
}
