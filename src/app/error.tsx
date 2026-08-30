'use client'

import { ErrorBoundaryScreen } from '@/components/structures/ErrorBoundaryScreen'

/**
 * Fallback of any route without a closer boundary
 * @param {Object} props - Boundary props
 * @param {Error & { digest?: string }} props.error - Caught exception
 * @param {() => void} props.retry - Re-renders the failed segment
 * @return {JSX.Element}
 */

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorBoundaryScreen error={error} retry={retry} />
}
