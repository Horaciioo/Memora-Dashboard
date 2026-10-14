'use client'

import { CommentThread } from '@/components/structures/CommentThread'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import type { CandidateView } from '@/types/recruitment'

export interface CandidateCommentsProps {
  candidate: CandidateView
}

/**
 * Remarks left on a candidate
 * @param {CandidateView} candidate - Applicant followed
 * @return {JSX.Element}
 */

export const CandidateComments = ({ candidate }: CandidateCommentsProps) => {
  const { file, fields, can } = useRecruitmentState()

  return (
    <CommentThread
      comments={candidate.comments}
      fields={fields.comment}
      issues={file.issues}
      isSaving={file.isSaving}
      canWrite={can.writeCandidates}
      label={candidate.name}
      onOpen={file.clearIssues}
      onAdd={(values) => file.addComment(candidate.id, values)}
      onRemove={file.removeComment}
    />
  )
}
