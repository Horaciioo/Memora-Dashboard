'use client'

import { usePwaStore } from '@/core/store/pwa'
import { LIFECYCLE_COPY } from '@/declarations/pwa/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PWA_STYLES } from '@/declarations/ui/variants'

/**
 * Strip shown while the network is gone
 * @return {JSX.Element | null}
 */

export const OfflineBanner = () => {
  const isOnline = usePwaStore((state) => state.isOnline)
  const OfflineIcon = ICONS.offline
  if (isOnline) return null

  return (
    <div role="status" className={PWA_STYLES.offline}>
      <OfflineIcon className={PWA_STYLES.offlineIcon} aria-hidden="true" />
      {LIFECYCLE_COPY.offlineBanner}
    </div>
  )
}
