'use client'

import { useEffect, useState } from 'react'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

import { LOADING_BAR } from '@/declarations/ui/blocks'
import { FEEDBACK_COPY } from '@/declarations/ui/copy/feedback'
import { MOTION_TIMERS } from '@/declarations/ui/motion'

/**
 * Top loading bar
 * @return {JSX.Element | null}
 */

export const LoadingBar = () => {
  // First loads and saves only
  const loading = useIsFetching({ predicate: (query) => query.state.data === undefined })
  const saving = useIsMutating()
  const isBusy = loading + saving > 0
  const [isShown, setShown] = useState(false)

  // Delayed reveal
  useEffect(() => {
    if (!isBusy) return

    const timer = window.setTimeout(() => setShown(true), MOTION_TIMERS.loadingBarDelayMs)

    return () => {
      window.clearTimeout(timer)
      setShown(false)
    }
  }, [isBusy])

  if (!isBusy || !isShown) return null

  return (
    <div className={LOADING_BAR.track} role="progressbar" aria-label={FEEDBACK_COPY.loading}>
      <span className={LOADING_BAR.runner} />
    </div>
  )
}
