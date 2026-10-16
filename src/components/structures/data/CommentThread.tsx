'use client'

import { useState } from 'react'

import { AddRow } from '@/components/structures/inline/AddRow'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { Section } from '@/components/structures/page/Section'
import { ACTION_COPY, COMMENT_COPY } from '@/declarations/ui/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { COMMENT_THREAD } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { CommentView } from '@/types/comments'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'
import { formatDayTime } from '@/utils/format/dates'
import { splitMentions } from '@/utils/format/mentions'

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
 * Remarks left on a record, written in a drawer and removed with a right click
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
              {[comment.authorName, formatDayTime(comment.createdAt)].filter(Boolean).join(' · ')}
            </span>
            <p className={COMMENT_THREAD.body}>
              {splitMentions(comment.body).map((piece, index) =>
                piece.isMention ? (
                  <mark key={index} className={COMMENT_THREAD.mention}>
                    {piece.text}
                  </mark>
                ) : (
                  piece.text
                )
              )}
            </p>
          </article>
        ))}
        <AddRow
          label={COMMENT_COPY.add}
          disabled={!canWrite}
          onClick={() => {
            onOpen()
            setAdding(true)
          }}
        />
      </div>

      <FormDrawer
        subject={FORM_SUBJECTS.comment}
        open={isAdding}
        title={COMMENT_COPY.add}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={onAdd}
        onClose={() => setAdding(false)}
      />

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
