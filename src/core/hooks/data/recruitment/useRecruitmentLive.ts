'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { TAB_ID } from '@/core/lib/api/tab'
import { coalesce } from '@/core/lib/realtime/coalesce'
import { queueRefresh } from '@/core/lib/realtime/refresh'
import { listenRealtime } from '@/core/lib/realtime/socket'
import { RECRUITMENT_STREAM_EVENTS, RECRUITMENT_TOPICS } from '@/declarations/recruitment/topics'
import { REALTIME_EVENTS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { AnswerState, CandidateView } from '@/types/recruitment'

/**
 * What a recruitment signal carries
 * @typedef {Object} RecruitmentSignal
 */

interface RecruitmentSignal {
  candidateId?: string
  key?: string
  answer?: AnswerState
  tab?: string | null
}

/**
 * What the file does with each signal
 * @typedef {Object} RecruitmentLiveHandlers
 * @property {(candidate: CandidateView) => void} onCandidate - A candidate read again
 * @property {(id: string) => void} onRemoved - A candidate dropped
 * @property {(id: string, key: string, answer: AnswerState) => void} onAnswer - An answer noted
 */

export interface RecruitmentLiveHandlers {
  onCandidate: (candidate: CandidateView) => void
  onRemoved: (id: string) => void
  onAnswer: (id: string, key: string, answer: AnswerState) => void
}

/**
 * Follow a session over the socket, what other tabs and members do lands without a reload
 * @param {string} sessionId - Session
 * @param {RecruitmentLiveHandlers} handlers - Reactions
 * @return {void}
 */

export const useRecruitmentLive = (sessionId: string, handlers: RecruitmentLiveHandlers): void => {
  const router = useRouter()
  // Latest reactions, the socket stays put
  const latest = useRef(handlers)
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(() => {
    // First signal reads at once, a burst once more
    const reads = new Map<string, ReturnType<typeof coalesce>>()
    const read = (id: string) => {
      const reader =
        reads.get(id) ??
        coalesce(() => {
          apiGet<CandidateView>(API_ROUTES.candidate(id)).then(
            (candidate) => latest.current.onCandidate(candidate),
            () => undefined
          )
        }, REALTIME_SETTINGS.refreshCoalesceMs)
      reads.set(id, reader)
      reader.request()
    }
    const refresh = () => queueRefresh(() => router.refresh())

    const reactions: Record<string, (signal: RecruitmentSignal) => void> = {
      [REALTIME_EVENTS.resync]: refresh,
      [RECRUITMENT_STREAM_EVENTS.session]: refresh,
      [RECRUITMENT_STREAM_EVENTS.candidate]: ({ candidateId }) => candidateId && read(candidateId),
      [RECRUITMENT_STREAM_EVENTS.removed]: ({ candidateId }) =>
        candidateId && latest.current.onRemoved(candidateId),
      [RECRUITMENT_STREAM_EVENTS.answer]: ({ candidateId, key, answer }) =>
        candidateId && key && answer && latest.current.onAnswer(candidateId, key, answer),
    }

    const stop = listenRealtime(RECRUITMENT_TOPICS.session(sessionId), (event, data) => {
      const signal = (data ?? {}) as RecruitmentSignal
      // What this tab wrote is on screen already
      if (signal.tab === TAB_ID) return
      reactions[event]?.(signal)
    })

    return () => {
      stop()
      for (const reader of reads.values()) reader.cancel()
    }
  }, [sessionId, router])
}
