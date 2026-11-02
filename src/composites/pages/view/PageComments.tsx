'use client'

import { useMemo, useState } from 'react'

import { CommentComposer } from '@/components/structures/data/CommentComposer'
import { PageCommentThread } from '@/composites/pages/view/PageCommentThread'
import { usePageComments } from '@/core/hooks/data/pages'
import { threadsOf } from '@/core/lib/pages/threads'
import { usePageCommentsShown } from '@/core/hooks/interaction/state/usePageCommentsShown'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_COMMENT_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

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
  const state = usePageComments(pageId)
  const { isShown } = usePageCommentsShown()
  const [isOpen, setOpen] = useState(false)
  const [isWriting, setWriting] = useState(false)
  const threads = useMemo(() => threadsOf(state.comments), [state.comments])
  const ChatIcon = ICONS.chat

  if (!isShown) return null

  return (
    <aside className={PAGE_VIEW_STYLES.commentsHost}>
      <button
        type="button"
        aria-label={isOpen ? PAGE_COMMENT_COPY.close : PAGE_COMMENT_COPY.open}
        aria-expanded={isOpen}
        className={cn(
          PAGE_VIEW_STYLES.commentsToggle,
          isOpen && PAGE_VIEW_STYLES.commentsToggleOpen
        )}
        onClick={() => setOpen(!isOpen)}
      >
        <ChatIcon className={PAGE_VIEW_STYLES.commentsGlyph} aria-hidden="true" />
      </button>

      {isOpen && (
        <section aria-labelledby="page-comments-title" className={PAGE_VIEW_STYLES.commentsRail}>
          <h2 id="page-comments-title" className={PAGE_VIEW_STYLES.commentsTitle}>
            {PAGE_COMMENT_COPY.title}
          </h2>

          {threads.length === 0 && (
            <p className={PAGE_VIEW_STYLES.commentsEmpty}>{PAGE_COMMENT_COPY.empty}</p>
          )}

          <ul className={PAGE_VIEW_STYLES.commentList}>
            {threads.map(({ root, replies }) => (
              <PageCommentThread
                key={root.id}
                root={root}
                replies={replies}
                comments={state}
                canComment={canComment}
                canModerate={canModerate}
              />
            ))}
          </ul>

          {canComment &&
            (isWriting ? (
              <CommentComposer
                maxLength={PAGE_SETTINGS.commentMaxLength}
                isSaving={false}
                onSubmit={async (body) => {
                  const isSent = await state.add(body)
                  if (isSent) setWriting(false)

                  return isSent
                }}
                onCancel={() => setWriting(false)}
              />
            ) : (
              <button
                type="button"
                className={PAGE_VIEW_STYLES.composerOpen}
                onClick={() => setWriting(true)}
              >
                {PAGE_COMMENT_COPY.placeholder}
              </button>
            ))}
        </section>
      )}
    </aside>
  )
}
