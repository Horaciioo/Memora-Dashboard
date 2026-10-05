'use client'

import { useEffect } from 'react'
import '@/styles/globals.css'
import { SystemScreen } from '@/components/structures/SystemScreen'
import { captureException } from '@/core/lib/sentry'
import { ERROR_PAGE_COPY } from '@/declarations/ui/copy'
import { CRITICAL_ERROR_STYLES } from '@/declarations/ui/variants'

/**
 * Last resort boundary
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
        <SystemScreen
          framed
          word={ERROR_PAGE_COPY.errorWord}
          stamped
          title={ERROR_PAGE_COPY.criticalTitle}
          description={ERROR_PAGE_COPY.criticalDescription}
          reference={error.digest ? `${ERROR_PAGE_COPY.reference} ${error.digest}` : undefined}
          action={
            <button type="button" className={CRITICAL_ERROR_STYLES.action} onClick={() => retry()}>
              {ERROR_PAGE_COPY.reload}
            </button>
          }
        />
      </body>
    </html>
  )
}
