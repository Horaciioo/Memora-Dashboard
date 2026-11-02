'use client'

import { useCallback } from 'react'

import { PresenceStack } from '@/components/structures/presence/PresenceStack'
import { useInterviewPresence } from '@/core/hooks/data/recruitment/useInterviewPresence'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { REALTIME_SETTINGS } from '@/declarations/system/realtime'

export interface InterviewPresenceProps {
  sessionId: string
  candidateId: string
  step: number
  parts: { questions: ResolvedQuestion[] }[]
  onGo: (step: number) => void
}

/**
 * Recruiters and observers in this interview, a click joins them
 * @param {InterviewPresenceProps} props - Interview and navigation
 * @return {JSX.Element | null}
 */

export const InterviewPresence = ({
  sessionId,
  candidateId,
  step,
  parts,
  onGo,
}: InterviewPresenceProps) => {
  // Part and question in words
  const labelOf = useCallback(
    (at: number, questionKey: string | null) => {
      if (at === 0) return QUESTIONNAIRE_COPY.presenceIntro
      const part = QUESTIONNAIRE_COPY.partLabel.replace('{number}', String(at))
      const prompt = parts[at - 1]?.questions.find(
        (question) => question.key === questionKey
      )?.prompt

      return prompt
        ? QUESTIONNAIRE_COPY.presenceQuestion
            .replace('{part}', part)
            .replace('{prompt}', prompt.slice(0, REALTIME_SETTINGS.presencePreviewLength))
        : part
    },
    [parts]
  )
  const presence = useInterviewPresence({ sessionId, candidateId, step, labelOf, go: onGo })

  return (
    <PresenceStack
      members={presence.members}
      isLive={presence.isLive}
      isDown={presence.isDown}
      describe={presence.describe}
      onJump={presence.jump}
    />
  )
}
