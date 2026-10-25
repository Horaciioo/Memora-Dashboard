'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { HEALTH_COPY, HEALTH_SETTINGS } from '@/declarations/system/monitoring/health'
import { SECOND_MS } from '@/utils/constants/time'
import { formatClock } from '@/utils/format/dates'

export interface HealthRefreshProps {
  takenAt: string
}

/**
 * Measure moment with a manual refresh and a live mode
 * @param {string} takenAt - ISO moment of the measure on screen
 * @return {JSX.Element}
 */

export const HealthRefresh = ({ takenAt }: HealthRefreshProps) => {
  const router = useRouter()
  const [isLive, setIsLive] = useState(false)
  const [isPending, startTransition] = useTransition()

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router])

  useEffect(() => {
    if (!isLive) return

    const timer = setInterval(refresh, HEALTH_SETTINGS.autoRefreshSeconds * SECOND_MS)

    return () => clearInterval(timer)
  }, [isLive, refresh])

  return (
    <>
      <span aria-live="off">{`${HEALTH_COPY.measuredAt} ${formatClock(takenAt)}`}</span>
      <Button
        variant={isLive ? 'primary' : 'secondary'}
        icon="flash"
        aria-pressed={isLive}
        title={HEALTH_COPY.live}
        onClick={() => setIsLive((current) => !current)}
      />
      <Button icon="refresh" isLoading={isPending} title={HEALTH_COPY.refresh} onClick={refresh} />
    </>
  )
}
