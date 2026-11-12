import { answerText } from '@/core/lib/unban/answers'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { EMPTY_VALUE } from '@/declarations/ui/variants'
import type { UnbanAnswer } from '@/declarations/unban/form'
import { cn } from '@/utils/classnames'

export interface UnbanAnswersProps {
  answers: UnbanAnswer[]
  versionNumber: number
  activeNumber: number
}

/**
 * Answers as they were given
 * @param {UnbanAnswer[]} answers - Stored answers
 * @param {number} versionNumber - Form version filled
 * @param {number} activeNumber - Form version served now
 * @return {JSX.Element}
 */

export const UnbanAnswers = ({ answers, versionNumber, activeNumber }: UnbanAnswersProps) => (
  <section className={DETAIL_BLOCK.stack}>
    <div className={cn('flex flex-col text-xs', EMPTY_VALUE)}>
      <span>{UNBAN_COPY.formVersionTag.replace('{number}', String(versionNumber))}</span>
      {activeNumber > versionNumber && <span>{UNBAN_COPY.formNewer}</span>}
    </div>
    {answers.map((answer) => {
      const text = answerText(answer)

      return (
        <div key={answer.questionId} className={DETAIL_BLOCK.entry}>
          <span className={DETAIL_BLOCK.label}>{answer.label}</span>
          <span
            className={cn(DETAIL_BLOCK.value, 'whitespace-pre-wrap', text === null && EMPTY_VALUE)}
          >
            {text ?? UNBAN_COPY.emptyAnswer}
          </span>
        </div>
      )
    })}
  </section>
)
