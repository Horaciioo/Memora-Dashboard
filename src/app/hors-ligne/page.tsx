import type { Metadata } from 'next'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { OfflinePages } from '@/composites/pages/offline/OfflinePages'
import { OfflineRetry } from '@/composites/pwa/OfflineRetry'
import { LIFECYCLE_COPY } from '@/declarations/pwa/copy'
import { PWA_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: LIFECYCLE_COPY.offlineTitle }

/**
 * Page the service worker serves when the network fails
 * @return {JSX.Element} - Fallback page
 */

export default function OfflinePage() {
  return (
    <main className={PWA_STYLES.offlinePage}>
      <EmptyState
        figure="settings"
        title={LIFECYCLE_COPY.offlineTitle}
        description={LIFECYCLE_COPY.offlineLead}
        action={<OfflineRetry />}
      />
      <OfflinePages />
    </main>
  )
}
