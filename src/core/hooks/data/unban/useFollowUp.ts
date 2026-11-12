'use client'

import { useEffect, useState } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PublicRequestView } from '@/types/unban'

/**
 * Follow-up kept fresh by reading it again whenever the person comes back to the tab
 * @param {string} token - Link secret
 * @param {PublicRequestView} initial - View the server rendered
 * @return {{ view: PublicRequestView, hasFailed: boolean }} - Latest view and whether the last refresh failed
 */

export const useFollowUp = (
  token: string,
  initial: PublicRequestView
): { view: PublicRequestView; hasFailed: boolean } => {
  const [view, setView] = useState(initial)
  const [hasFailed, setFailed] = useState(false)

  useEffect(() => {
    const refresh = () => {
      if (document.hidden) return

      apiGet<PublicRequestView>(API_ROUTES.unbanPublic(token))
        .then((next) => {
          setView(next)
          setFailed(false)
        })
        .catch(() => setFailed(true))
    }

    document.addEventListener('visibilitychange', refresh)

    return () => document.removeEventListener('visibilitychange', refresh)
  }, [token])

  return { view, hasFailed }
}
