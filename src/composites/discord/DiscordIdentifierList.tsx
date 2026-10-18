'use client'

import { useMemo, useState } from 'react'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { CopyValue } from '@/components/elements/actions/CopyValue'
import { Status } from '@/components/elements/display/Status'
import { Input } from '@/components/elements/forms/inputs/Input'
import { AddRow } from '@/components/structures/inline/AddRow'
import { useEditGestures } from '@/core/hooks/interaction/gestures/useEditGestures'
import { DISCORD_ID_COPY } from '@/declarations/discord/copy'
import { DISCORD_ID_GROUPS } from '@/declarations/discord/registries'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { ReferenceRow } from '@/types/reference'

export interface DiscordIdentifierListProps {
  rows: ReferenceRow[]
  canManage: boolean
  addLabel: string
  menu: (row: ReferenceRow) => MenuItem[]
  onEdit: (row: ReferenceRow) => void
  onCreate: () => void
}

// Filter value for every group
const ALL = 'all'

/**
 * Identifiers searchable, filtered and grouped by family
 * @param {ReferenceRow[]} rows - Stored identifiers
 * @param {boolean} canManage - Member may write
 * @param {string} addLabel - Label of the add row
 * @param {(row: ReferenceRow) => MenuItem[]} menu - Context menu of a row
 * @param {(row: ReferenceRow) => void} onEdit - Opens the edit form
 * @param {() => void} onCreate - Opens the create form
 * @return {JSX.Element}
 */

export const DiscordIdentifierList = ({
  rows,
  canManage,
  addLabel,
  menu,
  onEdit,
  onCreate,
}: DiscordIdentifierListProps) => {
  const { contextMenu } = useMenu()
  const gestures = useEditGestures()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState(ALL)

  // Families holding rows, matching the search
  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = (row: ReferenceRow) =>
      !needle ||
      row.label.toLowerCase().includes(needle) ||
      (row.hint ?? '').includes(needle) ||
      row.badges.some((badge) => badge.toLowerCase().includes(needle))

    return DISCORD_ID_GROUPS.filter((entry) => group === ALL || entry.key === group)
      .map((entry) => ({
        ...entry,
        rows: rows.filter((row) => entry.kinds.includes(row.values.kind as never) && matches(row)),
      }))
      .filter((entry) => entry.rows.length > 0)
  }, [rows, query, group])

  const filters = [
    { value: ALL, label: DISCORD_ID_COPY.all },
    ...DISCORD_ID_GROUPS.filter((entry) =>
      rows.some((row) => entry.kinds.includes(row.values.kind as never))
    ).map((entry) => ({ value: entry.key, label: entry.label })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={DISCORD_ID_COPY.search}
          aria-label={DISCORD_ID_COPY.search}
          className="min-w-0 flex-1 basis-60"
        />
        <SegmentedControl
          options={filters}
          value={group}
          onChange={setGroup}
          label={DISCORD_ID_COPY.filterLabel}
        />
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-[var(--color-ink-subtle)] italic">{DISCORD_ID_COPY.noMatch}</p>
      )}

      {sections.map((entry) => (
        <section key={entry.key} className="flex flex-col gap-2">
          <h2 className="text-xs font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase">
            {entry.label}
          </h2>
          <div className={LIST_STYLES.stack}>
            {entry.rows.map((row) => (
              <div
                key={row.id}
                className={`${LIST_STYLES.item} ${canManage ? LIST_STYLES.itemClickable : ''}`}
                {...gestures({ canEdit: canManage, onEdit: () => onEdit(row) })}
                onContextMenu={contextMenu(menu(row), row.label)}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2 font-medium">
                    {row.label}
                    {row.badges.map((badge) => (
                      <Status key={badge} label={badge} accent={row.accent} tone="neutral" />
                    ))}
                  </span>
                  {row.hint && (
                    <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                      <CopyValue value={row.hint} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <AddRow label={addLabel} disabled={!canManage} onClick={onCreate} />
    </div>
  )
}
