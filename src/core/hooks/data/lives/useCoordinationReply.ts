'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { CoordinationRequest, LiveGap } from '@/types/lives'
import { formatClock } from '@/utils/format/dates'
import { wallToInstant } from '@/utils/format/zone'

/**
 * Hours a member offers on a live, as wall clocks of the form
 * @typedef {Object} CoordinationWindow
 * @property {string} from - Wall clock the window starts
 * @property {string} to - Wall clock the window ends
 */

export interface CoordinationWindow {
  from: string
  to: string
}

/**
 * Answer a request to coordinate, and tell the hole it leaves in the live
 * @return {{ reply: (request: CoordinationRequest, accept: boolean, window: CoordinationWindow) => Promise<void> }} - Reply gesture
 */

export const useCoordinationReply = () => {
  const router = useRouter()
  const { run } = useMutation()
  const { notify } = useNotifications()

  const reply = useCallback(
    async (request: CoordinationRequest, accept: boolean, window: CoordinationWindow) => {
      const result = await run(
        () =>
          apiPost<{ gaps: LiveGap[] }>(API_ROUTES.liveCoordination(request.liveId), {
            accept,
            startsAt: window.from ? wallToInstant(window.from).toISOString() : null,
            endsAt: window.to ? wallToInstant(window.to).toISOString() : null,
          }),
        accept ? LIVE_COORDINATION_COPY.accepted : LIVE_COORDINATION_COPY.declined
      )
      if (!result) return

      // The hole left in the live is told right away
      if (result.gaps.length > 0) {
        const ranges = result.gaps
          .map((gap) =>
            LIVE_COORDINATION_COPY.gapRange
              .replace('{from}', formatClock(gap.from))
              .replace('{to}', formatClock(gap.to))
          )
          .join(', ')
        notify({
          tone: 'caution',
          title: LIVE_COORDINATION_COPY.gapAlert.replace('{ranges}', ranges),
        })
      }
      router.refresh()
    },
    [notify, router, run]
  )

  return { reply }
}
