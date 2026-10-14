import { Button } from '@/components/elements/actions/Button'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'

export interface ExerciseBriefProps {
  question: ResolvedQuestion
  // Button closing the brief, absent once the exercise moved on
  actionLabel: string | null
  isActionDisabled?: boolean
  onAction: () => void
}

/**
 * What to say and what to dig, always in sight, then the way into the exercise
 * @param {ExerciseBriefProps} props - Component props
 * @return {JSX.Element}
 */

export const ExerciseBrief = ({
  question,
  actionLabel,
  isActionDisabled,
  onAction,
}: ExerciseBriefProps) => (
  <section className={EXERCISE_STYLES.brief}>
    {question.say && (
      <div className="flex flex-col gap-2">
        <span className={EXERCISE_STYLES.label}>{EXERCISE_COPY.sayTitle}</span>
        <blockquote className={EXERCISE_STYLES.say}>{question.say}</blockquote>
      </div>
    )}
    {question.hint && (
      <div className="flex flex-col gap-2">
        <span className={EXERCISE_STYLES.label}>{EXERCISE_COPY.tipTitle}</span>
        <p className={EXERCISE_STYLES.hint}>{question.hint}</p>
      </div>
    )}
    {question.digs.length > 0 && (
      <div className="flex flex-col gap-2">
        <span className={EXERCISE_STYLES.label}>{EXERCISE_COPY.digTitle}</span>
        <ul className={EXERCISE_STYLES.digs}>
          {question.digs.map((dig) => (
            <li key={dig}>{dig}</li>
          ))}
        </ul>
      </div>
    )}
    {actionLabel && (
      <div className={EXERCISE_STYLES.action}>
        <Button variant="primary" disabled={isActionDisabled} onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </section>
)
