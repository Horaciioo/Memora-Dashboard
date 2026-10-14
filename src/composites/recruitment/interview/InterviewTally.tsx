'use client'

import { useState } from 'react'

import { tallyAppreciations } from '@/core/lib/recruitment/interviewTally'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { ICONS } from '@/declarations/ui/icons'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'
import { cn } from '@/utils/classnames'
import { AnswerAppreciations } from '@/utils/constants/recruitment'
import type { AnswerAppreciationName } from '@/utils/constants/recruitment'

export interface InterviewTallyProps {
  questions: ResolvedQuestion[]
  answers: Record<string, AnswerState>
}

// Order, wording, glyph, colour and wash of each reaction
const GROUPS = [
  {
    appreciation: AnswerAppreciations.Like,
    word: QUESTIONNAIRE_COPY.tallyLike,
    icon: 'like',
    tone: INTERVIEW.liked,
    wash: INTERVIEW.cardLike,
  },
  {
    appreciation: AnswerAppreciations.Dislike,
    word: QUESTIONNAIRE_COPY.tallyDislike,
    icon: 'dislike',
    tone: INTERVIEW.disliked,
    wash: INTERVIEW.cardDislike,
  },
  {
    appreciation: AnswerAppreciations.Neutral,
    word: QUESTIONNAIRE_COPY.tallyNeutral,
    icon: 'neutral',
    tone: INTERVIEW.neutral,
    wash: INTERVIEW.cardNeutral,
  },
] as const

/**
 * Questions of the interview counted by reaction, each group unfolding in place
 * @param {ResolvedQuestion[]} questions - Questions played
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @return {JSX.Element}
 */

export const InterviewTally = ({ questions, answers }: InterviewTallyProps) => {
  const tally = tallyAppreciations(questions, answers)
  const [open, setOpen] = useState<AnswerAppreciationName | null>(null)

  return (
    <div className={INTERVIEW.tally}>
      {open === null && (
        <p role="note" className={INTERVIEW.tallyHint}>
          <span className={INTERVIEW.tallyHintTail} aria-hidden="true" />
          {QUESTIONNAIRE_COPY.tallyHint}
        </p>
      )}
      {GROUPS.map((group) => {
        const rows = tally[group.appreciation]
        const plural = rows.length > 1 ? 'other' : 'one'
        const isOpen = open === group.appreciation
        const Glyph = ICONS[group.icon]

        return (
          <section
            key={group.appreciation}
            className={cn(INTERVIEW.tallyItem, isOpen && INTERVIEW.tallyItemOpen)}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              disabled={rows.length === 0}
              onClick={() => setOpen(isOpen ? null : group.appreciation)}
              className={INTERVIEW.tallyHead}
            >
              <span>
                {rows.length} {QUESTIONNAIRE_COPY.tallyNoun[plural]}{' '}
                <span className={group.tone}>{group.word[plural]}</span>
              </span>
              <Glyph className={cn(INTERVIEW.glyphSize, group.tone)} aria-hidden="true" />
            </button>
            {isOpen && (
              <div className={INTERVIEW.tallyList}>
                {rows.map((entry) => (
                  <div key={entry.key} className={cn(INTERVIEW.reviewRow, group.wash)}>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="font-semibold">{entry.prompt}</p>
                      {answers[entry.key].notes.trim() && (
                        <p className={INTERVIEW.reviewNote}>{answers[entry.key].notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
