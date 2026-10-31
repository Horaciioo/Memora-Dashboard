'use client'

import { Byline } from '@/components/elements/display/Byline'
import { useState } from 'react'

import { useHotComments } from '@/core/hooks/interaction/state/useHotComments'
import { CommentComposer } from '@/components/structures/data/CommentComposer'
import { Markdown } from '@/components/elements/display/Markdown'
import { AddRow } from '@/components/structures/inline/AddRow'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { Section } from '@/components/structures/page/Section'
import { ACTION_COPY, COMMENT_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { COMMENT_THREAD } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { CommentView } from '@/types/comments'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
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
  // No heading, for a thread under a field
  isCompact?: boolean
  onOpen: () => void
  onAdd: (values: FormValues) => Promise<boolean>
  onRemove: (id: string) => Promise<void>
  // Adds the pin choice
  onPin?: (id: string, pinned: boolean) => Promise<void>
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
  isCompact,
  onOpen,
  onAdd,
  onRemove,
  onPin,
}: CommentThreadProps) => {
  const { contextMenu } = useMenu()
  const BellIcon = ICONS.bell
  const [isAdding, setAdding] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const { hot, calm, names, restore } = useHotComments(comments)

  return (
    <Section title={isCompact ? undefined : COMMENT_COPY.title} bare>
      <div className="flex flex-col gap-3">
        <div>
          {comments.map((comment) => (
            <article
              key={comment.id}
              className={cn(
                COMMENT_THREAD.comment,
                hot.has(comment.id) && COMMENT_THREAD.hot,
                comment.pinned && COMMENT_THREAD.pinned
              )}
              onMouseEnter={() => calm(comment.id)}
              onContextMenu={contextMenu(
                [
                  ...(onPin
                    ? [
                        {
                          id: 'pin',
                          label: comment.pinned ? COMMENT_COPY.unpin : COMMENT_COPY.pin,
                          icon: 'star' as const,
                          disabled: !canWrite,
                          onSelect: () => void onPin(comment.id, !comment.pinned),
                        },
                      ]
                    : []),
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
                <Byline
                  name={comment.authorName}
                  avatar={comment.authorAvatar}
                  date={formatDayTime(comment.createdAt)}
                />
              </span>
              <Markdown source={comment.body} mentions className={COMMENT_THREAD.body} />
              {/* Brings the alert back */}
              {names(comment) && !hot.has(comment.id) && (
                <button
                  type="button"
                  title={COMMENT_COPY.markUnread}
                  aria-label={COMMENT_COPY.markUnread}
                  className={COMMENT_THREAD.unread}
                  onClick={() => void restore(comment.id)}
                >
                  <BellIcon className="size-4" aria-hidden="true" />
                </button>
              )}
            </article>
          ))}
        </div>
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
