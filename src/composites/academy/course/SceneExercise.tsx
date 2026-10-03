'use client'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ChoiceQuestion, picksOf } from '@/composites/academy/course/ChoiceExercises'
import { ExerciseFrame } from '@/composites/academy/course/ExerciseFrame'
import { asRecord } from '@/composites/academy/course/types'
import type { ExerciseViewProps } from '@/composites/academy/course/types'
import { ModView } from '@/composites/modview/ModView'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ExerciseBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_SCENE } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Animated case study: a live plays in the Mod View, questions follow
 * @param {ExerciseViewProps} props - Block, answer, result and handlers
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
  const { driver, controls } = useModViewScene(block.scene, {
    actorName: session?.displayName ?? COURSE_COPY.you,
  })
  const record = asRecord(answer)

  return (
    <div className={COURSE_SCENE.wide}>
      <ExerciseFrame
        kind="scene"
        title={block.title}
        result={result}
        isSaving={isSaving}
        canCheck={block.questions.every((question) => picksOf(record[question.key]).length > 0)}
        onCheck={() => onCheck()}
        onRetry={onRetry}
      >
        <div className={COURSE_SCENE.context}>
          <Markdown source={block.context} />
        </div>
        <div className={COURSE_SCENE.stage}>
          <ModView
            driver={driver}
            permissions={previewPermissions('JUNIOR')}
            panel={null}
            levelName={null}
            embedded
          />
        </div>
        <div className={COURSE_SCENE.controls}>
          <Button variant="secondary" icon="refresh" onClick={controls.restart}>
            {COURSE_COPY.sceneReplay}
          </Button>
        </div>
        <div className={COURSE_SCENE.questions}>
          {block.questions.map((question) => (
            <ChoiceQuestion
              key={question.key}
              question={question}
              picks={picksOf(record[question.key])}
              verdict={result?.marks[question.key]}
              locked={result !== undefined}
              onPick={(picks) => onAnswer({ ...record, [question.key]: picks })}
            />
          ))}
        </div>
      </ExerciseFrame>
    </div>
  )
}
