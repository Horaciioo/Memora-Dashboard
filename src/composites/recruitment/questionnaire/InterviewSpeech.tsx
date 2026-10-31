import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { INTERVIEW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InterviewSpeechProps {
  question: ResolvedQuestion
}

/**
 * Text read out loud, nothing to answer or note
 * @param {ResolvedQuestion} question - Speech resolved for the session
 * @return {JSX.Element}
 */

export const InterviewSpeech = ({ question }: InterviewSpeechProps) => (
  <article className={INTERVIEW.card}>
    <h3 className={cn(INTERVIEW.prompt, INTERVIEW.promptMandatory)}>{question.prompt}</h3>
    <div className={INTERVIEW.speech}>
      {question.speech.map((line) => (
        <p key={line.text} className={cn(line.aside && INTERVIEW.speechAside)}>
          {line.text}
        </p>
      ))}
    </div>
  </article>
)
