'use client'

import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'

/**
 * Dialogs, drawers and confirmations of a recruitment file
 * @return {JSX.Element}
 */

export const RecruitmentDrawers = () => {
  const state = useRecruitmentState()
  const { file, fields, dialog, closeDialog, editingCandidate, editingStep } = state

  return (
    <>
      <FormDrawer
        subject={FORM_SUBJECTS.candidate}
        open={dialog === 'candidate'}
        title={editingCandidate ? RECRUITMENT_COPY.candidateEdit : RECRUITMENT_COPY.candidateAdd}
        fields={fields.candidate}
        initialValues={
          editingCandidate
            ? {
                discordId: editingCandidate.discordId,
                displayName: editingCandidate.displayName,
                formId: editingCandidate.formId,
                recruiterId: editingCandidate.recruiter?.id ?? null,
                interviewAt: editingCandidate.interviewAt,
                observerIds: editingCandidate.observers.map((seat) => seat.id),
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
        onClose={closeDialog}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.recruitmentStep}
        open={dialog === 'step'}
        title={editingStep ? RECRUITMENT_COPY.stepEdit : RECRUITMENT_COPY.stepAdd}
        fields={fields.step}
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
        onClose={closeDialog}
      />

      <ConfirmDialog
        open={state.pendingCandidate !== null}
        title={RECRUITMENT_COPY.candidateDeleteTitle}
        description={RECRUITMENT_COPY.candidateDeleteDescription}
        pending={file.isSaving}
        onCancel={() => state.setPendingCandidate(null)}
        onConfirm={async () => {
          await file.removeCandidate(state.pendingCandidate!.id)
          state.setPendingCandidate(null)
        }}
      />

      <ConfirmDialog
        open={state.pendingStep !== null}
        title={RECRUITMENT_COPY.stepDeleteTitle}
        description={RECRUITMENT_COPY.stepDeleteDescription}
        pending={file.isSaving}
        onCancel={() => state.setPendingStep(null)}
        onConfirm={async () => {
          await file.removeStep(state.pendingStep!.id)
          state.setPendingStep(null)
        }}
      />
    </>
  )
}
