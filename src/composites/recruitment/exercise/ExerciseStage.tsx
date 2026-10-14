'use client'

import { CasesExercise } from '@/composites/recruitment/exercise/CasesExercise'
import { RunExercise } from '@/composites/recruitment/exercise/RunExercise'
import { WrittenExercise } from '@/composites/recruitment/exercise/WrittenExercise'
import { exerciseQuestions } from '@/core/lib/recruitment/exercises'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISES } from '@/declarations/recruitment/exercises'
import type { ExerciseKey } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'

export interface ExerciseStageProps {
  exercise: ExerciseKey
  questions: ResolvedQuestion[]
  candidateId: string
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
  onHold?: (isHeld: boolean) => void
}

/**
 * The page of the exercise chosen
 * @param {ExerciseStageProps} props - Component props
 * @return {JSX.Element | null}
 */

export const ExerciseStage = ({
  exercise,
  questions,
  candidateId,
  answers,
  disabled,
  onAnswer,
  onHold,
}: ExerciseStageProps) => {
  const played = exerciseQuestions(questions, exercise)
  const first = played[0]
  if (!first) return <h3 className={EXERCISE_STYLES.title}>{EXERCISES[exercise].label}</h3>

  const shared = { answers, disabled, onAnswer }

  return (
    <div className={EXERCISE_STYLES.arrive}>
      {exercise === 'cases' ? (
        <CasesExercise cases={played} {...shared} />
      ) : exercise === 'written' ? (
        <WrittenExercise question={first} candidateId={candidateId} onHold={onHold} {...shared} />
      ) : (
        <RunExercise question={first} {...shared} />
      )}
    </div>
  )
}
