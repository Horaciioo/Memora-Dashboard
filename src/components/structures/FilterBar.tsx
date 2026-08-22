'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/Input'
import { Select } from '@/components/elements/forms/Select'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { FieldOption } from '@/types/forms'

/**
 * Dropdown of the filter bar
 * @typedef {Object} FilterDefinition
 * @property {string} name - Filter key
 * @property {string} label - Accessible label
 * @property {string} allLabel - Label of the unfiltered option
 * @property {FieldOption[]} options - Selectable values
 */

export interface FilterDefinition {
  name: string
  label: string
  allLabel: string
  options: FieldOption[]
}

export interface FilterBarProps {
  searchLabel: string
  search: string
  onSearch: (value: string) => void
  filters: FilterDefinition[]
  values: Record<string, string>
  onFilter: (name: string, value: string) => void
  onReset: () => void
  isFiltered: boolean
  summary?: string
  action?: ReactNode
}

/**
 * Search field, one dropdown per declared filter, and a reset once anything is set
 * @param {string} searchLabel - Accessible label of the search field
 * @param {string} search - Current search term
 * @param {(value: string) => void} onSearch - Search handler
 * @param {FilterDefinition[]} filters - Declared dropdowns
 * @param {Record<string, string>} values - Selected filter values
 * @param {(name: string, value: string) => void} onFilter - Filter handler
 * @param {() => void} onReset - Clears every filter
 * @param {boolean} isFiltered - At least one filter is set
 * @param {string} [summary] - Count of matching rows
 * @param {ReactNode} [action] - Control aligned to the right
 * @return {JSX.Element}
 */

export const FilterBar = ({
  searchLabel,
  search,
  onSearch,
  filters,
  values,
  onFilter,
  onReset,
  isFiltered,
  summary,
  action,
}: FilterBarProps) => {
  const SearchIcon = ICONS.search

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-48 flex-1 sm:max-w-xs">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-subtle)]"
          aria-hidden="true"
        />
        <Input
          value={search}
          aria-label={searchLabel}
          placeholder={searchLabel}
          className="pl-9"
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      {filters.map((filter) => (
        <Select
          key={filter.name}
          aria-label={filter.label}
          value={values[filter.name] ?? ''}
          onChange={(event) => onFilter(filter.name, event.target.value)}
        >
          <option value="">{filter.allLabel}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ))}
      {isFiltered && (
        <Button variant="ghost" icon="close" onClick={onReset}>
          {ACTION_COPY.clearFilter}
        </Button>
      )}
      {summary && (
        <span className="text-xs text-[var(--color-ink-subtle)] tabular-nums">{summary}</span>
      )}
      {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
    </div>
  )
}
