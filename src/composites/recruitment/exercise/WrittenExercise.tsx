'use client'

import { useEffect, useState } from 'react'

import { ContextPicker } from '@/composites/recruitment/exercise/ContextPicker'
import { ExerciseBrief } from '@/composites/recruitment/exercise/ExerciseBrief'
import { LinkList } from '@/composites/recruitment/exercise/LinkList'
import { AppreciationButtons } from '@/composites/recruitment/questionnaire/AppreciationButtons'
import { NoteField } from '@/composites/recruitment/questionnaire/NoteField'
import { useExerciseLinks } from '@/core/hooks/data/useExerciseLinks'
import { BLANK_ANSWER } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import type { ContextLevel } from '@/declarations/recruitment/questionnaire'
import { EXERCISE_STYLES } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'

export interface WrittenExerciseProps {
  question: ResolvedQuestion
  candidateId: string
  answers: Record<string, AnswerState>
  disabled?: boolean
  onAnswer: (key: string, patch: Partial<AnswerState>) => void
  // Told when picked contexts are waiting to be started
  onHold?: (isHeld: boolean) => void
}

// Links handed out together
const BATCH = 2

/**
 * Written contexts: pick one per difficulty, hand out the links
 * @param {WrittenExerciseProps} props - Component props
 * @return {JSX.Element}
 */

export const WrittenExercise = ({
  question,
  candidateId,
  answers,
  disabled,
  onAnswer,
  onHold,
}: WrittenExerciseProps) => {
  const [isPicking, setPicking] = useState(false)
  const [picks, setPicks] = useState<Partial<Record<ContextLevel, string>>>({})
  const { links, isSaving, generate, expire } = useExerciseLinks(candidateId)
  const state = answers[question.key] ?? BLANK_ANSWER

  const isHeld = isPicking && Object.keys(picks).length > 0

  // Navigation stays locked until the exercise starts
  useEffect(() => {
    onHold?.(isHeld)

    return () => onHold?.(false)
  }, [isHeld, onHold])

  const isReady = Boolean(picks.moderate && picks.complex)
  const label = isPicking
    ? EXERCISE_COPY.startExercise
    : links.length > 0
      ? EXERCISE_COPY.regenerate
      : EXERCISE_COPY.showContexts

  const act = async () => {
    if (!isPicking) return setPicking(true)

    const keys = [picks.moderate, picks.complex].filter((key): key is string => Boolean(key))
    if (await generate(keys)) {
      setPicking(false)
      setPicks({})
    }
  }

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
        actionLabel={label}
        isActionDisabled={disabled || isSaving || (isPicking && !isReady)}
        onAction={() => void act()}
      />

      {isPicking ? (
        <div className="exercise-arrive flex flex-col gap-3">
          <p className={EXERCISE_STYLES.runInfo}>{EXERCISE_COPY.linksLead}</p>
          <ContextPicker
            picks={picks}
            onPick={(level, key) => setPicks((current) => ({ ...current, [level]: key }))}
          />
        </div>
      ) : (
        links.length > 0 && (
          <div className="exercise-arrive flex flex-col gap-3">
            <span className={EXERCISE_STYLES.label}>{EXERCISE_COPY.linksTitle}</span>
            <LinkList
              links={links.slice(0, BATCH)}
              disabled={disabled || isSaving}
              onExpire={(id) => void expire(id)}
            />
          </div>
        )
      )}

      <NoteField
        value={state.notes}
        disabled={disabled}
        onSave={(notes) => onAnswer(question.key, { notes })}
      />
    </div>
  )
}
