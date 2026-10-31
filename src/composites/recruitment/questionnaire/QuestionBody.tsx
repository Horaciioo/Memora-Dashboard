import { Markdown } from '@/components/elements/display/Markdown'
import { QuestionFold } from '@/composites/recruitment/questionnaire/QuestionFold'
import { SecondaryAsk } from '@/composites/recruitment/questionnaire/SecondaryAsk'
import { branchKey, digKey } from '@/core/lib/recruitment/questionnaire'
import type { QuestionAsk } from '@/declarations/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { INTERVIEW, QUESTION_BODY } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'

export interface QuestionBodyProps {
  question: ResolvedQuestion
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}

/**
 * Sub-questions in the open, each with its own reaction
 * @param {Object} props - Component props
 * @param {QuestionAsk[]} props.items - Sub-questions
 * @param {(askKey: string) => string} props.keyOf - Answer key of one item
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
  items: QuestionAsk[]
  keyOf: (askKey: string) => string
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}) => (
  <div className={INTERVIEW.asks}>
    {items.map((item) => (
      <SecondaryAsk
        key={item.key}
        prompt={item.text}
        answer={answers[keyOf(item.key)]}
        disabled={disabled}
        onChange={(patch) => onAnswer(keyOf(item.key), patch)}
      />
    ))}
  </div>
)

/**
 * What a question carries besides its sentence, every part folded
 * @param {ResolvedQuestion} question - Question resolved for the session
 * @param {Record<string, AnswerState>} answers - What was written, by key
 * @param {boolean} [disabled] - Blocks writing
 * @param {(key: string, patch: Partial<AnswerState>) => void} onAnswer - Called with what changed
 * @return {JSX.Element | null}
 */

export const QuestionBody = ({ question, answers, disabled, onAnswer }: QuestionBodyProps) => {
  const { say, hint, steps, scenario, digs, branches, documents } = question
  const chosen = answers[question.key]?.branch ?? null
  const isEmpty = !say && !hint && !steps.length && !scenario && !digs.length && !branches.length
  if (isEmpty && !documents?.length) return null

  return (
    <div className={QUESTION_BODY.root}>
      {branches.map((branch) => (
        <QuestionFold
          key={branch.key}
          title={branch.when}
          isOpen={chosen === branch.key}
          isStruck={chosen !== null && chosen !== branch.key}
          onToggle={() =>
            onAnswer(question.key, { branch: chosen === branch.key ? null : branch.key })
          }
        >
          {branch.say && <blockquote className={QUESTION_BODY.say}>{branch.say}</blockquote>}
          <Asks
            items={branch.asks}
            keyOf={(askKey) => branchKey(question.key, branch.key, askKey)}
            answers={answers}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        </QuestionFold>
      ))}

      {digs.length > 0 && (
        <QuestionFold title={QUESTIONNAIRE_COPY.dig}>
          <Asks
            items={digs}
            keyOf={(askKey) => digKey(question.key, askKey)}
            answers={answers}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        </QuestionFold>
      )}

      {steps.length > 0 && (
        <QuestionFold title={QUESTIONNAIRE_COPY.steps}>
          <ol className={QUESTION_BODY.steps}>
            {steps.map((step) => (
              <li key={step.prompt}>
                {step.prompt}
                {step.pause && <span className={QUESTION_BODY.pause}>{step.pause}</span>}
              </li>
            ))}
          </ol>
        </QuestionFold>
      )}

      {scenario && (
        <QuestionFold title={QUESTIONNAIRE_COPY.scenario}>
          <div className={QUESTION_BODY.scenario}>
            <Markdown source={scenario} />
          </div>
        </QuestionFold>
      )}

      {(say || hint) && (
        <QuestionFold title={say ? QUESTIONNAIRE_COPY.say : QUESTIONNAIRE_COPY.tip}>
          {say && <blockquote className={QUESTION_BODY.say}>{say}</blockquote>}
          {hint && <p className={QUESTION_BODY.hint}>{hint}</p>}
        </QuestionFold>
      )}

      {documents && documents.length > 0 && (
        <QuestionFold title={QUESTIONNAIRE_COPY.documents}>
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
        </QuestionFold>
      )}
    </div>
  )
}
