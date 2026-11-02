'use client'

import { useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { DataTable } from '@/components/structures/data/DataTable'
import { REGISTRY_COLUMNS } from '@/composites/system/pages/registryColumns'
import { PAGE_REGISTRY_COPY } from '@/declarations/pages/copy'
import { PAGE_REGISTRY_STYLES } from '@/declarations/ui/variants'
import type { PageRegistryRow } from '@/types/pages'

export interface PageRegistryProps {
  rows: PageRegistryRow[]
}

type RegistryFilter = 'all' | 'shared' | 'private' | 'trash'

// One rule per filter
const FILTERS: Record<RegistryFilter, (row: PageRegistryRow) => boolean> = {
  all: (row) => !row.trashedAt,
  shared: (row) => !row.trashedAt && row.shares.length > 0,
  private: (row) => !row.trashedAt && row.shares.length === 0,
  trash: (row) => row.trashedAt !== null,
}

const FILTER_OPTIONS: { value: RegistryFilter; label: string }[] = [
  { value: 'all', label: PAGE_REGISTRY_COPY.filterAll },
  { value: 'shared', label: PAGE_REGISTRY_COPY.filterShared },
  { value: 'private', label: PAGE_REGISTRY_COPY.filterPrivate },
  { value: 'trash', label: PAGE_REGISTRY_COPY.filterTrash },
]

/**
 * Every private page for the developers, content sealed
 * @param {PageRegistryRow[]} rows - Registry rows
 * @return {JSX.Element}
 */

export const PageRegistry = ({ rows }: PageRegistryProps) => {
  const [filter, setFilter] = useState<RegistryFilter>('all')
  const [term, setTerm] = useState('')
  const needle = term.trim().toLowerCase()

  const visible = rows.filter(
    (row) =>
      FILTERS[filter](row) &&
      (!needle || `${row.title} ${row.ownerName}`.toLowerCase().includes(needle))
  )

  return (
    <div className={PAGE_REGISTRY_STYLES.column}>
      <p className={PAGE_REGISTRY_STYLES.sealed}>{PAGE_REGISTRY_COPY.sealed}</p>
      <div className={PAGE_REGISTRY_STYLES.toolbar}>
        <SegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
          label={PAGE_REGISTRY_COPY.columnState}
        />
        <input
          type="search"
          value={term}
          aria-label={PAGE_REGISTRY_COPY.searchPlaceholder}
          placeholder={PAGE_REGISTRY_COPY.searchPlaceholder}
          className={PAGE_REGISTRY_STYLES.search}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>
      <DataTable
        columns={REGISTRY_COLUMNS}
        rows={visible}
        getRowId={(row) => row.id}
        emptyState={{
          title: PAGE_REGISTRY_COPY.emptyTitle,
          description: PAGE_REGISTRY_COPY.emptyLead,
          action: null,
        }}
      />
    </div>
  )
}
