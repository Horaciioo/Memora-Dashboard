'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_EXERCISE } from '@/declarations/ui/variants'

/**
 * Command exercise: the exact command to type, compared without case nor spaces, with a hint
 * on demand and the reason once checked
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
 * @return {JSX.Element}
 */

export const CommandExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'command' }>>) => {
  const [hinted, setHinted] = useState(false)
  const typed = typeof answer === 'string' ? answer : ''

  return (
    <ExerciseFrame
      kind="command"
      title={block.title}
      result={result}
      isSaving={isSaving}
      canCheck={typed.trim().length > 0}
      onCheck={() => onCheck()}
      onRetry={onRetry}
    >
      <Markdown source={block.prompt} />
      <input
        id={`command-${block.key}`}
        className={COURSE_EXERCISE.command}
        value={typed}
        placeholder={COURSE_COPY.commandPlaceholder}
        aria-label={COURSE_COPY.yourAnswer}
        disabled={result !== undefined}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onAnswer(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && typed.trim() && !result) onCheck()
        }}
      />
      {hinted ? (
        <p className={COURSE_EXERCISE.hint}>{`${COURSE_COPY.hint} : ${block.hint}`}</p>
      ) : (
        !result && (
          <div>
            <Button variant="ghost" icon="help" onClick={() => setHinted(true)}>
              {COURSE_COPY.showHint}
            </Button>
          </div>
        )
      )}
      {result && (
        <div className={COURSE_EXERCISE.explanation}>
          <Markdown source={block.explanation} />
        </div>
      )}
    </ExerciseFrame>
  )
}
