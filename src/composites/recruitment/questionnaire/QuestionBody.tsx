import type { ReactNode } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { SecondaryAsk } from '@/composites/recruitment/questionnaire/SecondaryAsk'
import { branchKey, digKey } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { ICONS } from '@/declarations/ui/icons'
import { INTERVIEW, QUESTION_BODY } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'

export interface QuestionBodyProps {
  question: ResolvedQuestion
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}

/**
 * One folded line, opened to read what hides under it
 * @param {Object} props - Component props
 * @param {string} props.title - Line shown while folded
 * @param {ReactNode} props.children - Content once unfolded
 * @return {JSX.Element}
 */

const Fold = ({ title, children }: { title: string; children: ReactNode }) => {
  const Chevron = ICONS.next

  return (
    <details className={QUESTION_BODY.fold}>
      <summary className={QUESTION_BODY.foldHead}>
        {title}
        <Chevron className={QUESTION_BODY.foldChevron} aria-hidden="true" />
      </summary>
      <div className={QUESTION_BODY.foldBody}>{children}</div>
    </details>
  )
}

/**
 * Sub-questions in the open, each with its own reaction
 * @param {Object} props - Component props
 * @param {string[]} props.items - Sub-questions
 * @param {(index: number) => string} props.keyOf - Answer key of one item
 * @param {Record<string, AnswerState>} props.answers - What was written, by key
 * @param {boolean} [props.disabled] - Blocks writing
 * @param {(key: string, patch: Partial<AnswerState>) => void} props.onAnswer - Called with what changed
 * @return {JSX.Element}
 */

const Asks = ({
  items,
  keyOf,
  answers,
  disabled,
  onAnswer,
}: {
  items: string[]
  keyOf: (index: number) => string
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}) => (
  <div className={INTERVIEW.asks}>
    {items.map((item, index) => (
      <SecondaryAsk
        key={item}
        prompt={item}
        answer={answers[keyOf(index)]}
        disabled={disabled}
        onChange={(patch) => onAnswer(keyOf(index), patch)}
      />
    ))}
  </div>
)

/**
 * What a question carries besides its sentence, every part folded
 * @param {ResolvedQuestion} question - Question resolved for the session
 * @return {JSX.Element | null}
 */

export const QuestionBody = ({ question, answers, disabled, onAnswer }: QuestionBodyProps) => {
  const { say, hint, steps, scenario, digs, branches, documents } = question
  const isEmpty = !say && !hint && !steps.length && !scenario && !digs.length && !branches.length
  if (isEmpty && !documents?.length) return null

  return (
    <div className={QUESTION_BODY.root}>
      {branches.map((branch, position) => (
        <section key={branch.when} className={QUESTION_BODY.group}>
          <span className={QUESTION_BODY.branchWhen}>{branch.when}</span>
          {branch.say && <blockquote className={QUESTION_BODY.say}>{branch.say}</blockquote>}
          <Asks
            items={branch.asks}
            keyOf={(index) => branchKey(question.key, position, index)}
            answers={answers}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        </section>
      ))}

      {digs.length > 0 && (
        <section className={QUESTION_BODY.group}>
          <span className={QUESTION_BODY.branchWhen}>{QUESTIONNAIRE_COPY.dig}</span>
          <Asks
            items={digs}
            keyOf={(index) => digKey(question.key, index)}
            answers={answers}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        </section>
      )}

      {steps.length > 0 && (
        <Fold title={QUESTIONNAIRE_COPY.steps}>
          <ol className={QUESTION_BODY.steps}>
            {steps.map((step) => (
              <li key={step.prompt}>
                {step.prompt}
                {step.pause && <span className={QUESTION_BODY.pause}>{step.pause}</span>}
              </li>
            ))}
          </ol>
        </Fold>
      )}

      {scenario && (
        <Fold title={QUESTIONNAIRE_COPY.scenario}>
          <div className={QUESTION_BODY.scenario}>
            <Markdown source={scenario} />
          </div>
        </Fold>
      )}

      {(say || hint) && (
        <Fold title={say ? QUESTIONNAIRE_COPY.say : QUESTIONNAIRE_COPY.tip}>
          {say && <blockquote className={QUESTION_BODY.say}>{say}</blockquote>}
          {hint && <p className={QUESTION_BODY.hint}>{hint}</p>}
        </Fold>
      )}

      {documents && documents.length > 0 && (
        <Fold title={QUESTIONNAIRE_COPY.documents}>
          <div className={QUESTION_BODY.documents}>
            {documents.map((document) => (
              <a
                key={document.url}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className={QUESTION_BODY.document}
              >
                {document.label}
              </a>
            ))}
          </div>
        </Fold>
      )}
    </div>
  )
}
