'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/core/lib/api/keys'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { UNBAN_SIGNAL } from '@/declarations/system/signals'

/**
 * Read again every Deban. view when another member writes
 * @return {void}
 */

export const useUnbanSignal = (): void => {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      listenRealtime(UNBAN_SIGNAL.topic, () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unban })
      ),
    [queryClient]
  )
}
