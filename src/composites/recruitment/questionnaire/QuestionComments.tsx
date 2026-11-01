'use client'

import { CommentThread } from '@/components/structures/data/CommentThread'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'

export interface QuestionCommentsProps {
  candidateId: string
  questionKey: string
  disabled?: boolean
}

/**
 * Remarks left under one question of the interview
 * @param {string} candidateId - Applicant interviewed
 * @param {string} questionKey - Question of the bank
 * @param {boolean} [disabled] - Blocks writing
 * @return {JSX.Element | null}
 */

export const QuestionComments = ({ candidateId, questionKey, disabled }: QuestionCommentsProps) => {
  const { file, fields, can } = useRecruitmentState()
  const candidate = file.candidates.find((entry) => entry.id === candidateId)
  const comments = (candidate?.comments ?? []).filter((entry) => entry.questionKey === questionKey)
  const canWrite = can.writeCandidates && !disabled
  // An observer never reads the remarks
  if (can.observing || (comments.length === 0 && !canWrite)) return null

  return (
    <CommentThread
      isCompact
      comments={comments}
      fields={fields.comment}
      issues={file.issues}
      isSaving={file.isSaving}
      canWrite={canWrite}
      label={candidate?.name ?? ''}
      onOpen={file.clearIssues}
      onAdd={(values) => file.addComment(candidateId, { ...values, questionKey })}
      onRemove={file.removeComment}
    />
  )
}
