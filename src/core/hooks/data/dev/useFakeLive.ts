'use client'

import { useCallback, useEffect, useState } from 'react'

import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { FAKE_LIVE_COPY, FAKE_LIVE_SETTINGS } from '@/declarations/dev/fakeLive'
import type { FakeLiveStatus } from '@/types/dev'

/**
 * State and gestures of the fake live
 * @typedef {Object} FakeLiveControl
 * @property {FakeLiveStatus} status - What runs now
 * @property {boolean} isBusy - A gesture is in flight
 * @property {(pace: string) => Promise<void>} start - Launch the fake live
 * @property {() => Promise<void>} stop - Stop it
 * @property {(key: string) => Promise<void>} press - Press a console key
 * @property {() => Promise<void>} clear - Remove every fake live
 */

export interface FakeLiveControl {
  status: FakeLiveStatus
  isBusy: boolean
  start: (pace: string) => Promise<void>
  stop: () => Promise<void>
  press: (key: string) => Promise<void>
  clear: () => Promise<void>
}

const IDLE: FakeLiveStatus = { running: false, streaming: false, liveId: null, pace: null }

/**
 * Drive the fake live from the Live en cours page
 * @return {FakeLiveControl} - State and gestures
 */

export const useFakeLive = (): FakeLiveControl => {
  const [status, setStatus] = useState<FakeLiveStatus>(IDLE)
  const { isSaving, run } = useMutation()

  // Refreshed while the page is open
  useEffect(() => {
    const refresh = () =>
      void apiGet<FakeLiveStatus>(API_ROUTES.fakeLive)
        .then(setStatus)
        .catch(() => setStatus(IDLE))
    refresh()
    const timer = setInterval(refresh, FAKE_LIVE_SETTINGS.refreshMs)

    return () => clearInterval(timer)
  }, [])

  const send = useCallback(
    async (body: Record<string, string>, title?: string) => {
      const next = await run(() => apiPost<FakeLiveStatus>(API_ROUTES.fakeLive, body), title)
      if (next) setStatus(next)
    },
    [run]
  )

  return {
    status,
    isBusy: isSaving,
    start: (pace) => send({ action: 'start', pace }, FAKE_LIVE_COPY.started),
    stop: () => send({ action: 'stop' }, FAKE_LIVE_COPY.stopped),
    press: (key) => send({ action: 'key', key }),
    clear: () => send({ action: 'clear' }, FAKE_LIVE_COPY.cleared),
  }
}
