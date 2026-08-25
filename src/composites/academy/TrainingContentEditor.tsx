'use client'

import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Markdown } from '@/components/elements/display/Markdown'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useTrainingContent } from '@/core/hooks/data/useTrainingContent'
import {
  blockFields,
  chapterFields,
  choiceFields,
  questionFields,
} from '@/core/services/academy/trainingContentFields'
import { TRAINING_CONTENT_COPY, TRAINING_CONTENT_FIELD_COPY } from '@/declarations/academy/copy'
import { TRAINING_BLOCK_KIND_REGISTRY } from '@/declarations/academy/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { toTone } from '@/declarations/ui/theme'
import { LIST_STYLES } from '@/declarations/ui/variants'
import type {
  QuizChoiceView,
  QuizQuestionView,
  TrainingBlockView,
  TrainingChapterView,
} from '@/types/academy'
import { TrainingBlockKinds } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'

// Single drop container, chapters only reorder within their own list
const CHAPTERS_CONTAINER = 'chapters'

type DialogState =
  | { kind: 'chapter'; editing: TrainingChapterView | null }
  | { kind: 'block'; chapterId: string; editing: TrainingBlockView | null }
  | { kind: 'question'; blockId: string; editing: QuizQuestionView | null }
  | { kind: 'choice'; questionId: string; editing: QuizChoiceView | null }
  | null

type PendingDelete =
  | { kind: 'chapter'; row: TrainingChapterView }
  | { kind: 'block'; row: TrainingBlockView }
  | { kind: 'question'; row: QuizQuestionView }
  | { kind: 'choice'; row: QuizChoiceView }
  | null

export interface TrainingContentEditorProps {
  trainingId: string
  initialChapters: TrainingChapterView[]
  canManage: boolean
}

/**
 * Author a training's content — chapters, blocks, and the quizzes inside them
 * @param {string} trainingId - Training identifier
 * @param {TrainingChapterView[]} initialChapters - Chapters resolved server-side
 * @param {boolean} canManage - Member may edit the content
 * @return {JSX.Element}
 */

export const TrainingContentEditor = ({
  trainingId,
  initialChapters,
  canManage,
}: TrainingContentEditorProps) => {
  const content = useTrainingContent(trainingId, initialChapters)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [pending, setPending] = useState<PendingDelete>(null)

  const { over, itemProps, containerProps } = useDragAndDrop((item, _container, index) => {
    const current = content.chapters.map((chapter) => chapter.id)
    const from = current.indexOf(item.id)
    if (from === -1) return

    const without = current.filter((id) => id !== item.id)
    const target = Math.min(index > from ? index - 1 : index, without.length)
    without.splice(Math.max(0, target), 0, item.id)

    void content.reorderChapters(without)
  })

  const openDialog = (next: DialogState) => {
    content.clearIssues()
    setDialog(next)
  }

  const submit = async (values: Parameters<typeof content.addChapter>[0]) => {
    if (!dialog) return false

    if (dialog.kind === 'chapter') {
      return dialog.editing
        ? content.editChapter(dialog.editing.id, values)
        : content.addChapter(values)
    }
    if (dialog.kind === 'block') {
      return dialog.editing
        ? content.editBlock(dialog.editing.id, values)
        : content.addBlock(dialog.chapterId, values)
    }
    if (dialog.kind === 'question') {
      return dialog.editing
        ? content.editQuestion(dialog.editing.id, values)
        : content.addQuestion(dialog.blockId, values)
    }

    return dialog.editing
      ? content.editChoice(dialog.editing.id, values)
      : content.addChoice(dialog.questionId, values)
  }

  const confirmDelete = async () => {
    if (!pending) return

    if (pending.kind === 'chapter') await content.dropChapter(pending.row.id)
    else if (pending.kind === 'block') await content.dropBlock(pending.row.id)
    else if (pending.kind === 'question') await content.dropQuestion(pending.row.id)
    else await content.dropChoice(pending.row.id)

    setPending(null)
  }

  const renderChoice = (question: QuizQuestionView, choice: QuizChoiceView) => (
    <div key={choice.id} className={LIST_STYLES.item}>
      <span className="min-w-0 flex-1 truncate text-sm">{choice.label}</span>
      {choice.correct && (
        <Badge label={TRAINING_CONTENT_FIELD_COPY.choiceCorrect} tone="success" icon="confirm" />
      )}
      <Button
        variant="icon"
        icon="edit"
        aria-label={ACTION_COPY.edit}
        disabled={!canManage}
        onClick={() => openDialog({ kind: 'choice', questionId: question.id, editing: choice })}
      />
      <Button
        variant="icon"
        icon="remove"
        aria-label={ACTION_COPY.delete}
        disabled={!canManage}
        onClick={() => setPending({ kind: 'choice', row: choice })}
      />
    </div>
  )

  const renderQuestion = (block: TrainingBlockView, question: QuizQuestionView) => (
    <article key={question.id} className={cn(LIST_STYLES.card, 'gap-2')}>
      <header className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 font-medium">{question.prompt}</span>
        {question.multiple && (
          <Badge label={TRAINING_CONTENT_FIELD_COPY.questionMultiple} tone="info" />
        )}
        <Button
          variant="icon"
          icon="edit"
          aria-label={ACTION_COPY.edit}
          disabled={!canManage}
          onClick={() => openDialog({ kind: 'question', blockId: block.id, editing: question })}
        />
        <Button
          variant="icon"
          icon="remove"
          aria-label={ACTION_COPY.delete}
          disabled={!canManage}
          onClick={() => setPending({ kind: 'question', row: question })}
        />
      </header>
      <div className={LIST_STYLES.stack}>
        {question.choices.length === 0 ? (
          <EmptyState
            figure="notes"
            title={TRAINING_CONTENT_COPY.choiceEmptyTitle}
            description={TRAINING_CONTENT_COPY.choiceEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!canManage}
                onClick={() =>
                  openDialog({ kind: 'choice', questionId: question.id, editing: null })
                }
              >
                {TRAINING_CONTENT_COPY.choiceAdd}
              </Button>
            }
          />
        ) : (
          question.choices.map((choice) => renderChoice(question, choice))
        )}
        <AddRow
          label={TRAINING_CONTENT_COPY.choiceAdd}
          disabled={!canManage}
          onClick={() => openDialog({ kind: 'choice', questionId: question.id, editing: null })}
        />
      </div>
    </article>
  )

  const renderBlock = (chapter: TrainingChapterView, block: TrainingBlockView) => {
    const kind = TRAINING_BLOCK_KIND_REGISTRY.get(block.kind)

    return (
      <article key={block.id} className={cn(LIST_STYLES.card, 'gap-3')}>
        <header className="flex flex-wrap items-center gap-2">
          <Badge label={kind.label} tone={toTone(kind.accent, 'neutral')} icon={kind.icon} />
          <Button
            variant="icon"
            icon="edit"
            className="ml-auto"
            aria-label={ACTION_COPY.edit}
            disabled={!canManage}
            onClick={() => openDialog({ kind: 'block', chapterId: chapter.id, editing: block })}
          />
          <Button
            variant="icon"
            icon="remove"
            aria-label={ACTION_COPY.delete}
            disabled={!canManage}
            onClick={() => setPending({ kind: 'block', row: block })}
          />
        </header>
        {block.kind === TrainingBlockKinds.Text ? (
          block.body && <Markdown source={block.body} />
        ) : (
          <div className={LIST_STYLES.stack}>
            {block.questions.length === 0 ? (
              <EmptyState
                figure="notes"
                title={TRAINING_CONTENT_COPY.questionEmptyTitle}
                description={TRAINING_CONTENT_COPY.questionEmptyDescription}
                action={
                  <Button
                    variant="primary"
                    icon="add"
                    disabled={!canManage}
                    onClick={() =>
                      openDialog({ kind: 'question', blockId: block.id, editing: null })
                    }
                  >
                    {TRAINING_CONTENT_COPY.questionAdd}
                  </Button>
                }
              />
            ) : (
              block.questions.map((question) => renderQuestion(block, question))
            )}
            <AddRow
              label={TRAINING_CONTENT_COPY.questionAdd}
              disabled={!canManage}
              onClick={() => openDialog({ kind: 'question', blockId: block.id, editing: null })}
            />
          </div>
        )}
      </article>
    )
  }

  const renderChapter = (chapter: TrainingChapterView, index: number) => (
    <article
      key={chapter.id}
      data-drop-index={index}
      {...(canManage ? itemProps({ id: chapter.id, from: CHAPTERS_CONTAINER }) : {})}
      className={cn(LIST_STYLES.card, 'gap-3', canManage && 'cursor-grab')}
    >
      <header className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 text-lg font-bold">{chapter.title}</span>
        <Button
          variant="icon"
          icon="edit"
          aria-label={ACTION_COPY.edit}
          disabled={!canManage}
          onClick={() => openDialog({ kind: 'chapter', editing: chapter })}
        />
        <Button
          variant="icon"
          icon="remove"
          aria-label={ACTION_COPY.delete}
          disabled={!canManage}
          onClick={() => setPending({ kind: 'chapter', row: chapter })}
        />
      </header>
      <div className="flex flex-col gap-3 pl-4">
        {chapter.blocks.length === 0 ? (
          <EmptyState
            figure="notes"
            title={TRAINING_CONTENT_COPY.blockEmptyTitle}
            description={TRAINING_CONTENT_COPY.blockEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!canManage}
                onClick={() => openDialog({ kind: 'block', chapterId: chapter.id, editing: null })}
              >
                {TRAINING_CONTENT_COPY.blockAdd}
              </Button>
            }
          />
        ) : (
          chapter.blocks.map((block) => renderBlock(chapter, block))
        )}
        <AddRow
          label={TRAINING_CONTENT_COPY.blockAdd}
          disabled={!canManage}
          onClick={() => openDialog({ kind: 'block', chapterId: chapter.id, editing: null })}
        />
      </div>
    </article>
  )

  const dialogFields =
    dialog?.kind === 'chapter'
      ? chapterFields()
      : dialog?.kind === 'block'
        ? blockFields()
        : dialog?.kind === 'question'
          ? questionFields()
          : dialog?.kind === 'choice'
            ? choiceFields()
            : []

  const pendingCopy =
    pending?.kind === 'chapter'
      ? {
          title: TRAINING_CONTENT_COPY.chapterDeleteTitle,
          description: TRAINING_CONTENT_COPY.chapterDeleteDescription,
        }
      : pending?.kind === 'block'
        ? {
            title: TRAINING_CONTENT_COPY.blockDeleteTitle,
            description: TRAINING_CONTENT_COPY.blockDeleteDescription,
          }
        : pending?.kind === 'question'
          ? {
              title: TRAINING_CONTENT_COPY.questionDeleteTitle,
              description: TRAINING_CONTENT_COPY.questionDeleteDescription,
            }
          : {
              title: TRAINING_CONTENT_COPY.choiceDeleteTitle,
              description: TRAINING_CONTENT_COPY.choiceDeleteDescription,
            }

  return (
    <>
      {content.chapters.length === 0 ? (
        <EmptyState
          figure="academy"
          title={TRAINING_CONTENT_COPY.chapterEmptyTitle}
          description={TRAINING_CONTENT_COPY.chapterEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canManage}
              onClick={() => openDialog({ kind: 'chapter', editing: null })}
            >
              {TRAINING_CONTENT_COPY.chapterAdd}
            </Button>
          }
        />
      ) : (
        <div
          className={cn(
            LIST_STYLES.stack,
            over === CHAPTERS_CONTAINER && 'is-drop-target rounded-[var(--radius-lg)]'
          )}
          {...(canManage ? containerProps(CHAPTERS_CONTAINER) : {})}
        >
          {content.chapters.map((chapter, index) => renderChapter(chapter, index))}
          <AddRow
            label={TRAINING_CONTENT_COPY.chapterAdd}
            disabled={!canManage}
            onClick={() => openDialog({ kind: 'chapter', editing: null })}
          />
        </div>
      )}

      <FormDialog
        open={dialog !== null}
        title={
          dialog?.editing
            ? ACTION_COPY.edit
            : dialog?.kind === 'chapter'
              ? TRAINING_CONTENT_COPY.chapterAdd
              : dialog?.kind === 'block'
                ? TRAINING_CONTENT_COPY.blockAdd
                : dialog?.kind === 'question'
                  ? TRAINING_CONTENT_COPY.questionAdd
                  : TRAINING_CONTENT_COPY.choiceAdd
        }
        fields={dialogFields}
        initialValues={dialog?.editing?.values}
        issues={content.issues}
        isSaving={content.isSaving}
        onSubmit={submit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={pending !== null}
        title={pendingCopy.title}
        description={pendingCopy.description}
        pending={content.isSaving}
        onCancel={() => setPending(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
