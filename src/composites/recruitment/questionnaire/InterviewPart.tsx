'use client'

import { InterviewQuestion } from '@/composites/recruitment/questionnaire/InterviewQuestion'
import { InterviewSpeech } from '@/composites/recruitment/questionnaire/InterviewSpeech'
import { QuestionFolds } from '@/composites/recruitment/questionnaire/QuestionFolds'
import { partBlocks, playedSibling } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { AnswerState, CandidateView } from '@/types/recruitment'

export interface InterviewPartProps {
  questions: ResolvedQuestion[]
  candidate: CandidateView
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}

/**
 * Questions of one part, speeches and fold families included
 * @param {ResolvedQuestion[]} questions - Questions of the part
 * @param {CandidateView} candidate - Applicant interviewed
 * @param {boolean} [disabled] - Blocks writing
 * @param {(key: string, patch: Partial<AnswerState>) => void} onAnswer - Called with what changed
 * @return {JSX.Element}
 */

export const InterviewPart = ({ questions, candidate, disabled, onAnswer }: InterviewPartProps) => {
  const commented = new Set(
    candidate.comments.flatMap((entry) => (entry.questionKey ? [entry.questionKey] : []))
  )

  return (
    <div className={INTERVIEW.part}>
      {partBlocks(questions).map((block) => {
        const [first] = block.questions

        if (block.isFolds) {
          return (
            <QuestionFolds
              key={first.key}
              questions={block.questions}
              candidateId={candidate.id}
              answers={candidate.answers}
              disabled={disabled}
              onAnswer={onAnswer}
            />
          )
        }

        if (first.kind === 'speech') return <InterviewSpeech key={first.key} question={first} />

        return (
          <InterviewQuestion
            key={first.key}
            question={first}
            candidateId={candidate.id}
            answer={candidate.answers[first.key]}
            answers={candidate.answers}
            sibling={playedSibling(first, questions, candidate.answers, commented)}
            disabled={disabled}
            onChange={(patch) => onAnswer(first.key, patch)}
            onAnswer={onAnswer}
          />
        )
      })}
    </div>
  )
}
