'use client'

import { Button } from '@/components/elements/actions/Button'
import { API_ROUTES } from '@/core/lib/api/routes'
import { EXERCISE_PUBLIC_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_ERRORS } from '@/declarations/recruitment/exerciseFailures'
import type { ExerciseErrorName } from '@/declarations/recruitment/exerciseFailures'
import { EXERCISE_PUBLIC } from '@/declarations/ui/variants'

// Sentence per refusal
const FAILURES: Record<ExerciseErrorName, string> = {
  [EXERCISE_ERRORS.Refused]: EXERCISE_PUBLIC_COPY.refused,
  [EXERCISE_ERRORS.WrongAccount]: EXERCISE_PUBLIC_COPY.wrongAccount,
}

export interface ExerciseGateProps {
  token: string
  failure: ExerciseErrorName | null
}

/**
 * Discord sign-in asked before the situation plays
 * @param {ExerciseGateProps} props - Component props
 * @return {JSX.Element}
 */

export const ExerciseGate = ({ token, failure }: ExerciseGateProps) => (
  <div className="flex flex-col gap-4">
    <p className={EXERCISE_PUBLIC.lead}>{EXERCISE_PUBLIC_COPY.verifyLead}</p>
    {failure && <p className={EXERCISE_PUBLIC.error}>{FAILURES[failure]}</p>}
    <Button
      variant="primary"
      className="self-start"
      onClick={() => window.location.assign(API_ROUTES.exerciseDiscord(token))}
    >
      {EXERCISE_PUBLIC_COPY.verify}
    </Button>
  </div>
)
