'use client'

import { Fragment } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { asList } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { holesOf, runsOf } from '@/core/lib/curriculum/scoring'
import { shuffled } from '@/core/lib/curriculum/shuffle'
import { COURSE_EXERCISE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Gap text: a sentence with holes to fill, from a menu when a word bank is offered and by typing
 * otherwise
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const FillExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'fill' }>>) => {
  const holes = holesOf(block.text)
  const runs = runsOf(block.text)
  const given = asList(answer)
  const bank = block.bank ? shuffled(block.bank, block.key) : null

  const set = (index: number, value: string) => {
    const next = holes.map((_, at) => given[at] ?? '')
    next[index] = value
    onAnswer(next)
  }

  return (
    <ExerciseFrame
      kind="fill"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={holes.every((_, index) => (given[index] ?? '').trim().length > 0)}
      onCheck={() => onCheck()}
      onRetry={onRetry}
    >
      <p className={COURSE_EXERCISE.fill}>
        {runs.map((run, index) => {
          const mark = result?.marks[String(index)]
          const tone =
            mark === undefined
              ? undefined
              : mark
                ? COURSE_EXERCISE.holeRight
                : COURSE_EXERCISE.holeWrong

          return (
            <Fragment key={index}>
              {run}
              {index < holes.length &&
                (bank ? (
                  <select
                    id={`${block.key}-${index}`}
                    aria-label={`${COURSE_COPY.fillPick} ${index + 1}`}
                    className={cn(COURSE_EXERCISE.hole, tone)}
                    value={given[index] ?? ''}
                    disabled={result !== undefined}
                    onChange={(event) => set(index, event.target.value)}
                  >
                    <option value="">{COURSE_COPY.fillPick}</option>
                    {bank.map((word) => (
                      <option key={word} value={word}>
                        {word}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${block.key}-${index}`}
                    aria-label={`${COURSE_COPY.yourAnswer} ${index + 1}`}
                    className={cn(COURSE_EXERCISE.hole, tone)}
                    value={given[index] ?? ''}
                    disabled={result !== undefined}
                    autoComplete="off"
                    onChange={(event) => set(index, event.target.value)}
                  />
                ))}
            </Fragment>
          )
        })}
      </p>
      {result && (
        <div className={COURSE_EXERCISE.explanation}>
          <Markdown source={block.explanation} />
        </div>
      )}
    </ExerciseFrame>
  )
}
