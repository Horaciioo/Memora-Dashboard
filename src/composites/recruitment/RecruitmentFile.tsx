'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarStack } from '@/components/elements/display/Avatar'
import { StatusText } from '@/components/elements/display/StatusText'
import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { Button } from '@/components/elements/actions/Button'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { Markdown } from '@/components/elements/display/Markdown'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FileTabs } from '@/components/structures/FileTabs'
import { IntegrationLinkStep } from '@/composites/onboarding/IntegrationLinkStep'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { KanbanBoard, type BoardColumn } from '@/components/structures/KanbanBoard'
import { Section } from '@/components/structures/Section'
import { useRecruitmentFile } from '@/core/hooks/data/useRecruitmentFile'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY, RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import {
  RECRUITMENT_OWNER_REGISTRY,
  RECRUITMENT_STATUS_REGISTRY,
} from '@/declarations/recruitment/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LIST_STYLES, RECORD_ROW } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import { CandidateDialog } from '@/composites/recruitment/CandidateDialog'
import type { FieldDefinition } from '@/types/forms'
import type { CandidateView, RecruitmentDetail, RecruitmentStepView } from '@/types/recruitment'
import { cn } from '@/utils/classnames'
import { formatDay, formatDayTime, isOverdue } from '@/utils/format/dates'

export interface RecruitmentFileProps {
  detail: RecruitmentDetail
  candidateFields: FieldDefinition[]
  stepFields: FieldDefinition[]
  commentFields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  instructionFields: FieldDefinition[]
  linkFields: FieldDefinition[]
  canManage: boolean
  canWriteCandidates: boolean
  canWriteInstructions: boolean
  canManageLinks: boolean
}

/**
 * Tabs of one recruitment session — candidates, script, timeline, results and consignes
 * @param {RecruitmentDetail} detail - File resolved server-side
 * @param {FieldDefinition[]} candidateFields - Declarations of the candidate form
 * @param {FieldDefinition[]} stepFields - Declarations of the timeline form
 * @param {FieldDefinition[]} commentFields - Declarations of the comment form
 * @param {FieldDefinition[]} reviewFields - Declarations of the bilan form
 * @param {FieldDefinition[]} instructionFields - Declarations of the consignes form
 * @param {boolean} canManage - Member may tend the session
 * @param {boolean} canWriteCandidates - Member may write on a candidate
 * @param {boolean} canWriteInstructions - Member may write the consignes
 * @return {JSX.Element}
 */

export const RecruitmentFile = ({
  detail,
  candidateFields,
  stepFields,
  commentFields,
  reviewFields,
  instructionFields,
  linkFields,
  canManage,
  canWriteCandidates,
  canWriteInstructions,
  canManageLinks,
}: RecruitmentFileProps) => {
  const router = useRouter()
  const file = useRecruitmentFile(detail)
  const { contextMenu } = useMenu()
  const [dialog, setDialog] = useState<'candidate' | 'step' | 'instructions' | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<CandidateView | null>(null)
  const [editingStep, setEditingStep] = useState<RecruitmentStepView | null>(null)
  const [openedCandidateId, setOpenedCandidateId] = useState<string | null>(null)
  const [pendingCandidate, setPendingCandidate] = useState<CandidateView | null>(null)
  const [pendingStep, setPendingStep] = useState<RecruitmentStepView | null>(null)

  // The dialog always reads the live card so a comment lands without reopening it
  const openedCandidate = file.candidates.find((entry) => entry.id === openedCandidateId) ?? null

  const openDialog = (next: typeof dialog) => {
    file.clearIssues()
    setDialog(next)
  }

  const openCandidateForm = (candidate: CandidateView | null) => {
    setEditingCandidate(candidate)
    openDialog('candidate')
  }

  const openStepForm = (step: RecruitmentStepView | null) => {
    setEditingStep(step)
    openDialog('step')
  }

  const candidateMenu = (candidate: CandidateView): MenuItem[] => [
    {
      id: 'open',
      label: ACTION_COPY.open,
      icon: 'forward',
      onSelect: () => setOpenedCandidateId(candidate.id),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canWriteCandidates,
      onSelect: () => openCandidateForm(candidate),
    },
    {
      id: 'member',
      label: RECRUITMENT_COPY.openMember,
      icon: 'members',
      disabled: candidate.memberId === null,
      onSelect: () => router.push(ROUTES.member(candidate.memberId!)),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingCandidate(candidate),
    },
  ]

  const stepMenu = (step: RecruitmentStepView): MenuItem[] => [
    {
      id: 'done',
      label: step.doneAt ? RECRUITMENT_COPY.stepUndone : RECRUITMENT_COPY.stepDone,
      icon: 'confirm',
      disabled: !canManage,
      onSelect: () => void file.setStepDone(step.id, step.doneAt === null),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => openStepForm(step),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage,
      onSelect: () => setPendingStep(step),
    },
  ]

  /**
   * One candidate row, shared by the list and the results board
   * @param {CandidateView} candidate - Applicant rendered
   * @return {JSX.Element}
   */

  const candidateCard = (candidate: CandidateView) => (
    <span className={RECORD_ROW.body}>
      <span className={RECORD_ROW.title}>{candidate.name}</span>
      <span className={RECORD_ROW.meta}>
        {[
          candidate.interviewAt
            ? formatDayTime(candidate.interviewAt)
            : RECRUITMENT_COPY.noInterview,
          candidate.recruiter?.label ?? RECRUITMENT_COPY.noRecruiter,
        ].join(' · ')}
      </span>
    </span>
  )

  /**
   * Quiet marks closing a candidate row, attendance then remarks
   * @param {CandidateView} candidate - Applicant rendered
   * @return {JSX.Element}
   */

  const candidateMarks = (candidate: CandidateView) => {
    const AttendedIcon = ICONS[candidate.attended ? 'success' : 'clock']
    const NoteIcon = ICONS.note

    return (
      <span className="flex shrink-0 items-center gap-4 text-[var(--color-ink-subtle)]">
        {candidate.spectators.length > 0 && (
          <AvatarStack
            people={candidate.spectators.map((seat) => ({
              id: seat.id,
              name: seat.label,
              src: seat.image,
            }))}
          />
        )}
        {candidate.comments.length > 0 && (
          <span title={RECRUITMENT_COPY.commented}>
            <NoteIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        <span
          title={candidate.attended ? RECRUITMENT_COPY.attended : RECRUITMENT_COPY.missed}
          className={candidate.attended ? 'text-[var(--color-success)]' : undefined}
        >
          <AttendedIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      </span>
    )
  }

  const candidatesTab = () => (
    <Section
      title={RECRUITMENT_COPY.tabCandidates}
      description={RECRUITMENT_COPY.candidatesLead}
      bare
    >
      {file.candidates.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.candidatesEmptyTitle}
          description={RECRUITMENT_COPY.candidatesEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canManage}
              onClick={() => openCandidateForm(null)}
            >
              {RECRUITMENT_COPY.candidateAdd}
            </Button>
          }
        />
      ) : (
        <div className={RECORD_ROW.stack}>
          {file.candidates.map((candidate) => (
            <div
              key={candidate.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenedCandidateId(candidate.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setOpenedCandidateId(candidate.id)
              }}
              onContextMenu={contextMenu(candidateMenu(candidate), candidate.discordId)}
              className={RECORD_ROW.root}
            >
              <Avatar name={candidate.name} size="md" />
              {candidateCard(candidate)}
              {candidateMarks(candidate)}
            </div>
          ))}
          <AddRow
            label={RECRUITMENT_COPY.candidateAdd}
            disabled={!canManage}
            onClick={() => openCandidateForm(null)}
          />
        </div>
      )}
    </Section>
  )

  const questionsTab = () => (
    <Section
      title={RECRUITMENT_COPY.questionsTitle}
      description={RECRUITMENT_COPY.questionsLead}
      bare
    >
      {detail.questions.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.questionsEmptyTitle}
          description={RECRUITMENT_COPY.questionsEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="settings"
              onClick={() => router.push(ROUTES.settingsSection('questions-recrutement'))}
            >
              {RECRUITMENT_COPY.questionsConfigure}
            </Button>
          }
        />
      ) : (
        <ol className={LIST_STYLES.stack}>
          {detail.questions.map((question, index) => (
            <li key={question.id} className={LIST_STYLES.item}>
              <span className="w-6 shrink-0 text-base font-extrabold text-[var(--color-ink-subtle)] tabular-nums">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{question.prompt}</span>
                {question.hint && (
                  <span className="text-xs text-[var(--color-ink-subtle)]">{question.hint}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )

  const timelineTab = () => (
    <Section
      title={RECRUITMENT_COPY.timelineTitle}
      description={RECRUITMENT_COPY.timelineLead}
      bare
    >
      {file.steps.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.stepsEmptyTitle}
          description={RECRUITMENT_COPY.stepsEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canManage}
              onClick={() => openStepForm(null)}
            >
              {RECRUITMENT_COPY.stepAdd}
            </Button>
          }
        />
      ) : (
        <div className={RECORD_ROW.stack}>
          {file.steps.map((step) => {
            const owner = RECRUITMENT_OWNER_REGISTRY.get(step.owner)
            // Informative only, a late step never blocks anything
            const late = step.doneAt === null && isOverdue(step.scheduledAt)

            const StepIcon = ICONS[step.doneAt ? 'success' : 'clock']
            const offset = `J${step.offset >= 0 ? '+' : ''}${step.offset}`

            return (
              <div
                key={step.id}
                onContextMenu={contextMenu(stepMenu(step), step.title)}
                className={RECORD_ROW.static}
              >
                <StepIcon
                  className={cn(
                    'h-5 w-5 shrink-0 text-[var(--color-ink-subtle)]',
                    step.doneAt && 'text-[var(--color-success)]',
                    late && 'text-[var(--color-danger)]'
                  )}
                  aria-hidden="true"
                />
                <span className={RECORD_ROW.body}>
                  <span className={RECORD_ROW.title}>{step.title}</span>
                  <span className={RECORD_ROW.meta}>
                    {[
                      offset,
                      step.scheduledAt ? formatDay(step.scheduledAt) : null,
                      owner.label,
                      step.required ? RECRUITMENT_COPY.mandatoryBadge : null,
                      step.notes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                {step.emitsInvite && (
                  <IntegrationLinkStep
                    link={file.link}
                    fields={linkFields}
                    issues={file.issues}
                    isSaving={file.isSaving}
                    canManage={canManageLinks}
                    onEmit={file.emitLink}
                    onRevoke={() => void file.revokeLink()}
                  />
                )}
              </div>
            )
          })}
          <AddRow
            label={RECRUITMENT_COPY.stepAdd}
            disabled={!canManage}
            onClick={() => openStepForm(null)}
          />
        </div>
      )}
    </Section>
  )

  const columns: BoardColumn[] = detail.outcomes.map((outcome) => ({
    id: outcome.id,
    label: outcome.label,
    accent: outcome.accent,
  }))

  const resultsTab = () => (
    <Section title={RECRUITMENT_COPY.resultsTitle} description={RECRUITMENT_COPY.resultsLead} bare>
      {columns.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.outcomesEmptyTitle}
          description={RECRUITMENT_COPY.outcomesEmptyDescription}
          action={<MaturityTag maturity="dev" interactive={false} />}
        />
      ) : (
        <KanbanBoard
          columns={columns}
          items={file.candidates.map((candidate) => ({
            ...candidate,
            columnId: candidate.outcomeId,
          }))}
          renderCard={candidateCard}
          onMove={(itemId, columnId, index) => void file.moveCandidate(itemId, columnId, index)}
          onOpen={(item) => setOpenedCandidateId(item.id)}
          cardMenu={candidateMenu}
          addLabel={RECRUITMENT_COPY.candidateAdd}
          canCreate={canManage}
          onCreate={() => openCandidateForm(null)}
          canMove={canManage}
          tintByColumn
        />
      )}
    </Section>
  )

  const instructionsTab = () => (
    <Section
      title={RECRUITMENT_COPY.instructionsTitle}
      description={RECRUITMENT_COPY.instructionsLead}
      action={
        canWriteInstructions ? (
          <Button icon="edit" onClick={() => openDialog('instructions')}>
            {RECRUITMENT_COPY.instructionsEdit}
          </Button>
        ) : undefined
      }
      padded={file.instructions.length > 0}
      bare={file.instructions.length === 0}
    >
      {file.instructions.length === 0 ? (
        <EmptyState
          figure="notes"
          title={RECRUITMENT_COPY.instructionsEmptyTitle}
          description={
            canWriteInstructions
              ? RECRUITMENT_COPY.instructionsEmptyDescription
              : RECRUITMENT_COPY.instructionsLocked
          }
          action={
            <Button
              variant="primary"
              icon="edit"
              disabled={!canWriteInstructions}
              onClick={() => openDialog('instructions')}
            >
              {RECRUITMENT_COPY.instructionsEdit}
            </Button>
          }
        />
      ) : (
        <Markdown source={file.instructions} />
      )}
    </Section>
  )

  const status = RECRUITMENT_STATUS_REGISTRY.get(detail.summary.status)
  const responsables = detail.summary.responsables

  return (
    <div className="flex flex-col gap-8">
      <Section title={RECRUITMENT_COPY.informationsTitle} padded>
        <DetailGrid
          entries={[
            {
              label: RECRUITMENT_FIELD_COPY.youtuber,
              value: (
                <CreatorLabel
                  name={detail.summary.youtuber.label}
                  image={detail.summary.youtuber.image}
                />
              ),
            },
            {
              label: RECRUITMENT_COPY.infoStatus,
              value: <StatusText label={status.label} accent={status.accent} />,
            },
            { label: RECRUITMENT_FIELD_COPY.jobFunction, value: detail.summary.jobFunction.label },
            {
              label: RECRUITMENT_FIELD_COPY.responsables,
              value: responsables.length
                ? responsables.map((seat) => seat.label).join(' · ')
                : undefined,
            },
            { label: RECRUITMENT_COPY.infoSessionId, value: detail.summary.id },
          ]}
        />
      </Section>

      <FileTabs
        label={RECRUITMENT_COPY.title}
        tabs={[
          {
            value: 'candidates',
            label: RECRUITMENT_COPY.tabCandidates,
            icon: 'members',
            render: candidatesTab,
          },
          {
            value: 'questions',
            label: RECRUITMENT_COPY.tabQuestions,
            icon: 'sheet',
            render: questionsTab,
          },
          {
            value: 'timeline',
            label: RECRUITMENT_COPY.tabTimeline,
            icon: 'clock',
            render: timelineTab,
          },
          {
            value: 'results',
            label: RECRUITMENT_COPY.tabResults,
            icon: 'projects',
            render: resultsTab,
          },
          {
            value: 'instructions',
            label: RECRUITMENT_COPY.tabInstructions,
            icon: 'note',
            render: instructionsTab,
          },
        ]}
      />

      <CandidateDialog
        candidate={openedCandidate}
        commentFields={commentFields}
        reviewFields={reviewFields}
        issues={file.issues}
        isSaving={file.isSaving}
        canWrite={canWriteCandidates}
        onEdit={() => openedCandidate && openCandidateForm(openedCandidate)}
        onSaveReview={file.saveReview}
        onAddComment={file.addComment}
        onRemoveComment={file.removeComment}
        onOpenMember={(memberId) => router.push(ROUTES.member(memberId))}
        onClose={() => setOpenedCandidateId(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.candidate}
        open={dialog === 'candidate'}
        title={editingCandidate ? RECRUITMENT_COPY.candidateEdit : RECRUITMENT_COPY.candidateAdd}
        fields={candidateFields}
        initialValues={
          editingCandidate
            ? {
                discordId: editingCandidate.discordId,
                displayName: editingCandidate.displayName,
                formId: editingCandidate.formId,
                recruiterId: editingCandidate.recruiter?.id ?? null,
                interviewAt: editingCandidate.interviewAt,
                spectatorIds: editingCandidate.spectators.map((seat) => seat.id),
                outcomeId: editingCandidate.outcomeId,
                attended: editingCandidate.attended,
              }
            : undefined
        }
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingCandidate
            ? file.updateCandidate(editingCandidate.id, values)
            : file.addCandidate(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.recruitmentStep}
        open={dialog === 'step'}
        title={editingStep ? RECRUITMENT_COPY.stepEdit : RECRUITMENT_COPY.stepAdd}
        fields={stepFields}
        initialValues={
          editingStep
            ? {
                title: editingStep.title,
                offset: editingStep.offset,
                owner: editingStep.owner,
                scheduledAt: editingStep.scheduledAt,
                required: editingStep.required,
                notes: editingStep.notes,
              }
            : undefined
        }
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingStep ? file.updateStep(editingStep.id, values) : file.addStep(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.instructions}
        open={dialog === 'instructions'}
        title={RECRUITMENT_COPY.instructionsEdit}
        fields={instructionFields}
        initialValues={{ instructions: file.instructions }}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={async (values) =>
          file.saveInstructions(typeof values.instructions === 'string' ? values.instructions : '')
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={pendingCandidate !== null}
        title={RECRUITMENT_COPY.candidateDeleteTitle}
        description={RECRUITMENT_COPY.candidateDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingCandidate(null)}
        onConfirm={async () => {
          await file.removeCandidate(pendingCandidate!.id)
          setPendingCandidate(null)
        }}
      />

      <ConfirmDialog
        open={pendingStep !== null}
        title={RECRUITMENT_COPY.stepDeleteTitle}
        description={RECRUITMENT_COPY.stepDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingStep(null)}
        onConfirm={async () => {
          await file.removeStep(pendingStep!.id)
          setPendingStep(null)
        }}
      />
    </div>
  )
}
