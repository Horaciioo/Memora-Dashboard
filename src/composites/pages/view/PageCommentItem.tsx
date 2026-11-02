'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { PAGE_COMMENT_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageCommentView } from '@/types/pages'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'

export interface PageCommentItemProps {
  comment: PageCommentView
  canTidy: boolean
  // Roots only
  onResolve?: () => void
  onRemove: () => void
}

/**
 * One remark: author, time, text, its own gestures
 * @param {PageCommentItemProps} props - Comment and gestures
 * @return {JSX.Element}
 */

export const PageCommentItem = ({
  comment,
  canTidy,
  onResolve,
  onRemove,
}: PageCommentItemProps) => {
  const ResolveIcon = ICONS[comment.resolvedAt ? 'undo' : 'confirm']
  const RemoveIcon = ICONS.remove
  const resolveLabel = comment.resolvedAt ? PAGE_COMMENT_COPY.reopen : PAGE_COMMENT_COPY.resolve

  return (
    <div
      className={cn(
        PAGE_VIEW_STYLES.comment,
        comment.resolvedAt && PAGE_VIEW_STYLES.commentResolved
      )}
    >
      <Avatar name={comment.authorName} src={comment.authorImage} size="xs" />
      <div className={PAGE_VIEW_STYLES.commentBody}>
        <span className={PAGE_VIEW_STYLES.commentAuthor}>{comment.authorName}</span>
        <span className={PAGE_VIEW_STYLES.commentDate}>{formatDayTime(comment.createdAt)}</span>
        <p className={PAGE_VIEW_STYLES.commentText}>{comment.body}</p>
      </div>
      {canTidy && (
        <div className={PAGE_VIEW_STYLES.commentActions}>
          {onResolve && (
            <button
              type="button"
              aria-label={resolveLabel}
              title={resolveLabel}
              className={PAGE_VIEW_STYLES.commentAction}
              onClick={onResolve}
            >
              <ResolveIcon className={PAGE_VIEW_STYLES.commentActionGlyph} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            aria-label={PAGE_COMMENT_COPY.remove}
            title={PAGE_COMMENT_COPY.remove}
            className={PAGE_VIEW_STYLES.commentAction}
            onClick={onRemove}
          >
            <RemoveIcon className={PAGE_VIEW_STYLES.commentActionGlyph} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
