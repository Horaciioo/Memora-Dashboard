'use client'

import { useState } from 'react'

import { RunExercise } from '@/composites/recruitment/exercise/RunExercise'
import type { RunExerciseProps } from '@/composites/recruitment/exercise/RunExercise'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface CasesExerciseProps extends Omit<RunExerciseProps, 'question'> {
  cases: ResolvedQuestion[]
}

/**
 * Case studies on offer, one played at a time
 * @param {CasesExerciseProps} props - Component props
 * @return {JSX.Element}
 */

export const CasesExercise = ({ cases, ...rest }: CasesExerciseProps) => {
  const [pickedKey, setPickedKey] = useState(cases[0]?.key)
  const current = cases.find((entry) => entry.key === pickedKey) ?? cases[0]

  if (!current) return null

  return (
    <div className="flex flex-col gap-6">
      {cases.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className={EXERCISE_STYLES.label}>{EXERCISE_COPY.casesLead}</span>
          <div className={EXERCISE_STYLES.chooser}>
            {cases.map((entry) => (
              <button
                key={entry.key}
                type="button"
                aria-pressed={entry.key === current.key}
                className={cn(
                  EXERCISE_STYLES.chooserItem,
                  entry.key === current.key && EXERCISE_STYLES.chooserOn
                )}
                onClick={() => setPickedKey(entry.key)}
              >
                {entry.prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      <RunExercise key={current.key} question={current} {...rest} />
    </div>
  )
}
