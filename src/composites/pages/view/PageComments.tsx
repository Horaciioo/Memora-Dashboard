'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { usePageComments } from '@/core/hooks/data/pages'
import { usePageCommentsShown } from '@/core/hooks/interaction/state/usePageCommentsShown'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_COMMENT_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'

export interface PageCommentsProps {
  pageId: string
  canComment: boolean
  // Full access may tidy every comment
  canModerate: boolean
}

/**
 * Discussion rail floating beside a page, folded to its icon
 * @param {PageCommentsProps} props - Page and rights
 * @return {JSX.Element | null}
 */

export const PageComments = ({ pageId, canComment, canModerate }: PageCommentsProps) => {
  const { comments, add, resolve, remove } = usePageComments(pageId)
  const { isShown } = usePageCommentsShown()
  const [isOpen, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const ChatIcon = ICONS.chat
  const ResolveIcon = ICONS.confirm
  const ReopenIcon = ICONS.undo
  const RemoveIcon = ICONS.remove

  if (!isShown) return null

  return (
    <aside className={PAGE_VIEW_STYLES.commentsHost}>
      <button
        type="button"
        aria-label={isOpen ? PAGE_COMMENT_COPY.close : PAGE_COMMENT_COPY.open}
        aria-expanded={isOpen}
        className={cn(PAGE_VIEW_STYLES.commentsToggle, isOpen && PAGE_VIEW_STYLES.commentsToggleOpen)}
        onClick={() => setOpen(!isOpen)}
      >
        <ChatIcon className={PAGE_VIEW_STYLES.commentsGlyph} aria-hidden="true" />
      </button>

      {isOpen && (
        <section aria-labelledby="page-comments-title" className={PAGE_VIEW_STYLES.commentsRail}>
          <h2 id="page-comments-title" className={PAGE_VIEW_STYLES.commentsTitle}>
            {PAGE_COMMENT_COPY.title}
          </h2>

          {comments.length === 0 && <p className={PAGE_VIEW_STYLES.commentsEmpty}>{PAGE_COMMENT_COPY.empty}</p>}

          <ul className={PAGE_VIEW_STYLES.commentList}>
            {comments.map((comment) => (
              <li key={comment.id} className={cn(PAGE_VIEW_STYLES.comment, comment.resolvedAt && PAGE_VIEW_STYLES.commentResolved)}>
                <Avatar name={comment.authorName} src={comment.authorImage} size="xs" />
                <div className={PAGE_VIEW_STYLES.commentBody}>
                  <span className={PAGE_VIEW_STYLES.commentAuthor}>{comment.authorName}</span>
                  <span className={PAGE_VIEW_STYLES.commentDate}>{formatDayTime(comment.createdAt)}</span>
                  <p className={PAGE_VIEW_STYLES.commentText}>{comment.body}</p>
                </div>
                {(comment.isMine || canModerate) && (
                  <div className={PAGE_VIEW_STYLES.commentActions}>
                    <button
                      type="button"
                      aria-label={comment.resolvedAt ? PAGE_COMMENT_COPY.reopen : PAGE_COMMENT_COPY.resolve}
                      title={comment.resolvedAt ? PAGE_COMMENT_COPY.reopen : PAGE_COMMENT_COPY.resolve}
                      className={PAGE_VIEW_STYLES.commentAction}
                      onClick={() => void resolve(comment.id, !comment.resolvedAt)}
                    >
                      {comment.resolvedAt ? (
                        <ReopenIcon className={PAGE_VIEW_STYLES.commentActionGlyph} aria-hidden="true" />
                      ) : (
                        <ResolveIcon className={PAGE_VIEW_STYLES.commentActionGlyph} aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={PAGE_COMMENT_COPY.remove}
                      title={PAGE_COMMENT_COPY.remove}
                      className={PAGE_VIEW_STYLES.commentAction}
                      onClick={() => void remove(comment.id)}
                    >
                      <RemoveIcon className={PAGE_VIEW_STYLES.commentActionGlyph} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {canComment && (
            <form
              className={PAGE_VIEW_STYLES.commentForm}
              onSubmit={async (event) => {
                event.preventDefault()
                if (draft.trim() && (await add(draft))) setDraft('')
              }}
            >
              <textarea
                value={draft}
                rows={2}
                maxLength={PAGE_SETTINGS.commentMaxLength}
                aria-label={PAGE_COMMENT_COPY.placeholder}
                placeholder={PAGE_COMMENT_COPY.placeholder}
                className={PAGE_VIEW_STYLES.commentInput}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" disabled={!draft.trim()} className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}>
                {PAGE_COMMENT_COPY.send}
              </button>
            </form>
          )}
        </section>
      )}
    </aside>
  )
}
