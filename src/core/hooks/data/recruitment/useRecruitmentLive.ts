'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { TAB_ID } from '@/core/lib/api/tab'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { RECRUITMENT_STREAM_EVENTS, RECRUITMENT_TOPICS } from '@/declarations/recruitment/topics'
import { REALTIME_EVENTS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { CandidateView } from '@/types/recruitment'

/**
 * What a recruitment signal carries
 * @typedef {Object} RecruitmentSignal
 * @property {string} [candidateId] - Candidate concerned
 * @property {string | null} [tab] - Tab that wrote
 */

interface RecruitmentSignal {
  candidateId?: string
  tab?: string | null
}

/**
 * Follow a session over the socket, what other tabs and members do lands without a reload
 * @param {string} sessionId - Session
 * @param {(candidate: CandidateView) => void} onCandidate - A candidate read again
 * @param {(id: string) => void} onRemoved - A candidate dropped
 * @return {void}
 */

export const useRecruitmentLive = (
  sessionId: string,
  onCandidate: (candidate: CandidateView) => void,
  onRemoved: (id: string) => void
): void => {
  const router = useRouter()

  useEffect(() => {
    // One read per candidate for a burst of signals
    const reads = new Map<string, number>()

    const read = (id: string) => {
      if (reads.has(id)) return
      reads.set(
        id,
        window.setTimeout(() => {
          reads.delete(id)
          apiGet<CandidateView>(API_ROUTES.candidate(id)).then(onCandidate, () => undefined)
        }, REALTIME_SETTINGS.refreshCoalesceMs)
      )
    }

    const stop = listenRealtime(RECRUITMENT_TOPICS.session(sessionId), (event, data) => {
      // Back from a drop, anything may have moved
      if (event === REALTIME_EVENTS.resync) return queueRefresh(() => router.refresh())

      const signal = (data ?? {}) as RecruitmentSignal
      // What this tab wrote is on screen already
      if (signal.tab === TAB_ID) return

      if (event === RECRUITMENT_STREAM_EVENTS.session) queueRefresh(() => router.refresh())
      else if (event === RECRUITMENT_STREAM_EVENTS.candidate && signal.candidateId) {
        read(signal.candidateId)
      } else if (event === RECRUITMENT_STREAM_EVENTS.removed && signal.candidateId) {
        onRemoved(signal.candidateId)
      }
    })

    return () => {
      stop()
      for (const timer of reads.values()) window.clearTimeout(timer)
    }
  }, [sessionId, router, onCandidate, onRemoved])
}
