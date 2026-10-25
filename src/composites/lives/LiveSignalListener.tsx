'use client'

import { useSignalRefresh } from '@/core/hooks/interaction/state/useSignalRefresh'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_STREAM_EVENTS } from '@/declarations/lives/topics'

/**
 * Re-render the server views when a live changes status
 * @return {null}
 */

export const LiveSignalListener = () => {
  useSignalRefresh(API_ROUTES.livesStream, LIVE_STREAM_EVENTS.status)

  return null
}
