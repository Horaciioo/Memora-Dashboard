'use client'

import { useEffect } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { clearPendingRecap, pendingRecap } from '@/core/lib/recap/client'
import { useRecapStore } from '@/core/store/recap'
import type { Recap } from '@/types/recap'

/**
 * Keeps the window of a recap put off, Memora tells it in her chat
 * @return {JSX.Element | null}
 */

export const IntelligenceRecap = () => {
  // Back with a window kept, the same cards are read again
  useEffect(() => {
    const since = pendingRecap()
    if (!since || useRecapStore.getState().recap) return

    void apiGet<Recap>(API_ROUTES.recap({ from: since }))
      .then((again) => {
        if (again.threads.length === 0) clearPendingRecap()
        else useRecapStore.getState().show(again)
      })
      .catch(() => undefined)
  }, [])

  return null
}
