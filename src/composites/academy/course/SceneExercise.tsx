'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ChoiceQuestion, picksOf } from '@/composites/academy/course/ChoiceExercises'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { SceneStage } from '@/composites/academy/course/SceneStage'
import { asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_SCENE } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Animated case study: a live plays in the Mod View
 * @param {ExerciseViewProps} props - Block
 * @return {JSX.Element}
 */

export const SceneExercise = ({
  block,
  answer,
  result,
  isSaving,
  onAnswer,
  onCheck,
  onRetry,
}: ExerciseViewProps<Extract<ExerciseBlock, { kind: 'scene' }>>) => {
  const { session } = useAuthContext()
  const record = asRecord(answer)
  const [index, setIndex] = useState(0)
  const question = block.questions[index]

  return (
    <div className={COURSE_SCENE.wide}>
      <div className={COURSE_SCENE.column}>
        <ExerciseFrame
          isBare
          kind="scene"
          title={block.title}
          result={result}
          isSaving={isSaving}
          canCheck={block.questions.every((question) => picksOf(record[question.key]).length > 0)}
          onCheck={() => onCheck()}
          onRetry={onRetry}
        >
          <div className={COURSE_SCENE.flow}>
            <Markdown source={block.context} className={COURSE_SCENE.context} />
            <SceneStage
              scene={block.scene}
              conversation={block.conversation}
              reaction={block.reaction}
              actorName={session?.displayName ?? COURSE_COPY.you}
            />
            <div className={COURSE_SCENE.questions}>
              <ChoiceQuestion
                key={question.key}
                question={question}
                picks={picksOf(record[question.key])}
                verdict={result?.marks[question.key]}
                locked={result !== undefined}
                onPick={(picks) => onAnswer({ ...record, [question.key]: picks })}
              />
              <div className={COURSE_SCENE.pager}>
                <Button
                  variant="secondary"
                  icon="back"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  {COURSE_COPY.questionPrevious}
                </Button>
                <span className={COURSE_SCENE.pagerCount}>
                  {COURSE_COPY.questionCount(index + 1, block.questions.length)}
                </span>
                <Button
                  variant="secondary"
                  icon="forward"
                  disabled={index === block.questions.length - 1}
                  onClick={() => setIndex(index + 1)}
                >
                  {COURSE_COPY.questionNext}
                </Button>
              </div>
            </div>
          </div>
        </ExerciseFrame>
      </div>
    </div>
  )
}
