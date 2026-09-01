'use client'

import { useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react'
import { FieldControl } from '@/components/elements/forms/FieldControl'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { DATE_COPY } from '@/declarations/ui/dates'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'

/**
 * One value of a detail sheet, editable in place once it carries a field declaration
 * @typedef {Object} EditableEntry
 * @property {string} label - Field label
 * @property {FieldDefinition} [field] - Declaration driving the editor, absent for a static entry
 * @property {ReactNode} [display] - Read mode rendering, a dash once absent
 */

export interface EditableEntry {
  label: string
  field?: FieldDefinition
  display?: ReactNode
}

export interface EditableDetailGridProps {
  entries: EditableEntry[]
  values: FormValues
  issues: FieldIssue[]
  disabled?: boolean
  onCommit: (name: string, value: FieldValue) => Promise<boolean>
}

// Kinds that save themselves as soon as a choice is made, no blur or Enter needed
const AUTO_SAVE_KINDS = ['select', 'date', 'datetime', 'multiselect', 'tags', 'image']

// Kinds that keep taking more entries after a save instead of closing straight away
const STAY_OPEN_KINDS = ['multiselect', 'tags']

/**
 * Two column sheet where every declared value doubles as its own editor — a click swaps the
 * read rendering for the field's real control, which saves the whole record on change or blur
 * @param {EditableEntry[]} entries - Labelled entries in display order
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {boolean} [disabled] - Blocks every entry
 * @param {(name: string, value: FieldValue) => Promise<boolean>} onCommit - Persists one field
 * @return {JSX.Element}
 */

export const EditableDetailGrid = ({
  entries,
  values,
  issues,
  disabled,
  onCommit,
}: EditableDetailGridProps) => {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<FieldValue>(null)
  const [pending, setPending] = useState(false)
  const cellRef = useRef<HTMLElement | null>(null)

  const errorOf = (name: string) => issues.find((issue) => issue.field === name)?.message

  // Entering edit mode always hands focus straight to the freshly mounted control
  useEffect(() => {
    if (!editing) return

    cellRef.current?.querySelector<HTMLElement>('input, button')?.focus()
  }, [editing])

  const startEditing = (field: FieldDefinition) => {
    if (disabled || field.readOnly) return

    setEditing(field.name)
    setDraft(values[field.name] ?? null)
  }

  const commit = async (name: string, value: FieldValue, closeAfter: boolean) => {
    setPending(true)
    const ok = await onCommit(name, value)
    setPending(false)

    if (ok && closeAfter) setEditing(null)
  }

  return (
    <dl className={DETAIL_BLOCK.grid}>
      {entries.map(({ label, field, display }) => {
        // A static entry (no field) never leaves its read rendering
        if (!field) {
          return (
            <div key={label} className={DETAIL_BLOCK.entry}>
              <dt className={DETAIL_BLOCK.label}>{label}</dt>
              <dd className={display ? DETAIL_BLOCK.value : DETAIL_BLOCK.empty}>
                {display ?? DATE_COPY.none}
              </dd>
            </div>
          )
        }

        const id = `inline-${field.name}`
        const isEditing = editing === field.name
        const autoSaves = AUTO_SAVE_KINDS.includes(field.kind)
        const error = errorOf(field.name)
        // A locked entry keeps its read rendering, so it never poses as a control
        const isLocked = Boolean(disabled) || Boolean(field.readOnly)

        const onBlur = (event: FocusEvent<HTMLElement>) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return
          if (autoSaves) {
            setEditing(null)
            return
          }
          void commit(field.name, draft, true)
        }

        const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            setEditing(null)
            return
          }
          if (event.key === 'Enter' && !autoSaves) {
            event.preventDefault()
            void commit(field.name, draft, true)
          }
        }

        return (
          <div key={field.name} className={DETAIL_BLOCK.entry}>
            <dt className={DETAIL_BLOCK.label}>{label}</dt>
            {isEditing ? (
              <dd
                ref={cellRef}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className="flex flex-col gap-1"
              >
                <FieldControl
                  id={id}
                  field={field}
                  value={draft}
                  disabled={pending}
                  invalid={Boolean(error)}
                  describedBy={error ? `${id}-error` : undefined}
                  onChange={(next) => {
                    setDraft(next)
                    if (autoSaves)
                      void commit(field.name, next, !STAY_OPEN_KINDS.includes(field.kind))
                  }}
                />
                {error && (
                  <p id={`${id}-error`} className="text-xs text-[var(--color-danger)]">
                    {error}
                  </p>
                )}
              </dd>
            ) : (
              <dd
                role={isLocked ? undefined : 'button'}
                tabIndex={isLocked ? undefined : 0}
                onClick={isLocked ? undefined : () => startEditing(field)}
                onKeyDown={(event) => {
                  if (!isLocked && event.key === 'Enter') startEditing(field)
                }}
                className={cn(
                  display ? DETAIL_BLOCK.value : DETAIL_BLOCK.empty,
                  !isLocked &&
                    '-mx-1.5 -my-0.5 cursor-pointer rounded-[var(--radius-sm)] px-1.5 py-0.5 transition-colors hover:bg-[var(--color-surface)]'
                )}
              >
                {display ?? DATE_COPY.none}
              </dd>
            )}
          </div>
        )
      })}
    </dl>
  )
}
