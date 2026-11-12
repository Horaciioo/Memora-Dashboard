import type { Metadata } from 'next'

import { OfflinePages } from '@/composites/pages/offline/OfflinePages'
import { OfflineGears } from '@/composites/pwa/OfflineGears'
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
      <div className={PWA_STYLES.offlineFrame}>
        <OfflineGears />
        <p className="text-base font-bold">{LIFECYCLE_COPY.offlineTitle}</p>
        <p className="max-w-sm text-sm text-[var(--color-ink-subtle)]">
          {LIFECYCLE_COPY.offlineLead}
        </p>
        <OfflineRetry />
      </div>
      <OfflinePages />
    </main>
  )
}
