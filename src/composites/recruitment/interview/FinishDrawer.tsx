'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Textarea } from '@/components/elements/forms/inputs/Textarea'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { InterviewTally } from '@/composites/recruitment/interview/InterviewTally'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { DELIBERATION_VERDICTS } from '@/declarations/recruitment/outcomes'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { INTERVIEW, QUESTION_BODY } from '@/declarations/ui/variants'
import type { AnswerState, RecruitmentOutcomeView } from '@/types/recruitment'
import { cn } from '@/utils/classnames'

export interface FinishDrawerProps {
  open: boolean
  questions: ResolvedQuestion[]
  answers: Record<string, AnswerState>
  outcomes: RecruitmentOutcomeView[]
  // Bilan and issue already recorded
  review: string
  outcomeId: string | null
  isSaving: boolean
  isReadOnly: boolean
  // Verdict stays open to whoever writes candidates
  canVerdict: boolean
  onVerdict: (outcomeId: string | null) => void
  onClose: () => void
  onConfirm: (outcomeId: string | null, review: string) => void
}

/**
 * Tally of the interview on the left, bilan and verdict on the right
 * @param {boolean} open - Drawer is mounted
 * @param {ResolvedQuestion[]} questions - Questions played
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @param {RecruitmentOutcomeView[]} outcomes - Issues of the session
 * @param {string} review - Bilan already written
 * @param {string | null} outcomeId - Issue already reached
 * @param {boolean} isSaving - Locks the confirmation
 * @param {boolean} isReadOnly - Shows without letting anything change
 * @param {boolean} canVerdict - Verdict may be given
 * @param {(outcomeId: string | null) => void} onVerdict - Records the issue
 * @param {() => void} onClose - Dismiss handler
 * @param {(outcomeId: string | null, review: string) => void} onConfirm - Ends the interview
 * @return {JSX.Element}
 */

export const FinishDrawer = ({
  open,
  questions,
  answers,
  outcomes,
  review,
  outcomeId,
  isSaving,
  isReadOnly,
  canVerdict,
  onVerdict,
  onClose,
  onConfirm,
}: FinishDrawerProps) => {
  const [picked, setPicked] = useState<string | null>(outcomeId)
  const [bilan, setBilan] = useState(review)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      isWide
      title={QUESTIONNAIRE_COPY.finishTitle}
      icon="check"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{QUESTIONNAIRE_COPY.back}</Button>
          {!isReadOnly && (
            <Button variant="primary" disabled={isSaving} onClick={() => onConfirm(picked, bilan)}>
              {QUESTIONNAIRE_COPY.confirm}
            </Button>
          )}
        </div>
      }
    >
      <div className={INTERVIEW.finishBody}>
        <InterviewTally questions={questions} answers={answers} />

        <div className={INTERVIEW.bilan}>
          <h2 className={QUESTION_BODY.label}>{QUESTIONNAIRE_COPY.reviewTitle}</h2>
          <Textarea
            value={bilan}
            readOnly={isReadOnly}
            placeholder={QUESTIONNAIRE_COPY.reviewPlaceholder}
            onChange={(event) => setBilan(event.target.value)}
            className={INTERVIEW.bilanField}
          />
          <div className={INTERVIEW.verdicts}>
            {DELIBERATION_VERDICTS.map((verdict) => {
              const outcome = outcomes.find((entry) => entry.label === verdict.label)
              const isOn = outcome !== undefined && picked === outcome.id

              return (
                <button
                  key={verdict.label}
                  type="button"
                  aria-pressed={isOn}
                  disabled={!canVerdict || !outcome}
                  onClick={() => {
                    if (!outcome) return
                    const next = isOn ? null : outcome.id
                    setPicked(next)
                    onVerdict(next)
                  }}
                  className={cn(INTERVIEW.verdict, isOn && INTERVIEW.verdictOn[verdict.tone])}
                >
                  {verdict.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
