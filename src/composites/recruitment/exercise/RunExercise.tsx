'use client'

import { useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { ExerciseBrief } from '@/composites/recruitment/exercise/ExerciseBrief'
import { ExerciseSteps } from '@/composites/recruitment/exercise/ExerciseSteps'
import { AppreciationButtons } from '@/composites/recruitment/questionnaire/AppreciationButtons'
import { QuestionComments } from '@/composites/recruitment/questionnaire/QuestionComments'
import { BLANK_ANSWER } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISES } from '@/declarations/recruitment/exercises'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'

// Where the recruiter stands in the exercise
type Phase = 'brief' | 'shown' | 'running' | 'done'

// Button label per phase
const ACTIONS: Record<Phase, string | null> = {
  brief: EXERCISE_COPY.showQuestionnaire,
  shown: EXERCISE_COPY.startExercise,
  running: null,
  done: null,
}

export interface RunExerciseProps {
  question: ResolvedQuestion
  candidateId: string
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
}

/**
 * One exercise played question by question
 * @param {RunExerciseProps} props - Component props
 * @return {JSX.Element}
 */

export const RunExercise = ({
  question,
  candidateId,
  answers,
  disabled,
  onAnswer,
}: RunExerciseProps) => {
  const [phase, setPhase] = useState<Phase>('brief')
  const state = answers[question.key] ?? BLANK_ANSWER
  const cutsOff = question.exercise ? EXERCISES[question.exercise].cutsOff : false

  return (
    <div className="flex flex-col gap-6">
      <div className={EXERCISE_STYLES.head}>
        <h3 className={EXERCISE_STYLES.title}>{question.prompt}</h3>
        <div className={EXERCISE_STYLES.headActions}>
          <AppreciationButtons
            value={state.appreciation}
            disabled={disabled}
            onChange={(appreciation) => onAnswer(question.key, { appreciation })}
          />
        </div>
      </div>

      <ExerciseBrief
        question={question}
        actionLabel={ACTIONS[phase]}
        onAction={() => setPhase(phase === 'brief' ? 'shown' : 'running')}
      />

      {phase !== 'brief' && (
        <div className="exercise-arrive flex flex-col gap-4">
          {question.scenario && (
            <div className={EXERCISE_STYLES.scenario}>
              <Markdown source={question.scenario} />
            </div>
          )}
          <ExerciseSteps
            question={question}
            answers={answers}
            mode={phase === 'running' ? 'running' : phase === 'done' ? 'done' : 'shown'}
            cutsOff={cutsOff}
            disabled={disabled}
            onAnswer={onAnswer}
            onFinish={() => setPhase('done')}
          />
          {phase === 'done' && <p className={EXERCISE_STYLES.runInfo}>{EXERCISE_COPY.runOver}</p>}
        </div>
      )}

      <QuestionComments candidateId={candidateId} questionKey={question.key} disabled={disabled} />
    </div>
  )
}
