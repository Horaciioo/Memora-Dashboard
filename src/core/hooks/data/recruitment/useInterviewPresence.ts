'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePresence } from '@/core/hooks/data/realtime'
import type { PresenceView } from '@/core/hooks/data/realtime'
import { revealElement } from '@/core/lib/realtime/reveal'
import {
  placeOf,
  questionElementOf,
  questionKeyOf,
  readPlace,
} from '@/core/lib/recruitment/interviewPlace'
import { RECRUITMENT_TOPICS } from '@/declarations/recruitment/topics'

/**
 * Interview presence and gestures
 * @typedef {Object} InterviewPresence
 */

export interface InterviewPresence extends PresenceView {
  describe: (place: string) => string | null
  jump: (place: string) => void
}

/**
 * Who else sits in this interview, and where
 * @param {Object} input - Interview
 * @param {string} input.sessionId - Session
 * @param {string} input.candidateId - Candidate interviewed
 * @param {number} input.step - Part on screen
 * @param {(step: number, questionKey: string | null) => string} input.labelOf - Place in words
 * @param {(step: number) => void} input.go - Opens a part
 * @return {InterviewPresence} - Presence
 */

export const useInterviewPresence = ({
  sessionId,
  candidateId,
  step,
  labelOf,
  go,
}: {
  sessionId: string
  candidateId: string
  step: number
  labelOf: (step: number, questionKey: string | null) => string
  go: (step: number) => void
}): InterviewPresence => {
  const [touched, setTouched] = useState<{ step: number; key: string } | null>(null)

  // Last question touched on this part
  useEffect(() => {
    const pick = (event: Event) => {
      const key = questionKeyOf(event.target)
      if (key) setTouched({ step, key })
    }
    document.addEventListener('pointerdown', pick, { passive: true })
    document.addEventListener('focusin', pick)

    return () => {
      document.removeEventListener('pointerdown', pick)
      document.removeEventListener('focusin', pick)
    }
  }, [step])

  const questionKey = touched?.step === step ? touched.key : null
  const presence = usePresence(
    RECRUITMENT_TOPICS.session(sessionId),
    placeOf({ candidateId, step, questionKey })
  )

  // Only this candidate's interview
  const members = useMemo(
    () => presence.members.filter((member) => readPlace(member.place)?.candidateId === candidateId),
    [presence.members, candidateId]
  )

  const describe = useCallback(
    (place: string) => {
      const read = readPlace(place)

      return read ? labelOf(read.step, read.questionKey) : null
    },
    [labelOf]
  )

  const jump = useCallback(
    (place: string) => {
      const read = readPlace(place)
      if (!read) return
      go(read.step)
      const { questionKey: key } = read
      // Part drawn, then the card
      if (key) {
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => revealElement(questionElementOf(key)))
        )
      }
    },
    [go]
  )

  return { ...presence, members, describe, jump }
}
