'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Markdown } from '@/components/elements/display/Markdown'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { Dialog } from '@/components/structures/Dialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { ContentChapterView } from '@/types/academy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { TrainingBlockKinds } from '@/utils/constants/hierarchy'

export interface TrainingContentViewerProps {
  trainingId: string | null
  onClose: () => void
}

/**
 * Score of a submitted quiz
 * @typedef {Object} QuizScore
 * @property {number} correct - Questions answered correctly
 * @property {number} total - Questions in the quiz
 */

interface QuizScore {
  correct: number
  total: number
}

/**
 * Quiz block taken through a form dialog, its questions grouped into tabs
 * @param {string | null} blockId - Block identifier, mounted only while set
 * @param {() => void} onClose - Dismiss handler
 * @param {() => void} onScored - Called once the quiz is graded, to refresh the outline
 * @return {JSX.Element}
 */

const QuizDialog = ({
  blockId,
  onClose,
  onScored,
}: {
  blockId: string | null
  onClose: () => void
  onScored: () => void
}) => {
  const [track, setTrack] = useState<{ blockId: string | null; fields: FieldDefinition[] | null }>({
    blockId,
    fields: null,
  })
  const { isSaving, issues, run } = useMutation()
  const { notify } = useNotifications()

  // A new block starts loaded-blank during this render, the effect below fills it in
  if (track.blockId !== blockId) setTrack({ blockId, fields: null })

  useEffect(() => {
    if (!blockId) return

    let cancelled = false
    void apiGet<FieldDefinition[]>(API_ROUTES.blockQuiz(blockId)).then((next) => {
      if (!cancelled)
        setTrack((current) => (current.blockId === blockId ? { blockId, fields: next } : current))
    })

    return () => {
      cancelled = true
    }
  }, [blockId])

  const fields = track.blockId === blockId ? track.fields : null

  const submit = async (values: FormValues) => {
    if (!blockId) return false

    const score = await run(() => apiPost<QuizScore>(API_ROUTES.blockQuiz(blockId), values))
    if (!score) return false

    notify({
      tone: 'success',
      title: `${score.correct}/${score.total} ${ACADEMY_COPY.quizResultSuffix}`,
    })
    onScored()

    return true
  }

  return (
    <FormDialog
      open={blockId !== null && fields !== null}
      title={ACADEMY_COPY.takeQuiz}
      fields={fields ?? []}
      issues={issues}
      isSaving={isSaving}
      submitLabel={ACADEMY_COPY.quizSubmit}
      size="lg"
      onSubmit={submit}
      onClose={onClose}
    />
  )
}

/**
 * A training's content, browsed chapter by chapter, quizzes opening in their own dialog
 * @param {string | null} trainingId - Training identifier, mounted only while set
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const TrainingContentViewer = ({ trainingId, onClose }: TrainingContentViewerProps) => {
  const [quizBlockId, setQuizBlockId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [track, setTrack] = useState<{
    trainingId: string | null
    reloadToken: number
    chapters: ContentChapterView[] | null
  }>({ trainingId, reloadToken, chapters: null })

  // A new training, or a requested reload, starts loaded-blank during this render
  if (track.trainingId !== trainingId || track.reloadToken !== reloadToken) {
    setTrack({ trainingId, reloadToken, chapters: null })
  }

  useEffect(() => {
    if (!trainingId) return

    let cancelled = false
    void apiGet<ContentChapterView[]>(API_ROUTES.myTrainingContent(trainingId)).then((next) => {
      if (!cancelled) {
        setTrack((current) =>
          current.trainingId === trainingId && current.reloadToken === reloadToken
            ? { trainingId, reloadToken, chapters: next }
            : current
        )
      }
    })

    return () => {
      cancelled = true
    }
  }, [trainingId, reloadToken])

  const chapters =
    track.trainingId === trainingId && track.reloadToken === reloadToken ? track.chapters : null

  return (
    <>
      <Dialog
        open={trainingId !== null}
        onClose={onClose}
        title={ACADEMY_COPY.trainingContentTitle}
        size="lg"
      >
        {chapters === null ? (
          <SkeletonList shape="row" rows={3} />
        ) : chapters.length === 0 ? (
          <EmptyState
            figure="academy"
            title={ACADEMY_COPY.noContentTitle}
            description={ACADEMY_COPY.noContentDescription}
            action={<Badge label={ACADEMY_COPY.noContentTitle} tone="neutral" />}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {chapters.map((chapter) => (
              <section key={chapter.id} className="flex flex-col gap-3">
                <h3 className="text-lg font-bold">{chapter.title}</h3>
                {chapter.blocks.map((block) =>
                  block.kind === TrainingBlockKinds.Text ? (
                    block.body && <Markdown key={block.id} source={block.body} />
                  ) : (
                    <div key={block.id} className={LIST_STYLES.item}>
                      <span className="min-w-0 flex-1 text-sm text-[var(--color-ink-subtle)]">
                        {`${block.questionCount} ${block.questionCount === 1 ? ACADEMY_COPY.quizQuestionCountOne : ACADEMY_COPY.quizQuestionCount}`}
                      </span>
                      {block.answered && <Badge label={ACADEMY_COPY.quizAnswered} tone="success" />}
                      <Button variant="primary" onClick={() => setQuizBlockId(block.id)}>
                        {ACADEMY_COPY.takeQuiz}
                      </Button>
                    </div>
                  )
                )}
              </section>
            ))}
          </div>
        )}
      </Dialog>

      <QuizDialog
        blockId={quizBlockId}
        onClose={() => setQuizBlockId(null)}
        onScored={() => {
          setQuizBlockId(null)
          setReloadToken((current) => current + 1)
        }}
      />
    </>
  )
}
