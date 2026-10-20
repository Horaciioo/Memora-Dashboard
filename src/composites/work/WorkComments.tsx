'use client'

import { useQuery } from '@tanstack/react-query'

import { CommentThread } from '@/components/structures/data/CommentThread'
import { useComments } from '@/core/hooks/data/work/useComments'
import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { commentFields } from '@/core/lib/forms/commentFields'
import type { WorkCommentKind } from '@/declarations/work/comments'
import type { CommentView } from '@/types/comments'

export interface WorkCommentsProps {
  kind: WorkCommentKind
  id: string
  label: string
}

// Form of a remark
const FIELDS = commentFields()

/**
 * Thread once loaded
 * @param {Object} props - Remarks and their record
 * @return {JSX.Element}
 */

const Thread = ({ kind, id, label, initial }: WorkCommentsProps & { initial: CommentView[] }) => {
  const thread = useComments(initial, API_ROUTES.workComments(kind, id), (commentId) =>
    API_ROUTES.workComment(kind, id, commentId)
  )

  return (
    <CommentThread
      comments={thread.comments}
      fields={FIELDS}
      issues={thread.issues}
      isSaving={thread.isSaving}
      canWrite
      label={label}
      onOpen={thread.clearIssues}
      onAdd={thread.add}
      onRemove={thread.remove}
    />
  )
}

/**
 * Remarks left on a project, task, communication or meeting
 * @param {WorkCommentsProps} props - Record to comment
 * @return {JSX.Element | null}
 */

export const WorkComments = (props: WorkCommentsProps) => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.workComments(props.kind, props.id),
    queryFn: () => apiGet<CommentView[]>(API_ROUTES.workComments(props.kind, props.id)),
  })

  return data ? <Thread {...props} initial={data} /> : null
}
