'use client'

import { useSignalRefresh } from '@/core/hooks/interaction/state/useSignalRefresh'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ACCESS_SIGNAL } from '@/declarations/access/signal'

/**
 * Re-render the server views when access rights change
 * @return {null}
 */

export const AccessSignalListener = () => {
  useSignalRefresh(API_ROUTES.accessStream, ACCESS_SIGNAL.event)

  return null
}
