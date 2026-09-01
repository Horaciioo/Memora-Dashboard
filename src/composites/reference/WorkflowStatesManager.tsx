'use client'

import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { emptyValues } from '@/core/lib/forms'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useReference } from '@/core/hooks/data/useReference'
import { REFERENCE_COPY, WORKFLOW_STATE_COPY } from '@/declarations/reference/copy'
import {
  WORKFLOW_PHASE_REGISTRY,
  WORKFLOW_SCOPE_REGISTRY,
} from '@/declarations/reference/registries'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { BOARD_STYLES, GROUP_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { ReferenceRow } from '@/types/reference'
import { cn } from '@/utils/classnames'

export interface WorkflowStatesManagerProps {
  fields: FieldDefinition[]
  initialRows: ReferenceRow[]
  canManage: boolean
}

// Pairs a board scope with a lifecycle phase into one drop container
const CONTAINER_SEPARATOR = '::'

/**
 * Editor of the workflow states, one mini board per scope
 * @param {FieldDefinition[]} fields - Field declarations of the state form
 * @param {ReferenceRow[]} initialRows - Rows resolved server-side
 * @param {boolean} canManage - Member may write
 * @return {JSX.Element}
 */

export const WorkflowStatesManager = ({
  fields,
  initialRows,
  canManage,
}: WorkflowStatesManagerProps) => {
  const { rows, isSaving, issues, create, update, remove, reorder, clearIssues } = useReference(
    'etats',
    initialRows
  )
  const { contextMenu } = useMenu()
  const [editing, setEditing] = useState<ReferenceRow | null>(null)
  const [creating, setCreating] = useState<{ scope: string; phase: string } | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<ReferenceRow | null>(null)

  // Rows sitting in one column, in display order
  const columnRows = (scope: string, phase: string) =>
    rows.filter((row) => row.values.scope === scope && row.values.phase === phase)

  // Whole collection identifiers, the dragged row spliced into its target column
  const reordered = (
    movedId: string,
    toScope: string,
    toPhase: string,
    index: number
  ): string[] => {
    const ids: string[] = []

    for (const scope of WORKFLOW_SCOPE_REGISTRY.keys) {
      for (const phase of WORKFLOW_PHASE_REGISTRY.keys) {
        let group = columnRows(scope, phase)
          .map((row) => row.id)
          .filter((id) => id !== movedId)

        if (scope === toScope && phase === toPhase) {
          const at = Math.min(Math.max(index, 0), group.length)
          group = [...group.slice(0, at), movedId, ...group.slice(at)]
        }

        ids.push(...group)
      }
    }

    return ids
  }

  const { over, itemProps, containerProps } = useDragAndDrop((item, container, index) => {
    if (!canManage) return

    const [toScope, toPhase] = container.split(CONTAINER_SEPARATOR)
    const row = rows.find((entry) => entry.id === item.id)
    if (!row) return

    // Same column reorders, another column re-files the state
    if (row.values.scope === toScope && row.values.phase === toPhase) {
      void reorder(reordered(item.id, toScope, toPhase, index))
      return
    }

    void update(row.id, { ...row.values, scope: toScope, phase: toPhase })
  })

  const rowMenu = (row: ReferenceRow): MenuItem[] => [
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
        <div className={GROUP_STYLES.ruledStack}>
          {WORKFLOW_SCOPE_REGISTRY.keys.map((scope) => (
            <section key={scope} className={GROUP_STYLES.ruledSection}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className={SECTION_STYLES.title}>{WORKFLOW_SCOPE_REGISTRY.label(scope)}</h2>
                {canManage && (
                  <p className="text-xs text-[var(--color-ink-subtle)] italic">
                    {WORKFLOW_STATE_COPY.moveHint}
                  </p>
                )}
              </div>

              <div className={BOARD_STYLES.scroller}>
                {WORKFLOW_PHASE_REGISTRY.keys.map((phase) => {
                  const container = `${scope}${CONTAINER_SEPARATOR}${phase}`
                  const entries = columnRows(scope, phase)
                  const meta = WORKFLOW_PHASE_REGISTRY.get(phase)

                  return (
                    <section
                      key={phase}
                      className={cn(
                        BOARD_STYLES.column,
                        over === container && 'is-drop-target rounded-[var(--radius-lg)]'
                      )}
                      {...(canManage ? containerProps(container) : {})}
                    >
                      <header className={BOARD_STYLES.columnHead}>
                        <span className={BOARD_STYLES.columnTitle}>
                          <Badge
                            label={WORKFLOW_PHASE_REGISTRY.label(phase)}
                            accent={meta.accent}
                            dot
                          />
                        </span>
                        <span className={BOARD_STYLES.count}>{entries.length}</span>
                      </header>

                      <div className={BOARD_STYLES.body}>
                        {entries.map((row, index) => (
                          <article
                            key={row.id}
                            data-drop-index={index}
                            onContextMenu={contextMenu(rowMenu(row), row.label)}
                            className={cn(BOARD_STYLES.card, 'cursor-default')}
                            {...(canManage ? itemProps({ id: row.id, from: container }) : {})}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              {canManage && (
                                <DragIcon
                                  className="h-4 w-4 shrink-0 cursor-grab text-[var(--color-ink-subtle)]"
                                  aria-hidden="true"
                                />
                              )}
                              <Badge label={row.label} accent={row.accent} dot />
                              {row.values.isDefault === true && (
                                <Badge
                                  label={WORKFLOW_STATE_COPY.defaultMark}
                                  tone="brand"
                                  icon="star"
                                />
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-ink-subtle)]">
                              <span className="tabular-nums">
                                {`${row.usage} ${row.usage === 1 ? REFERENCE_COPY.usageOne : REFERENCE_COPY.usage}`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Button
                                  variant="icon"
                                  icon="edit"
                                  aria-label={`${ACTION_COPY.edit} ${row.label}`}
                                  disabled={!canManage}
                                  onClick={() => {
                                    clearIssues()
                                    setEditing(row)
                                  }}
                                />
                                <Button
                                  variant="icon"
                                  icon="remove"
                                  aria-label={`${ACTION_COPY.delete} ${row.label}`}
                                  disabled={!canManage || row.usage > 0}
                                  onClick={() => setPendingDeletion(row)}
                                />
                              </span>
                            </div>
                          </article>
                        ))}

                        {canManage && (
                          <AddRow
                            label={WORKFLOW_STATE_COPY.add}
                            onClick={() => {
                              clearIssues()
                              setCreating({ scope, phase })
                            }}
                          />
                        )}
                      </div>
                    </section>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </Section>

      <FormDialog
        open={creating !== null}
        title={WORKFLOW_STATE_COPY.add}
        fields={fields}
        initialValues={
          creating
            ? { ...emptyValues(fields), scope: creating.scope, phase: creating.phase }
            : undefined
        }
        issues={issues}
        isSaving={isSaving}
        onSubmit={create}
        onClose={() => setCreating(null)}
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
