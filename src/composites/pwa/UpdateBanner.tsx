'use client'

import { Button } from '@/components/elements/actions/Button'
import { applyUpdate } from '@/core/hooks/pwa'
import { usePwaStore } from '@/core/store/pwa'
import { LIFECYCLE_COPY } from '@/declarations/pwa/copy'
import { PWA_STYLES } from '@/declarations/ui/variants'

/**
 * Offer of the new version, it never reloads by itself
 * @return {JSX.Element | null}
 */

export const UpdateBanner = () => {
  const waiting = usePwaStore((state) => state.waiting)
  if (!waiting) return null

  return (
    <div role="status" className={PWA_STYLES.update}>
      <div className={PWA_STYLES.updateBody}>
        <p className={PWA_STYLES.updateTitle}>{LIFECYCLE_COPY.updateTitle}</p>
        <p className={PWA_STYLES.updateLead}>{LIFECYCLE_COPY.updateLead}</p>
      </div>
      <Button variant="primary" icon="refresh" onClick={applyUpdate}>
        {LIFECYCLE_COPY.updateAction}
      </Button>
    </div>
  )
}
