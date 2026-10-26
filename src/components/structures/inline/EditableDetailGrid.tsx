'use client'

import { useEffect, useRef, useState } from 'react'
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react'
import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { FieldControl } from '@/components/elements/forms/FieldControl'
import { isSameValue } from '@/core/lib/forms/compare'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { DATE_COPY } from '@/declarations/ui/dates'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'

// Kinds running edge to edge
const WIDE_KINDS = ['textarea', 'markdown']

/**
 * One value of a detail sheet
 * @typedef {Object} EditableEntry
 * @property {string} label - Field label
 * @property {FieldDefinition} [field] - Declaration driving the editor
 * @property {ReactNode} [display] - Read mode rendering
 */

export interface EditableEntry {
  label: string
  field?: FieldDefinition
  display?: ReactNode
  // Runs edge to edge
  wide?: boolean
}

export interface EditableDetailGridProps {
  entries: EditableEntry[]
  values: FormValues
  issues: FieldIssue[]
  disabled?: boolean
  // One column
  stacked?: boolean
  onCommit: (name: string, value: FieldValue) => Promise<boolean>
}

// Kinds that save themselves as soon as a choice is made
const AUTO_SAVE_KINDS = ['select', 'date', 'datetime', 'daterange', 'multiselect', 'tags', 'image']

// Timed pickers wait for the panel to close, so editing the hour doesn't save mid-way
const isDeferred = (field: FieldDefinition) =>
  field.kind === 'datetime' || (field.kind === 'date' && Boolean(field.withTime))

// Kinds opening a panel on entry
const OPEN_KINDS = ['select', 'date', 'datetime', 'daterange', 'multiselect']

// Kinds that keep taking more entries after a save instead of closing straight away
const STAY_OPEN_KINDS = ['multiselect', 'tags']

/**
 * Two column sheet where every declared value doubles as its own editor — a click swaps the read rendering for the field's real control
 * @param {EditableEntry[]} entries - Labelled entries in display order
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {boolean} [disabled] - Blocks every entry
 * @param {boolean} [stacked] - One column layout
 * @param {(name: string, value: FieldValue) => Promise<boolean>} onCommit - Persists one field
 * @return {JSX.Element}
 */

export const EditableDetailGrid = ({
  entries,
  values,
  issues,
  disabled,
  stacked,
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

    const control = cellRef.current?.querySelector<HTMLElement>('input, button')
    control?.focus({ preventScroll: true })

    // A picker shows its choices straight away
    const field = entries.find((entry) => entry.field?.name === editing)?.field
    if (field && OPEN_KINDS.includes(field.kind)) control?.click()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const commit = async (name: string, value: FieldValue, closeAfter: boolean) => {
    // Nothing moved
    if (isSameValue(values[name], value)) {
      if (closeAfter) setEditing(null)

      return
    }

    setPending(true)
    const ok = await onCommit(name, value)
    setPending(false)

    if (ok && closeAfter) setEditing(null)
  }

  // Pickers live in a layer outside the cell
  useEffect(() => {
    const field = entries.find((entry) => entry.field?.name === editing)?.field
    if (!field || !AUTO_SAVE_KINDS.includes(field.kind)) return

    const onPress = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (cellRef.current?.contains(target)) return
      if (target?.closest('[role="listbox"], [role="dialog"]')) return

      if (isDeferred(field)) void commit(field.name, draft, true)
      else setEditing(null)
    }

    document.addEventListener('pointerdown', onPress)

    return () => document.removeEventListener('pointerdown', onPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, entries, draft, values])

  const startEditing = (field: FieldDefinition) => {
    if (disabled || field.readOnly) return

    // A toggle flips on the spot, its read rendering stays
    if (field.kind === 'toggle') {
      void commit(field.name, !values[field.name], false)

      return
    }

    setEditing(field.name)
    setDraft(values[field.name] ?? null)
  }

  return (
    <dl className={stacked ? DETAIL_BLOCK.stack : DETAIL_BLOCK.grid}>
      {entries.map(({ label, field, display, wide }) => {
        const entryClass =
          wide || (field && WIDE_KINDS.includes(field.kind))
            ? DETAIL_BLOCK.entryWide
            : DETAIL_BLOCK.entry

        // A static entry (no field) never leaves its read rendering
        if (!field) {
          return (
            <div key={label} className={entryClass}>
              {label && <dt className={DETAIL_BLOCK.label}>{label}</dt>}
              <dd className={display ? DETAIL_BLOCK.value : DETAIL_BLOCK.empty}>
                {display ?? DATE_COPY.none}
              </dd>
            </div>
          )
        }

        const id = `inline-${field.name}`
        const isEditing = editing === field.name
        const deferred = isDeferred(field)
        const autoSaves = AUTO_SAVE_KINDS.includes(field.kind) && !deferred
        const error = errorOf(field.name)
        // A locked entry keeps its read rendering
        const isLocked = Boolean(disabled) || Boolean(field.readOnly)

        const onBlur = (event: FocusEvent<HTMLElement>) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return
          // A picker taking the focus must not unmount its own control
          if (autoSaves || deferred) return
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

        // Pickers keep the read rendering in place and carry their panel from a ghost control
        const isGhost = isEditing && OPEN_KINDS.includes(field.kind)
        const readClass = cn(
          display ? DETAIL_BLOCK.value : DETAIL_BLOCK.empty,
          !isLocked && DETAIL_BLOCK.editable
        )

        const control = (
          <FieldControl
            id={id}
            field={field}
            value={draft}
            disabled={pending}
            invalid={Boolean(error)}
            describedBy={error ? `${id}-error` : undefined}
            inline
            onChange={(next) => {
              setDraft(next)
              if (autoSaves) void commit(field.name, next, !STAY_OPEN_KINDS.includes(field.kind))
            }}
          />
        )

        return (
          <div key={field.name} className={entryClass}>
            {label && <dt className={DETAIL_BLOCK.label}>{label}</dt>}
            {isGhost ? (
              <dd
                ref={cellRef}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className={cn(readClass, DETAIL_BLOCK.editing)}
              >
                {display ?? DATE_COPY.none}
                <div className="inline-ghost">{control}</div>
              </dd>
            ) : isEditing ? (
              <dd
                ref={cellRef}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className="inline-cell relative flex flex-col gap-1"
              >
                {control}
                {pending && (
                  <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                    <BrandLoader variant="ink" />
                  </span>
                )}
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
                className={readClass}
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
