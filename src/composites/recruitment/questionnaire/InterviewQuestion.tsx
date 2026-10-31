'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import {
  AppreciationButtons,
  SkipGlyph,
} from '@/composites/recruitment/questionnaire/AppreciationButtons'
import { QuestionComments } from '@/composites/recruitment/questionnaire/QuestionComments'
import { QuestionBody } from '@/composites/recruitment/questionnaire/QuestionBody'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { BLANK_ANSWER, isHandled } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'
import { AnswerAppreciations } from '@/utils/constants/recruitment'
import { cn } from '@/utils/classnames'

// Wash of the card per reaction
const TINTS: Record<string, string | undefined> = {
  [AnswerAppreciations.Like]: INTERVIEW.cardLike,
  [AnswerAppreciations.Neutral]: INTERVIEW.cardNeutral,
  [AnswerAppreciations.Dislike]: INTERVIEW.cardDislike,
}

export interface InterviewQuestionProps {
  question: ResolvedQuestion
  candidateId: string
  // Drawn inside a fold, without its own card or skip
  isBare?: boolean
  answer: AnswerState | undefined
  // Every answer, sub-questions included
  answers: Record<string, AnswerState>
  // Question of the same turn of phrase already played
  sibling: ResolvedQuestion | null
  disabled?: boolean
  onChange: (patch: Partial<AnswerState>) => void
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}

/**
 * One question of the interview, with its reaction, its skip and its comments
 * @param {ResolvedQuestion} question - Question resolved for the session
 * @param {string} candidateId - Applicant interviewed
 * @param {boolean} [isBare] - Drawn inside a fold
 * @param {AnswerState | undefined} answer - What was written
 * @param {Record<string, AnswerState>} answers - Every answer by key
 * @param {ResolvedQuestion | null} sibling - Question of the same family already played
 * @param {boolean} [disabled] - Blocks writing
 * @param {(patch: Partial<AnswerState>) => void} onChange - Called with what changed
 * @param {(key: string, patch: Partial<AnswerState>) => void} onAnswer - Called for a sub-question
 * @return {JSX.Element}
 */

export const InterviewQuestion = ({
  question,
  candidateId,
  isBare,
  answer,
  answers,
  sibling,
  disabled,
  onChange,
  onAnswer,
}: InterviewQuestionProps) => {
  const [forced, setForced] = useState(false)
  const state = answer ?? BLANK_ANSWER
  const { file } = useRecruitmentState()
  const isCommented = Boolean(
    file.candidates
      .find((entry) => entry.id === candidateId)
      ?.comments.some((entry) => entry.questionKey === question.key)
  )
  const covered = sibling !== null && !isHandled(answer, isCommented) && !forced

  // Left aside, one line is enough
  if (!isBare && (state.skipped || covered)) {
    return (
      <article className={cn(INTERVIEW.card, INTERVIEW.cardSkipped)}>
        <div className={INTERVIEW.head}>
          <div className={INTERVIEW.headBody}>
            <p className={cn(INTERVIEW.prompt, INTERVIEW.promptSkipped)}>{question.prompt}</p>
            <p className={INTERVIEW.covered}>
              {state.skipped
                ? QUESTIONNAIRE_COPY.skippedLine
                : QUESTIONNAIRE_COPY.covered.replace('{prompt}', sibling?.prompt ?? '')}
            </p>
          </div>
          <Button
            disabled={disabled}
            onClick={() => (state.skipped ? onChange({ skipped: false }) : setForced(true))}
          >
            {state.skipped ? QUESTIONNAIRE_COPY.unskip : QUESTIONNAIRE_COPY.ask}
          </Button>
        </div>
      </article>
    )
  }

  return (
    <article className={isBare ? INTERVIEW.foldChosen : INTERVIEW.card}>
      <div className={cn(INTERVIEW.ask, TINTS[state.appreciation ?? ''])}>
        <div className={INTERVIEW.askBody}>
          {!isBare && question.when && <span className={INTERVIEW.when}>{question.when}</span>}
          <h3 className={cn(INTERVIEW.prompt, question.mandatory && INTERVIEW.promptMandatory)}>
            {question.prompt}
          </h3>
        </div>
        <div className={INTERVIEW.actions}>
          <AppreciationButtons
            value={state.appreciation}
            disabled={disabled}
            onChange={(appreciation) => onChange({ appreciation })}
          />
          {!isBare && !question.mandatory && (
            <SkipGlyph disabled={disabled} onSkip={() => onChange({ skipped: true })} />
          )}
        </div>
      </div>

      <QuestionBody question={question} answers={answers} disabled={disabled} onAnswer={onAnswer} />
      <QuestionComments candidateId={candidateId} questionKey={question.key} disabled={disabled} />
    </article>
  )
}
