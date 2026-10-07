'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import type { ExerciseResult } from '@/core/lib/curriculum/scoring'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { COURSE_KIND_REGISTRY } from '@/declarations/academy/registries'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_EXERCISE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ExerciseFrameProps {
  kind: ExerciseBlock['kind']
  title: string
  result: ExerciseResult | undefined
  // Something is answered
  canCheck: boolean
  isSaving: boolean
  // Checked by the exercise itself
  autoCheck?: boolean
  // Drawn as a heading and its parts, no card
  isBare?: boolean
  onCheck: () => void
  onRetry: () => void
  children: ReactNode
}

/**
 * Shared frame of an exercise: its kind and title, the inputs, then the check button or the
 * verdict with the way to try again
 * @param {ExerciseFrameProps} props - Kind
 * @return {JSX.Element}
 */

export const ExerciseFrame = ({
  kind,
  title,
  result,
  canCheck,
  isSaving,
  autoCheck,
  isBare = false,
  onCheck,
  onRetry,
  children,
}: ExerciseFrameProps) => {
  const meta = COURSE_KIND_REGISTRY.get(kind)
  const KindIcon = ICONS[meta.icon]
  const VerdictIcon = result?.passed ? ICONS.success : ICONS.failure

  return (
    <section
      className={
        isBare
          ? COURSE_EXERCISE.bare
          : cn(
              COURSE_EXERCISE.frame,
              result?.passed && [COURSE_EXERCISE.framePassed, COURSE_EXERCISE.pop],
              result && !result.passed && [COURSE_EXERCISE.frameFailed, COURSE_EXERCISE.shake]
            )
      }
    >
      {isBare ? (
        <h2 className={COURSE_EXERCISE.bareTitle}>{title}</h2>
      ) : (
        <header className={COURSE_EXERCISE.head}>
          <KindIcon className={COURSE_EXERCISE.headIcon} aria-hidden="true" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className={COURSE_EXERCISE.kind}>{meta.label}</span>
            <h3 className={COURSE_EXERCISE.title}>{title}</h3>
          </div>
        </header>
      )}

      <div className={COURSE_EXERCISE.body}>{children}</div>

      <footer className={COURSE_EXERCISE.foot}>
        {result ? (
          <>
            <p
              role="status"
              className={cn(
                COURSE_EXERCISE.result,
                result.passed ? COURSE_EXERCISE.resultPassed : COURSE_EXERCISE.resultFailed
              )}
            >
              <VerdictIcon className={COURSE_EXERCISE.resultIcon} aria-hidden="true" />
              {result.passed ? COURSE_COPY.passed : COURSE_COPY.failed}
              {`, ${COURSE_COPY.progress(result.score, result.max)}`}
            </p>
            {!result.passed && (
              <Button icon="refresh" onClick={onRetry}>
                {COURSE_COPY.retry}
              </Button>
            )}
          </>
        ) : (
          !autoCheck && (
            <Button
              variant="primary"
              icon="confirm"
              disabled={!canCheck}
              isLoading={isSaving}
              onClick={onCheck}
            >
              {isSaving ? COURSE_COPY.saving : COURSE_COPY.check}
            </Button>
          )
        )}
      </footer>
    </section>
  )
}
