import { Avatar } from '@/components/elements/display/Avatar'
import { Section } from '@/components/structures/Section'
import { TRAINING_FEEDBACK_COPY } from '@/declarations/academy/copy'
import { TRAINING_FEEDBACK } from '@/declarations/ui/variants'
import type { TrainingFeedbackSummary } from '@/types/academy'
import { formatDay } from '@/utils/format/dates'

export interface TrainingFeedbackPanelProps {
  summary: TrainingFeedbackSummary
}

// One decimal mark
const outOfTen = (value: number | null): string | null =>
  value === null
    ? null
    : TRAINING_FEEDBACK_COPY.outOfTen.replace('{value}', value.toFixed(1).replace('.', ','))

/**
 * Training reviews
 * @param {TrainingFeedbackSummary} summary - Averages and comments
 * @return {JSX.Element}
 */

export const TrainingFeedbackPanel = ({ summary }: TrainingFeedbackPanelProps) => {
  const marks = [
    { label: TRAINING_FEEDBACK_COPY.content, value: outOfTen(summary.content) },
    { label: TRAINING_FEEDBACK_COPY.fluency, value: outOfTen(summary.fluency) },
  ]

  return (
    <Section title={TRAINING_FEEDBACK_COPY.title} description={TRAINING_FEEDBACK_COPY.lead} padded>
      {summary.reviews === 0 ? (
        <p className={TRAINING_FEEDBACK.empty}>{TRAINING_FEEDBACK_COPY.empty}</p>
      ) : (
        <div className={TRAINING_FEEDBACK.stack}>
          <div className={TRAINING_FEEDBACK.marks}>
            {marks.map((mark) => (
              <div key={mark.label} className={TRAINING_FEEDBACK.mark}>
                <span className={TRAINING_FEEDBACK.markLabel}>{mark.label}</span>
                <span className={TRAINING_FEEDBACK.markValue}>{mark.value}</span>
              </div>
            ))}
          </div>

          {summary.comments.length === 0 ? (
            <p className={TRAINING_FEEDBACK.empty}>{TRAINING_FEEDBACK_COPY.noComments}</p>
          ) : (
            <ul className={TRAINING_FEEDBACK.list}>
              {summary.comments.map((entry) => (
                <li key={entry.id} className={TRAINING_FEEDBACK.row}>
                  <Avatar name={entry.memberName} src={entry.avatarUrl} size="sm" />
                  <div className={TRAINING_FEEDBACK.head}>
                    <span className={TRAINING_FEEDBACK.name}>{entry.memberName}</span>
                    <span className={TRAINING_FEEDBACK.meta}>
                      {`${TRAINING_FEEDBACK_COPY.content} ${entry.content}, ${TRAINING_FEEDBACK_COPY.fluency} ${entry.fluency}, ${formatDay(entry.createdAt)}`}
                    </span>
                  </div>
                  <p className={TRAINING_FEEDBACK.comment}>{entry.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  )
}
