'use client'

import { useState } from 'react'

import { CommentComposer } from '@/components/structures/data/CommentComposer'
import { PageCommentItem } from '@/composites/pages/view/PageCommentItem'
import type { PageCommentsState } from '@/core/hooks/data/pages/usePageComments'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import { PAGE_COMMENT_COPY } from '@/declarations/pages/copy'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageCommentView } from '@/types/pages'

export interface PageCommentThreadProps {
  root: PageCommentView
  replies: PageCommentView[]
  comments: PageCommentsState
  canComment: boolean
  canModerate: boolean
}

/**
 * Root remark, its replies and a reply box
 * @param {PageCommentThreadProps} props - Thread, gestures, rights
 * @return {JSX.Element}
 */

export const PageCommentThread = ({
  root,
  replies,
  comments,
  canComment,
  canModerate,
}: PageCommentThreadProps) => {
  const [isReplying, setReplying] = useState(false)
  const canTidy = (comment: PageCommentView) => comment.isMine || canModerate

  return (
    <li className={PAGE_VIEW_STYLES.thread}>
      <PageCommentItem
        comment={root}
        canTidy={canTidy(root)}
        onResolve={() => void comments.resolve(root.id, !root.resolvedAt)}
        onRemove={() => void comments.remove(root.id)}
      />
      {replies.length > 0 && (
        <div className={PAGE_VIEW_STYLES.replies}>
          {replies.map((reply) => (
            <PageCommentItem
              key={reply.id}
              comment={reply}
              canTidy={canTidy(reply)}
              onRemove={() => void comments.remove(reply.id)}
            />
          ))}
        </div>
      )}
      {canComment && !root.resolvedAt && !isReplying && (
        <button
          type="button"
          className={PAGE_VIEW_STYLES.replyLink}
          onClick={() => setReplying(true)}
        >
          {PAGE_COMMENT_COPY.reply}
        </button>
      )}
      {isReplying && (
        <div className={PAGE_VIEW_STYLES.replies}>
          <CommentComposer
            maxLength={PAGE_SETTINGS.commentMaxLength}
            isSaving={false}
            onSubmit={async (body) => {
              const isSent = await comments.add(body, root.id)
              if (isSent) setReplying(false)

              return isSent
            }}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}
    </li>
  )
}
