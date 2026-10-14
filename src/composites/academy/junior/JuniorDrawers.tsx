'use client'

import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'

/**
 * Drawers and confirmations of a junior file
 * @return {JSX.Element}
 */

export const JuniorDrawers = () => {
  const state = useJuniorState()
  const { file, fields, dialog, closeDialog, editingNote, editingObjective } = state

  return (
    <>
      <FormDrawer
        subject={FORM_SUBJECTS.junior}
        open={dialog === 'trainer'}
        title={PARKOUR_COPY.assignTrainer}
        fields={fields.junior.filter((field) => field.name === 'trainerId')}
        initialValues={file.junior.values}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) => file.save({ ...file.junior.values, ...values })}
        onClose={closeDialog}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.note}
        open={dialog === 'note'}
        title={editingNote ? ACTION_COPY.edit : ACADEMY_COPY.noteAdd}
        fields={fields.note}
        initialValues={editingNote?.values}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingNote ? file.editNote(editingNote.id, values) : file.addNote(values)
        }
        onClose={closeDialog}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.objective}
        open={dialog === 'objective'}
        title={editingObjective ? ACTION_COPY.edit : ACADEMY_COPY.objectiveAdd}
        fields={fields.objective}
        initialValues={editingObjective?.values}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingObjective
            ? file.editObjective(editingObjective.id, values)
            : file.addObjective(values)
        }
        onClose={closeDialog}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.review}
        open={dialog === 'review'}
        title={ACADEMY_COPY.reviewAdd}
        description={ACADEMY_COPY.reviewsLead}
        fields={fields.review}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={file.addReview}
        onClose={closeDialog}
      />

      <ConfirmDialog
        open={state.pendingNote !== null}
        title={ACADEMY_COPY.noteDeleteTitle}
        description={ACADEMY_COPY.noteDeleteDescription}
        pending={file.isSaving}
        onCancel={() => state.setPendingNote(null)}
        onConfirm={async () => {
          await file.dropNote(state.pendingNote!.id)
          state.setPendingNote(null)
        }}
      />

      <ConfirmDialog
        open={state.pendingObjective !== null}
        title={ACADEMY_COPY.objectiveDeleteTitle}
        description={ACADEMY_COPY.objectiveDeleteDescription}
        pending={file.isSaving}
        onCancel={() => state.setPendingObjective(null)}
        onConfirm={async () => {
          await file.dropObjective(state.pendingObjective!.id)
          state.setPendingObjective(null)
        }}
      />

      <ConfirmDialog
        open={state.pendingReview !== null}
        title={ACADEMY_COPY.reviewDeleteTitle}
        description={ACADEMY_COPY.reviewDeleteDescription}
        pending={file.isSaving}
        onCancel={() => state.setPendingReview(null)}
        onConfirm={async () => {
          await file.dropReview(state.pendingReview!.id)
          state.setPendingReview(null)
        }}
      />
    </>
  )
}
