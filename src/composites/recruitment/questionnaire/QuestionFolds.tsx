'use client'

import { InterviewQuestion } from '@/composites/recruitment/questionnaire/InterviewQuestion'
import { QuestionFold } from '@/composites/recruitment/questionnaire/QuestionFold'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'

export interface QuestionFoldsProps {
  // Questions of one family drawn as folds
  questions: ResolvedQuestion[]
  candidateId: string
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}

/**
 * Folds of which one is chosen, the others read as passed
 * @param {ResolvedQuestion[]} questions - Questions of the family
 * @param {string} candidateId - Applicant interviewed
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @param {boolean} [disabled] - Blocks writing
 * @param {(key: string, patch: Partial<AnswerState>) => void} onAnswer - Called with what changed
 * @return {JSX.Element}
 */

export const QuestionFolds = ({
  questions,
  candidateId,
  answers,
  disabled,
  onAnswer,
}: QuestionFoldsProps) => {
  const isStruck = (question: ResolvedQuestion) => answers[question.key]?.skipped === true
  const hasChoice = questions.some(isStruck)

  // Opening one chooses it, closing it gives all three back
  const toggle = (chosen: ResolvedQuestion) => {
    if (disabled) return

    const isOpen = hasChoice && !isStruck(chosen)
    for (const question of questions) {
      const wantsSkip = !isOpen && question.key !== chosen.key
      if (isStruck(question) !== wantsSkip) onAnswer(question.key, { skipped: wantsSkip })
    }
  }

  return (
    <div className={INTERVIEW.folds}>
      {questions.map((question) => (
        <QuestionFold
          key={question.key}
          title={question.when ?? question.prompt}
          isOpen={hasChoice && !isStruck(question)}
          isStruck={isStruck(question)}
          onToggle={() => toggle(question)}
        >
          <InterviewQuestion
            isBare
            question={question}
            candidateId={candidateId}
            answer={answers[question.key]}
            answers={answers}
            sibling={null}
            disabled={disabled}
            onChange={(patch) => onAnswer(question.key, patch)}
            onAnswer={onAnswer}
          />
        </QuestionFold>
      ))}
    </div>
  )
}
