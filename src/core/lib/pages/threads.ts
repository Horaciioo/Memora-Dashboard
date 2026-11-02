import type { PageCommentView } from '@/types/pages'

/**
 * Roots in order, each with its replies
 * @param {PageCommentView[]} comments - Flat comments, oldest first
 * @return {{ root: PageCommentView, replies: PageCommentView[] }[]} - Threads
 */

export const threadsOf = (
  comments: PageCommentView[]
): { root: PageCommentView; replies: PageCommentView[] }[] => {
  const replies = Map.groupBy(
    comments.filter((comment) => comment.parentId),
    (comment) => comment.parentId ?? ''
  )

  return comments
    .filter((comment) => !comment.parentId)
    .map((root) => ({ root, replies: replies.get(root.id) ?? [] }))
}
