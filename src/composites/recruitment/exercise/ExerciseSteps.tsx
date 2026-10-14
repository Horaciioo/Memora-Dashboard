'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import {
  AppreciationButtons,
  SkipGlyph,
} from '@/composites/recruitment/questionnaire/AppreciationButtons'
import { StepClock } from '@/composites/recruitment/exercise/StepClock'
import { pauseSeconds, stepKey } from '@/core/lib/recruitment/exercises'
import { BLANK_ANSWER } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'
import { cn } from '@/utils/classnames'

export interface ExerciseStepsProps {
  question: ResolvedQuestion
  answers: Record<string, AnswerState>
  mode: 'shown' | 'running' | 'done'
  // Moves on by itself when the time is up
  cutsOff: boolean
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
  onFinish: () => void
}

/**
 * Questions of an exercise, the live one lit with its clock and the others greyed
 * @param {ExerciseStepsProps} props - Component props
 * @return {JSX.Element}
 */

export const ExerciseSteps = ({
  question,
  answers,
  mode,
  cutsOff,
  disabled,
  onAnswer,
  onFinish,
}: ExerciseStepsProps) => {
  const [index, setIndex] = useState(0)
  const total = question.steps.length
  const cursor = mode === 'done' ? total : index

  const next = () => (index + 1 >= total ? onFinish() : setIndex(index + 1))

  return (
    <div className="flex flex-col gap-4">
      <ol className={EXERCISE_STYLES.steps}>
        {question.steps.map((step, position) => {
          const key = stepKey(question.key, position)
          const state = answers[key] ?? BLANK_ANSWER
          const isLive = mode === 'running' && position === cursor
          const isDone = mode !== 'shown' && position < cursor
          const seconds =
            pauseSeconds(step.pause) ?? (cutsOff ? EXERCISE_SETTINGS.defaultStepSeconds : null)

          return (
            <li
              key={step.prompt}
              className={cn(
                EXERCISE_STYLES.step,
                mode === 'running' && !isLive && !isDone && EXERCISE_STYLES.stepIdle,
                isDone && EXERCISE_STYLES.stepDone,
                isLive && EXERCISE_STYLES.stepLive
              )}
              aria-current={isLive ? 'step' : undefined}
            >
              <span className={EXERCISE_STYLES.stepNumber}>{position + 1}</span>
              <span className={cn(EXERCISE_STYLES.stepPrompt, state.skipped && 'line-through')}>
                {step.prompt}
              </span>
              {isLive ? (
                <StepClock key={position} seconds={seconds} onEnd={cutsOff ? next : undefined} />
              ) : (
                step.pause && <span className={EXERCISE_STYLES.stepPause}>{step.pause}</span>
              )}
              {(isLive || isDone) && (
                <div className={EXERCISE_STYLES.headActions}>
                  <AppreciationButtons
                    value={state.appreciation}
                    disabled={disabled}
                    onChange={(appreciation) => onAnswer(key, { appreciation })}
                  />
                  <SkipGlyph
                    disabled={disabled}
                    onSkip={() => {
                      onAnswer(key, { skipped: true })
                      if (isLive) next()
                    }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {mode === 'running' && (
        <div className={EXERCISE_STYLES.runBar}>
          <span className={EXERCISE_STYLES.runInfo}>
            {EXERCISE_COPY.stepOf
              .replace('{number}', String(index + 1))
              .replace('{total}', String(total))}
          </span>
          <div className="flex gap-2">
            <Button onClick={onFinish}>{EXERCISE_COPY.stopRun}</Button>
            <Button variant="primary" onClick={next}>
              {index + 1 >= total ? EXERCISE_COPY.finishRun : EXERCISE_COPY.nextStep}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
