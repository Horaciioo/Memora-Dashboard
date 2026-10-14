'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useObservers } from '@/core/hooks/data/useObservers'
import { OBSERVER_COPY } from '@/declarations/recruitment/candidateCopy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { OBSERVER_BOX } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { ObserverView } from '@/types/recruitment'

/**
 * Observers of the session: quota edited and seat taken back with a right click
 * @return {JSX.Element}
 */

export const ObserversBox = () => {
  const { detail, fields, can } = useRecruitmentState()
  const { contextMenu } = useMenu()
  const state = useObservers(detail.summary.id, detail.observers)
  const [isAdding, setAdding] = useState(false)
  const [editing, setEditing] = useState<ObserverView | null>(null)
  const [pending, setPending] = useState<ObserverView | null>(null)

  const quotaField = fields.observer.filter((field) => field.name === 'quota')

  const menu = (observer: ObserverView) => [
    {
      id: 'edit',
      label: OBSERVER_COPY.edit,
      icon: 'edit' as const,
      disabled: !can.manage,
      onSelect: () => {
        state.clearIssues()
        setEditing(observer)
      },
    },
    {
      id: 'remove',
      label: ACTION_COPY.delete,
      icon: 'remove' as const,
      danger: true,
      separatorBefore: true,
      disabled: !can.manage,
      onSelect: () => setPending(observer),
    },
  ]

  return (
    <div>
      {state.observers.length === 0 && <p className={OBSERVER_BOX.empty}>{OBSERVER_COPY.empty}</p>}
      {state.observers.map((observer) => (
        <div
          key={observer.id}
          className={OBSERVER_BOX.row}
          onContextMenu={contextMenu(menu(observer), observer.person.label)}
        >
          <Avatar name={observer.person.label} src={observer.person.image} size="sm" />
          <span className={OBSERVER_BOX.name}>{observer.person.label}</span>
          <span className={OBSERVER_BOX.usage}>
            {OBSERVER_COPY.usage
              .replace('{used}', String(observer.used))
              .replace('{quota}', String(observer.quota))}
          </span>
        </div>
      ))}
      <AddRow
        label={OBSERVER_COPY.add}
        disabled={!can.manage}
        onClick={() => {
          state.clearIssues()
          setAdding(true)
        }}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.observer}
        open={isAdding}
        title={OBSERVER_COPY.add}
        fields={fields.observer}
        initialValues={{ quota: 1 }}
        issues={state.issues}
        isSaving={state.isSaving}
        onSubmit={state.add}
        onClose={() => setAdding(false)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.observer}
        open={editing !== null}
        title={OBSERVER_COPY.edit}
        fields={quotaField}
        initialValues={{ quota: editing?.quota ?? 1 }}
        issues={state.issues}
        isSaving={state.isSaving}
        onSubmit={(values) => state.update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pending !== null}
        title={OBSERVER_COPY.deleteTitle}
        description={OBSERVER_COPY.deleteDescription}
        pending={state.isSaving}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          await state.remove(pending!.id)
          setPending(null)
        }}
      />
    </div>
  )
}
