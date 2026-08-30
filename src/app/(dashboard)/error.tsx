'use client'

import { ErrorBoundaryScreen } from '@/components/structures/ErrorBoundaryScreen'

/**
 * Fallback of the dashboard, the shell around it staying mounted
 * @param {Object} props - Boundary props
 * @param {Error & { digest?: string }} props.error - Caught exception
 * @param {() => void} props.retry - Re-renders the failed segment
 * @return {JSX.Element}
 */

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorBoundaryScreen error={error} retry={retry} />
}
