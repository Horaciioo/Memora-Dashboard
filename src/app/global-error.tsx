'use client'

import { useEffect } from 'react'
import '@/styles/globals.css'
import { captureException } from '@/core/lib/sentry'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'
import { CRITICAL_ERROR_STYLES } from '@/declarations/ui/variants'

/**
 * Last resort boundary, replacing the root layout when it is the one that failed
 * @param {Object} props - Boundary props
 * @param {Error & { digest?: string }} props.error - Caught exception
 * @param {() => void} props.retry - Re-renders the document
 * @return {JSX.Element}
 */

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    captureException(error, error.digest ? { digest: error.digest } : undefined)
  }, [error])

  return (
    <html lang="fr">
      <body className={CRITICAL_ERROR_STYLES.body}>
        <main className={CRITICAL_ERROR_STYLES.frame}>
          <h1 className={CRITICAL_ERROR_STYLES.title}>{ERROR_PAGE_COPY.criticalTitle}</h1>
          <p className={CRITICAL_ERROR_STYLES.description}>{ERROR_PAGE_COPY.criticalDescription}</p>
          {error.digest && (
            <p className={CRITICAL_ERROR_STYLES.reference}>
              {ERROR_PAGE_COPY.reference} {error.digest}
            </p>
          )}
          <button type="button" className={CRITICAL_ERROR_STYLES.action} onClick={() => retry()}>
            {ERROR_PAGE_COPY.reload}
          </button>
        </main>
      </body>
    </html>
  )
}
