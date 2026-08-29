'use client'

import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { Dialog } from '@/components/structures/Dialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { RECRUITMENT_COPY, RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { LIST_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'
import type { CandidateView } from '@/types/recruitment'
import { formatDayTime } from '@/utils/format/dates'

export interface CandidateDialogProps {
  candidate: CandidateView | null
  commentFields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  issues: FieldIssue[]
  isSaving: boolean
  canWrite: boolean
  onEdit: () => void
  onSaveReview: (id: string, review: string) => Promise<boolean>
  onAddComment: (id: string, values: FormValues) => Promise<boolean>
  onRemoveComment: (id: string) => Promise<void>
  onOpenMember: (memberId: string) => void
  onClose: () => void
}

/**
 * One candidate opened in full — their interview, their bilan and the remarks left on them
 * @param {CandidateView | null} candidate - Applicant opened, null while the overlay is closed
 * @param {FieldDefinition[]} commentFields - Declarations of the comment form
 * @param {FieldDefinition[]} reviewFields - Declarations of the bilan form
 * @param {FieldIssue[]} issues - Rejections of the last mutation
 * @param {boolean} isSaving - Mutation in flight
 * @param {boolean} canWrite - Member may write on the candidate
 * @param {() => void} onEdit - Opens the candidate form
 * @param {(id: string, review: string) => Promise<boolean>} onSaveReview - Bilan handler
 * @param {(id: string, values: FormValues) => Promise<boolean>} onAddComment - Remark handler
 * @param {(id: string) => Promise<void>} onRemoveComment - Remark removal handler
 * @param {(memberId: string) => void} onOpenMember - Opens the moderator file
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const CandidateDialog = ({
  candidate,
  commentFields,
  reviewFields,
  issues,
  isSaving,
  canWrite,
  onEdit,
  onSaveReview,
  onAddComment,
  onRemoveComment,
  onOpenMember,
  onClose,
}: CandidateDialogProps) => {
  const [nested, setNested] = useState<'comment' | 'review' | null>(null)
  const [pendingComment, setPendingComment] = useState<string | null>(null)

  // The overlay only mounts once a card is opened, every read below is then safe
  if (!candidate) return null

  const entries = [
    { label: RECRUITMENT_FIELD_COPY.discordId, value: candidate.discordId },
    { label: RECRUITMENT_FIELD_COPY.formId, value: candidate.formId },
    { label: RECRUITMENT_FIELD_COPY.recruiter, value: candidate.recruiter?.label ?? null },
    {
      label: RECRUITMENT_FIELD_COPY.interviewAt,
      value: candidate.interviewAt ? formatDayTime(candidate.interviewAt) : null,
    },
  ]

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title={candidate.memberName ?? candidate.discordId}
        size="lg"
        subheader={
          <span className="flex flex-wrap items-center gap-2">
            <Badge
              label={candidate.attended ? RECRUITMENT_COPY.attended : RECRUITMENT_COPY.missed}
              tone={candidate.attended ? 'success' : 'neutral'}
              icon={candidate.attended ? 'success' : 'clock'}
            />
            {candidate.memberId && (
              <Button
                variant="ghost"
                icon="members"
                onClick={() => onOpenMember(candidate.memberId!)}
              >
                {RECRUITMENT_COPY.openMember}
              </Button>
            )}
            <Button icon="edit" disabled={!canWrite} onClick={onEdit}>
              {ACTION_COPY.edit}
            </Button>
          </span>
        }
      >
        <div className="flex flex-col gap-8">
          <Section title={RECRUITMENT_COPY.tabCandidates} padded>
            <div className={DETAIL_BLOCK.grid}>
              {entries.map((entry) => (
                <span key={entry.label} className={DETAIL_BLOCK.entry}>
                  <span className={DETAIL_BLOCK.label}>{entry.label}</span>
                  <span className={entry.value ? DETAIL_BLOCK.value : DETAIL_BLOCK.empty}>
                    {entry.value ?? ACTION_COPY.none}
                  </span>
                </span>
              ))}
            </div>
          </Section>

          <Section title={RECRUITMENT_COPY.spectatorsTitle} bare>
            {candidate.spectators.length === 0 ? (
              <p className={DETAIL_BLOCK.empty}>{RECRUITMENT_COPY.noSpectator}</p>
            ) : (
              <span className="flex flex-wrap gap-1.5">
                {candidate.spectators.map((seat) => (
                  <Badge key={seat.id} label={seat.label} tone="neutral" icon="members" />
                ))}
              </span>
            )}
          </Section>

          <Section
            title={RECRUITMENT_COPY.reviewTitle}
            action={
              <Button icon="edit" disabled={!canWrite} onClick={() => setNested('review')}>
                {RECRUITMENT_COPY.reviewEdit}
              </Button>
            }
            padded={candidate.review.length > 0}
            bare={candidate.review.length === 0}
          >
            {candidate.review.length === 0 ? (
              <p className={DETAIL_BLOCK.empty}>{RECRUITMENT_COPY.reviewEmpty}</p>
            ) : (
              <Markdown source={candidate.review} />
            )}
          </Section>

          <Section title={RECRUITMENT_COPY.commentsTitle} bare>
            {candidate.comments.length === 0 ? (
              <EmptyState
                figure="notes"
                title={RECRUITMENT_COPY.commentsEmptyTitle}
                description={RECRUITMENT_COPY.commentsEmptyDescription}
                action={
                  <Button
                    variant="primary"
                    icon="add"
                    disabled={!canWrite}
                    onClick={() => setNested('comment')}
                  >
                    {RECRUITMENT_COPY.commentAdd}
                  </Button>
                }
              />
            ) : (
              <div className={LIST_STYLES.stack}>
                {candidate.comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
                  >
                    <span className="flex items-center gap-2 text-xs text-[var(--color-ink-subtle)]">
                      {[comment.authorName, formatDayTime(comment.createdAt)]
                        .filter(Boolean)
                        .join(' · ')}
                      <Button
                        variant="icon"
                        icon="remove"
                        aria-label={ACTION_COPY.delete}
                        disabled={!canWrite}
                        className="ml-auto"
                        onClick={() => setPendingComment(comment.id)}
                      />
                    </span>
                    <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
                  </article>
                ))}
                <AddRow
                  label={RECRUITMENT_COPY.commentAdd}
                  disabled={!canWrite}
                  onClick={() => setNested('comment')}
                />
              </div>
            )}
          </Section>
        </div>
      </Dialog>

      <FormDialog
        open={nested === 'comment'}
        title={RECRUITMENT_COPY.commentAdd}
        fields={commentFields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={(values) => onAddComment(candidate.id, values)}
        onClose={() => setNested(null)}
      />

      <FormDialog
        open={nested === 'review'}
        title={RECRUITMENT_COPY.reviewEdit}
        fields={reviewFields}
        initialValues={{ review: candidate.review }}
        issues={issues}
        isSaving={isSaving}
        size="lg"
        onSubmit={(values) =>
          onSaveReview(candidate.id, typeof values.review === 'string' ? values.review : '')
        }
        onClose={() => setNested(null)}
      />

      <ConfirmDialog
        open={pendingComment !== null}
        title={RECRUITMENT_COPY.commentDeleteTitle}
        description={RECRUITMENT_COPY.commentDeleteDescription}
        pending={isSaving}
        onCancel={() => setPendingComment(null)}
        onConfirm={async () => {
          await onRemoveComment(pendingComment!)
          setPendingComment(null)
        }}
      />
    </>
  )
}
