'use client'

import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { SelectionMenu } from '@/components/structures/overlays/SelectionMenu'
import { bulkFieldsOf } from '@/core/lib/forms'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { SELECTION_COPY } from '@/declarations/work/copy'
import type { MenuItem } from '@/managers/front-end'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'

export interface BoardSelectionProps {
  count: number
  fields: FieldDefinition[]
  canUpdate: boolean
  canDelete: boolean
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  onClear: () => void
  onEdit: (values: FormValues) => Promise<boolean>
  onDelete: () => Promise<void>
}

/**
 * Bar and dialogs acting on the selected cards
 * @param {number} count - Selected cards
 * @param {FieldDefinition[]} fields - Declarations of the record form
 * @param {boolean} canUpdate - Member may edit cards
 * @param {boolean} canDelete - Member may drop cards
 * @param {boolean} isSaving - Mutation in flight
 * @param {FieldIssue[]} issues - Rejections of the last mutation
 * @param {() => void} clearIssues - Forget the rejections
 * @param {() => void} onClear - Drop the selection
 * @param {(values: FormValues) => Promise<boolean>} onEdit - Rewrite the selection
 * @param {() => Promise<void>} onDelete - Drop the selection
 * @return {JSX.Element}
 */

export const BoardSelection = ({
  count,
  fields,
  canUpdate,
  canDelete,
  isSaving,
  issues,
  clearIssues,
  onClear,
  onEdit,
  onDelete,
}: BoardSelectionProps) => {
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null)
  const bulkFields = useMemo(() => bulkFieldsOf(fields), [fields])

  // Entries of the menu
  const items: MenuItem[] = [
    ...(canUpdate && bulkFields.length > 0
      ? [
          {
            id: 'edit',
            label: SELECTION_COPY.edit,
            icon: 'edit' as const,
            onSelect: () => {
              clearIssues()
              setDialog('edit')
            },
          },
        ]
      : []),
    {
      id: 'clear',
      label: SELECTION_COPY.clear,
      icon: 'close',
      shortcut: 'Échap',
      onSelect: onClear,
    },
    ...(canDelete
      ? [
          {
            id: 'delete',
            label: SELECTION_COPY.delete,
            icon: 'remove' as const,
            danger: true,
            separatorBefore: true,
            onSelect: () => setDialog('delete'),
          },
        ]
      : []),
  ]

  return (
    <>
      {dialog === null && <SelectionMenu count={count} items={items} />}

      <FormDrawer
        subject={FORM_SUBJECTS.selection}
        open={dialog === 'edit'}
        title={SELECTION_COPY.edit}
        fields={bulkFields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={onEdit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'delete'}
        title={SELECTION_COPY.deleteTitle}
        description={SELECTION_COPY.deleteDescription}
        pending={isSaving}
        onCancel={() => setDialog(null)}
        onConfirm={async () => {
          await onDelete()
          setDialog(null)
        }}
      />
    </>
  )
}
