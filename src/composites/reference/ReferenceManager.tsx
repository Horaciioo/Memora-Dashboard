'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useReference } from '@/core/hooks/data/useReference'
import { ROUTES } from '@/declarations/navigation'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import type { ReferenceSection } from '@/declarations/reference/sections'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { LIST_STYLES } from '@/declarations/ui/variants'

import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { ReferenceRow } from '@/types/reference'
import { cn } from '@/utils/classnames'

export interface ReferenceManagerProps {
  section: ReferenceSection
  fields: FieldDefinition[]
  initialRows: ReferenceRow[]
  canManage: boolean
}

// Single drop container, rows only move within their own collection
const CONTAINER = 'reference'

/**
 * Editor of one reference collection
 * @param {ReferenceSection} section - Collection metadata
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {ReferenceRow[]} initialRows - Rows resolved server-side
 * @param {boolean} canManage - Member may write
 * @return {JSX.Element}
 */

export const ReferenceManager = ({
  section,
  fields,
  initialRows,
  canManage,
}: ReferenceManagerProps) => {
  const { rows, isSaving, issues, create, update, remove, reorder, clearIssues } = useReference(
    section.key,
    initialRows
  )
  const router = useRouter()
  const { contextMenu } = useMenu()
  const [editing, setEditing] = useState<ReferenceRow | null>(null)
  const [isCreating, setCreating] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState<ReferenceRow | null>(null)

  const { over, itemProps, containerProps } = useDragAndDrop((item, _container, index) => {
    const current = rows.map((row) => row.id)
    const from = current.indexOf(item.id)
    if (from === -1) return

    // Rebuild the identifier list
    const without = current.filter((id) => id !== item.id)
    const target = Math.min(index > from ? index - 1 : index, without.length)
    without.splice(Math.max(0, target), 0, item.id)

    void reorder(without)
  })

  const openCreate = () => {
    clearIssues()
    setCreating(true)
  }

  const openRow = (row: ReferenceRow) => {
    if (section.openable) router.push(ROUTES.settingsRecord(section.key, row.id))
  }

  const rowMenu = (row: ReferenceRow): MenuItem[] => [
    ...(section.openable
      ? [
          {
            id: 'open',
            label: ACTION_COPY.open,
            icon: 'forward' as const,
            onSelect: () => openRow(row),
          },
        ]
      : []),
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canManage,
      onSelect: () => {
        clearIssues()
        setEditing(row)
      },
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canManage || row.usage > 0,
      onSelect: () => setPendingDeletion(row),
    },
  ]

  const DragIcon = ICONS.drag

  return (
    <>
      <Section bare>
        {rows.length === 0 ? (
          <EmptyState
            figure={section.figure}
            title={section.emptyTitle}
            description={section.emptyDescription}
            action={
              <Button variant="primary" icon="add" onClick={openCreate} disabled={!canManage}>
                {`${ACTION_COPY.add} ${section.singular.toLowerCase()}`}
              </Button>
            }
          />
        ) : (
          <div
            className={cn(
              LIST_STYLES.stack,
              over === CONTAINER && 'is-drop-target rounded-[var(--radius-lg)]'
            )}
            {...(section.reorderable && canManage ? containerProps(CONTAINER) : {})}
          >
            {rows.map((row, index) => (
              <div
                key={row.id}
                data-drop-index={index}
                onContextMenu={contextMenu(rowMenu(row), row.label)}
                onClick={section.openable ? () => openRow(row) : undefined}
                className={cn(LIST_STYLES.item, section.openable && LIST_STYLES.itemClickable)}
                {...(section.reorderable && canManage
                  ? itemProps({ id: row.id, from: CONTAINER })
                  : {})}
              >
                {section.reorderable && canManage && (
                  <DragIcon
                    className="h-4 w-4 shrink-0 cursor-grab text-[var(--color-ink-subtle)]"
                    aria-hidden="true"
                  />
                )}
                {row.image !== undefined && <Avatar name={row.label} src={row.image} size="md" />}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {row.label}
                    {row.badges.map((badge) => (
                      <Badge key={badge} label={badge} accent={row.accent} tone={'neutral'} />
                    ))}
                  </span>
                  {row.hint && (
                    <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                      {row.hint}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[var(--color-ink-subtle)] tabular-nums">
                  {`${row.usage} ${row.usage === 1 ? REFERENCE_COPY.usageOne : REFERENCE_COPY.usage}`}
                </span>
                <Button
                  variant="icon"
                  icon="edit"
                  aria-label={`${ACTION_COPY.edit} ${row.label}`}
                  disabled={!canManage}
                  onClick={(event) => {
                    event.stopPropagation()
                    clearIssues()
                    setEditing(row)
                  }}
                />
              </div>
            ))}
            <AddRow
              label={`${ACTION_COPY.add} ${section.singular.toLowerCase()}`}
              disabled={!canManage}
              onClick={openCreate}
            />
          </div>
        )}
      </Section>

      <FormDialog
        open={isCreating}
        title={`${ACTION_COPY.add} ${section.singular.toLowerCase()}`}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(false)}
      />

      <FormDialog
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} · ${editing.label}` : ACTION_COPY.edit}
        fields={fields}
        initialValues={editing?.values}
        issues={issues}
        isSaving={isSaving}
        onSubmit={(values) => update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={REFERENCE_COPY.deleteTitle}
        description={REFERENCE_COPY.deleteDescription}
        pending={isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </>
  )
}
