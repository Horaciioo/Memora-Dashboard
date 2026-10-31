import { totalMinutes } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { ICONS } from '@/declarations/ui/icons'
import { INTERVIEW } from '@/declarations/ui/variants'
import { roughDuration } from '@/utils/format/hours'

export interface InterviewMinutesProps {
  questions: ResolvedQuestion[]
}

/**
 * Length of the interview
 * @param {ResolvedQuestion[]} questions - Questions to ask
 * @return {JSX.Element | null}
 */

export const InterviewMinutes = ({ questions }: InterviewMinutesProps) => {
  const Clock = ICONS.clock
  const minutes = totalMinutes(questions)
  if (minutes === 0) return null

  return (
    <span className={INTERVIEW.minutes}>
      <Clock className="size-4" aria-hidden="true" />
      {QUESTIONNAIRE_COPY.minutes.replace('{duration}', roughDuration(minutes))}
    </span>
  )
}
