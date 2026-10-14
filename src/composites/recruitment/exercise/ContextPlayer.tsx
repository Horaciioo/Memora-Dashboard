'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ContextStage } from '@/composites/recruitment/exercise/ContextStage'
import { ApiClientError, apiPost, messageOf } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { EXERCISE_PUBLIC_COPY } from '@/declarations/recruitment/exerciseCopy'
import type { WrittenContext } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_PUBLIC } from '@/declarations/ui/variants'
import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'

export interface ContextPlayerProps {
  token: string
  context: WrittenContext
  platform: RecruitmentPlatformName
  // Brief and lead with the platform words filled in
  brief: string
  lead: string
  playsLeft: number
}

/**
 * The situation the candidate watches, a few times, then writes about
 * @param {ContextPlayerProps} props - Component props
 * @return {JSX.Element}
 */

export const ContextPlayer = ({
  token,
  context,
  platform,
  brief,
  lead,
  playsLeft,
}: ContextPlayerProps) => {
  const [left, setLeft] = useState(playsLeft)
  const [run, setRun] = useState(0)
  const [failure, setFailure] = useState<string | null>(null)
  const [isBusy, setBusy] = useState(false)

  const play = async () => {
    setBusy(true)
    setFailure(null)

    try {
      const counted = await apiPost<{ left: number }>(API_ROUTES.exercisePlay(token), {})
      setLeft(counted.left)
      setRun((current) => current + 1)
    } catch (error) {
      setFailure(
        error instanceof ApiClientError ? messageOf(error) : EXERCISE_PUBLIC_COPY.noPlaysLeft
      )
      setLeft(0)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={EXERCISE_PUBLIC.stage}>
      {run > 0 && <ContextStage key={run} context={context} platform={platform} />}

      <section className={EXERCISE_PUBLIC.brief}>
        <span className={EXERCISE_PUBLIC.briefLabel}>{EXERCISE_PUBLIC_COPY.yourTurn}</span>
        <p className={EXERCISE_PUBLIC.briefText}>{brief}</p>
        <p className={EXERCISE_PUBLIC.note}>{lead}</p>
      </section>

      <div className={EXERCISE_PUBLIC.controls}>
        {left > 0 ? (
          <Button variant="primary" isLoading={isBusy} onClick={() => void play()}>
            {run === 0 ? EXERCISE_PUBLIC_COPY.start : EXERCISE_PUBLIC_COPY.replay}
          </Button>
        ) : (
          <p className={EXERCISE_PUBLIC.note}>{EXERCISE_PUBLIC_COPY.noPlaysLeft}</p>
        )}
        {left > 0 && (
          <span className={EXERCISE_PUBLIC.note}>
            {EXERCISE_PUBLIC_COPY.playsLeft.replace('{left}', String(left))}
          </span>
        )}
        {failure && <span className={EXERCISE_PUBLIC.error}>{failure}</span>}
      </div>
    </div>
  )
}
