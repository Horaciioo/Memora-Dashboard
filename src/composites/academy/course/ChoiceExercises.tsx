'use client'

import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type {
  CaseQuestionSeed,
  ExerciseBlock,
  QuizQuestionSeed,
} from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_EXERCISE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Keys picked for one question
 * @param {string | string[] | undefined} value - Stored pick
 * @return {string[]} - Picked keys
 */

const picksOf = (value: string | string[] | undefined): string[] =>
  Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []

/**
 * One closed question: radios when a single answer is right, boxes when several are. Once
 * checked, right choices turn green, a wrong pick red, and the reason opens under it
 * @param {Object} props - Question, picks and verdict
 * @return {JSX.Element}
 */

const ChoiceQuestion = ({
  question,
  picks,
  verdict,
  locked,
  onPick,
}: {
  question: QuizQuestionSeed
  picks: string[]
  // Right or wrong once checked
  verdict: boolean | undefined
  locked: boolean
  onPick: (picks: string[]) => void
}) => {
  const multiple = question.choices.filter((choice) => choice.correct).length > 1
  const CheckIcon = ICONS.picked

  const toggle = (key: string) =>
    onPick(
      multiple
        ? picks.includes(key)
          ? picks.filter((entry) => entry !== key)
          : [...picks, key]
        : [key]
    )

  return (
    <div className={COURSE_EXERCISE.question}>
      <p className={COURSE_EXERCISE.prompt}>{question.prompt}</p>
      <div className={COURSE_EXERCISE.choices} role={multiple ? 'group' : 'radiogroup'}>
        {question.choices.map((choice) => {
          const picked = picks.includes(choice.key)
          const shown = verdict !== undefined

          return (
            <button
              key={choice.key}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={picked}
              disabled={locked}
              onClick={() => toggle(choice.key)}
              className={cn(
                COURSE_EXERCISE.choice,
                picked && !shown && COURSE_EXERCISE.choicePicked,
                shown && choice.correct && COURSE_EXERCISE.choiceRight,
                shown && picked && !choice.correct && COURSE_EXERCISE.choiceWrong
              )}
            >
              <span
                className={cn(
                  COURSE_EXERCISE.choiceMark,
                  multiple ? COURSE_EXERCISE.choiceBox : COURSE_EXERCISE.choiceRadio
                )}
              >
                {(picked || (shown && choice.correct)) && (
                  <CheckIcon className="h-3 w-3" aria-hidden="true" />
                )}
              </span>
              {choice.label}
            </button>
          )
        })}
      </div>
      {verdict !== undefined && (
        <p className={COURSE_EXERCISE.explanation}>{question.explanation}</p>
      )}
    </div>
  )
}

/**
 * Multiple choice quiz
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const QuizExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'quiz' }>>) => {
  const record = asRecord(answer)

  return (
    <ExerciseFrame
      kind="quiz"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={block.questions.every((question) => picksOf(record[question.key]).length > 0)}
      onCheck={() => onCheck()}
      onRetry={onRetry}
    >
      {block.questions.map((question) => (
        <ChoiceQuestion
          key={question.key}
          question={question}
          picks={picksOf(record[question.key])}
          verdict={result?.marks[question.key]}
          locked={result !== undefined}
          onPick={(picks) => onAnswer({ ...record, [question.key]: picks })}
        />
      ))}
    </ExerciseFrame>
  )
}

/**
 * Case study: a situation, then closed questions and open ones, the expert's own answer to
 * an open one revealed once it is sent
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const CaseExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'case' }>>) => {
  const record = asRecord(answer)

  const answered = (question: CaseQuestionSeed): boolean =>
    question.type === 'open'
      ? typeof record[question.key] === 'string' &&
        (record[question.key] as string).trim().length > 0
      : picksOf(record[question.key]).length > 0

  return (
    <ExerciseFrame
      kind="case"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={block.questions.every(answered)}
      onCheck={() => onCheck()}
      onRetry={onRetry}
    >
      <Markdown source={block.context} />
      {block.questions.map((question) =>
        question.type === 'open' ? (
          <div key={question.key} className={COURSE_EXERCISE.question}>
            <p className={COURSE_EXERCISE.prompt}>{question.prompt}</p>
            <textarea
              id={`open-${question.key}`}
              className={COURSE_EXERCISE.open}
              value={
                typeof record[question.key] === 'string' ? (record[question.key] as string) : ''
              }
              placeholder={COURSE_COPY.openPlaceholder}
              disabled={result !== undefined}
              aria-label={question.prompt}
              onChange={(event) => onAnswer({ ...record, [question.key]: event.target.value })}
            />
            {result && (
              <div className={COURSE_EXERCISE.expert}>
                <span className={COURSE_EXERCISE.expertLabel}>{COURSE_COPY.expert}</span>
                <Markdown source={question.expert} />
              </div>
            )}
          </div>
        ) : (
          <ChoiceQuestion
            key={question.key}
            question={question}
            picks={picksOf(record[question.key])}
            verdict={result?.marks[question.key]}
            locked={result !== undefined}
            onPick={(picks) => onAnswer({ ...record, [question.key]: picks })}
          />
        )
      )}
    </ExerciseFrame>
  )
}
