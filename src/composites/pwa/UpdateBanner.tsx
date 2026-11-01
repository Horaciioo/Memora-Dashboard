'use client'

import { Button } from '@/components/elements/actions/Button'
import { SystemScreen } from '@/components/structures/page/SystemScreen'
import { applyUpdate } from '@/core/hooks/pwa'
import { usePwaStore } from '@/core/store/pwa'
import { LIFECYCLE_COPY } from '@/declarations/pwa/copy'
import { PWA_STYLES } from '@/declarations/ui/variants'

/**
 * Offer of the new version over the whole screen, it never reloads by itself
 * @return {JSX.Element | null}
 */

export const UpdateBanner = () => {
  const waiting = usePwaStore((state) => state.waiting)
  if (!waiting) return null

  return (
    <div role="status" className={PWA_STYLES.update}>
      <SystemScreen
        framed
        word={LIFECYCLE_COPY.updateWord}
        title={LIFECYCLE_COPY.updateTitle}
        description={LIFECYCLE_COPY.updateLead}
        action={
          <Button variant="primary" icon="refresh" onClick={applyUpdate}>
            {LIFECYCLE_COPY.updateAction}
          </Button>
        }
      />
    </div>
  )
}
