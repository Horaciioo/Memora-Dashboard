'use client'

import { Button } from '@/components/elements/actions/Button'
import { LIFECYCLE_COPY } from '@/declarations/pwa/copy'

/**
 * Reload the page the network failed on
 * @return {JSX.Element}
 */

export const OfflineRetry = () => (
  <Button variant="primary" icon="refresh" onClick={() => window.location.reload()}>
    {LIFECYCLE_COPY.offlineRetry}
  </Button>
)
