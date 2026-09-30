'use client'

import { useEffect } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { SystemScreen } from '@/components/structures/SystemScreen'
import { captureException } from '@/core/lib/sentry'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'

export interface ErrorBoundaryScreenProps {
  error: Error & { digest?: string }
  retry: () => void
  title?: string
  description?: string
  // Outside the shell
  framed?: boolean
}

/**
 * Shared fallback of every error boundary, reporting once and offering the way back
 * @param {Error & { digest?: string }} error - Caught exception
 * @param {() => void} retry - Re-renders the failed segment
 * @param {string} [title] - Headline override
 * @param {string} [description] - Supporting line override
 * @param {boolean} [framed] - Draws its frame
 * @return {JSX.Element}
 */

export const ErrorBoundaryScreen = ({
  error,
  retry,
  title,
  description,
  framed,
}: ErrorBoundaryScreenProps) => {
  useEffect(() => {
    captureException(error, error.digest ? { digest: error.digest } : undefined)
  }, [error])

  return (
    <SystemScreen
      framed={framed}
      word={ERROR_PAGE_COPY.errorWord}
      stamped
      title={title ?? ERROR_PAGE_COPY.title}
      description={description ?? ERROR_PAGE_COPY.description}
      reference={error.digest ? `${ERROR_PAGE_COPY.reference} ${error.digest}` : undefined}
      action={
        <Button variant="primary" icon="refresh" onClick={() => retry()}>
          {ERROR_PAGE_COPY.retry}
        </Button>
      }
    />
  )
}
