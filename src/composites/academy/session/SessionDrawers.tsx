'use client'

import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { formatDay } from '@/utils/format/dates'

/**
 * Drawers and confirmations of an academy session file
 * @return {JSX.Element}
 */

export const SessionDrawers = () => {
  const state = useSessionState()
  const { detail, session, fields, dialog, closeDialog, editingJunior } = state

  return (
    <>
      <FormDrawer
        subject={FORM_SUBJECTS.junior}
        open={dialog === 'junior'}
        title={editingJunior ? editingJunior.displayName : ACADEMY_COPY.juniorAdd}
        description={formatDay(detail.summary.startsAt)}
        fields={fields.junior.filter((field) => editingJunior || field.name !== 'status')}
        initialValues={editingJunior?.values}
        issues={session.issues}
        isSaving={session.isSaving}
        onSubmit={(values) =>
          editingJunior ? session.editJunior(editingJunior.id, values) : session.addJunior(values)
        }
        onClose={closeDialog}
      />

      <ConfirmDialog
        open={state.pendingJunior !== null}
        title={ACADEMY_COPY.juniorDeleteTitle}
        description={ACADEMY_COPY.juniorDeleteDescription}
        pending={session.isSaving}
        onCancel={() => state.setPendingJunior(null)}
        onConfirm={async () => {
          await session.dropJunior(state.pendingJunior!.id)
          state.setPendingJunior(null)
        }}
      />
    </>
  )
}
