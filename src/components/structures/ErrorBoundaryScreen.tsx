'use client'

import { useEffect } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { captureException } from '@/core/lib/sentry'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface ErrorBoundaryScreenProps {
  error: Error & { digest?: string }
  retry: () => void
  title?: string
  description?: string
}

/**
 * Shared fallback of every error boundary, reporting once and offering the way back
 * @param {Error & { digest?: string }} error - Caught exception
 * @param {() => void} retry - Re-renders the failed segment
 * @param {string} [title] - Headline override
 * @param {string} [description] - Supporting line override
 * @return {JSX.Element}
 */

export const ErrorBoundaryScreen = ({
  error,
  retry,
  title,
  description,
}: ErrorBoundaryScreenProps) => {
  useEffect(() => {
    captureException(error, error.digest ? { digest: error.digest } : undefined)
  }, [error])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <EmptyState
        figure="settings"
        title={title ?? ERROR_PAGE_COPY.title}
        description={description ?? ERROR_PAGE_COPY.description}
        action={
          <Button variant="primary" icon="refresh" onClick={() => retry()}>
            {ERROR_PAGE_COPY.retry}
          </Button>
        }
      />
    </div>
  )
}
