import { InlineMarkdown } from '@/components/elements/display/Markdown'
import { answerText } from '@/core/lib/unban/answers'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { EMPTY_VALUE } from '@/declarations/ui/variants'
import type { UnbanAnswer } from '@/declarations/unban/form'
import { cn } from '@/utils/classnames'

export interface UnbanAnswersProps {
  answers: UnbanAnswer[]
}

/**
 * Answers as they were given
 * @param {UnbanAnswer[]} answers - Stored answers
 * @return {JSX.Element}
 */

export const UnbanAnswers = ({ answers }: UnbanAnswersProps) => (
  <section className={DETAIL_BLOCK.stack}>
    {answers.map((answer) => {
      const text = answerText(answer)

      return (
        <div key={answer.questionId} className={DETAIL_BLOCK.entry}>
          <span className={DETAIL_BLOCK.label}>
            <InlineMarkdown source={answer.label} />
          </span>
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
