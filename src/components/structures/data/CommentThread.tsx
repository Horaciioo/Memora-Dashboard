'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { useState } from 'react'

import { CommentComposer } from '@/components/structures/data/CommentComposer'
import { Markdown } from '@/components/elements/display/Markdown'
import { AddRow } from '@/components/structures/inline/AddRow'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Section } from '@/components/structures/page/Section'
import { ACTION_COPY, COMMENT_COPY } from '@/declarations/ui/copy'
import { COMMENT_THREAD } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { CommentView } from '@/types/comments'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'
import { formatDayTime } from '@/utils/format/dates'

export interface CommentThreadProps {
  comments: CommentView[]
  fields: FieldDefinition[]
  issues: FieldIssue[]
  isSaving: boolean
  // Member may write and drop remarks
  canWrite: boolean
  // Name shown in the context menu
  label: string
  onOpen: () => void
  onAdd: (values: FormValues) => Promise<boolean>
  onRemove: (id: string) => Promise<void>
}

/**
 * Remarks left on a record, written in a plain area opened in place and removed with a right click
 * @param {CommentThreadProps} props - Remarks and their mutations
 * @return {JSX.Element}
 */

export const CommentThread = ({
  comments,
  fields,
  issues,
  isSaving,
  canWrite,
  label,
  onOpen,
  onAdd,
  onRemove,
}: CommentThreadProps) => {
  const { contextMenu } = useMenu()
  const [isAdding, setAdding] = useState(false)
  const [pending, setPending] = useState<string | null>(null)

  return (
    <Section title={COMMENT_COPY.title} bare>
      <div>
        {comments.map((comment) => (
          <article
            key={comment.id}
            className={COMMENT_THREAD.comment}
            onContextMenu={contextMenu(
              [
                {
                  id: 'delete',
                  label: ACTION_COPY.delete,
                  icon: 'remove',
                  danger: true,
                  disabled: !canWrite,
                  onSelect: () => setPending(comment.id),
                },
              ],
              label
            )}
          >
            <span className={COMMENT_THREAD.meta}>
              <Dotted items={[comment.authorName, formatDayTime(comment.createdAt)]} />
            </span>
            <Markdown source={comment.body} mentions className={COMMENT_THREAD.body} />
          </article>
        ))}
        {isAdding ? (
          <CommentComposer
            maxLength={fields.find((field) => field.name === 'body')?.maxLength}
            isSaving={isSaving}
            error={issues.find((issue) => issue.field === 'body')?.message}
            onSubmit={async (body) => {
              const added = await onAdd({ body })
              if (added) setAdding(false)

              return added
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <AddRow
            label={COMMENT_COPY.add}
            disabled={!canWrite}
            onClick={() => {
              onOpen()
              setAdding(true)
            }}
          />
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={COMMENT_COPY.deleteTitle}
        description={COMMENT_COPY.deleteDescription}
        pending={isSaving}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          await onRemove(pending!)
          setPending(null)
        }}
      />
    </Section>
  )
}
