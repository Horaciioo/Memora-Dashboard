'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { FiltersGlyph } from '@/components/elements/display/glyphs/FiltersGlyph'
import { Field } from '@/components/elements/forms/Field'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FILTER_STYLES } from '@/declarations/ui/variants'
import type { MaturityName } from '@/declarations/maturity/registries'
import type { FieldOption, OptionMark } from '@/types/forms'
import { cn } from '@/utils/classnames'

/**
 * Dropdown of the filter bar
 * @typedef {Object} FilterDefinition
 * @property {string} name - Filter key
 * @property {string} label - Accessible label
 * @property {string} allLabel - Label of the unfiltered option
 * @property {FieldOption[]} options - Selectable values
 * @property {OptionMark} [mark] - Glyph drawn beside every option
 * @property {MaturityName} [maturity] - Lifecycle tag drawn beside the label
 */

export interface FilterDefinition {
  name: string
  label: string
  allLabel: string
  options: FieldOption[]
  mark?: OptionMark
  maturity?: MaturityName
}

// Pause between two dropdowns arriving
const FILTER_STAGGER_MS = 70

export interface FilterBarProps {
  searchLabel: string
  search: string
  onSearch: (value: string) => void
  filters: FilterDefinition[]
  values: Record<string, string>
  onFilter: (name: string, value: string) => void
  onReset: () => void
  isFiltered: boolean
  action?: ReactNode
}

/**
 * A filter icon opening the dropdown sheet
 * @param {string} searchLabel - Accessible label of the search field
 * @param {string} search - Current search term
 * @param {(value: string) => void} onSearch - Search handler
 * @param {FilterDefinition[]} filters - Declared dropdowns
 * @param {Record<string, string>} values - Selected filter values
 * @param {(name: string, value: string) => void} onFilter - Filter handler
 * @param {() => void} onReset - Clears every filter
 * @param {boolean} isFiltered - At least one filter is set
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
  action,
}: FilterBarProps) => {
  const [isPanelOpen, setPanelOpen] = useState(false)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const SearchIcon = ICONS.search

  const tally = filters.filter((filter) => (values[filter.name] ?? '').length > 0).length

  // Opening the field always hands it the keyboard focus
  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus()
  }, [isSearchOpen])

  return (
    <div>
      <div className={FILTER_STYLES.bar}>
        {filters.length > 0 && (
          <button
            type="button"
            aria-label={ACTION_COPY.filters}
            aria-expanded={isPanelOpen}
            onClick={() => setPanelOpen((open) => !open)}
            className={cn(FILTER_STYLES.iconButton, tally > 0 && FILTER_STYLES.iconButtonActive)}
          >
            <FiltersGlyph className={FILTER_STYLES.glyph} />
            {tally > 0 && <span className={FILTER_STYLES.tally}>{tally}</span>}
          </button>
        )}

        <div className={FILTER_STYLES.searchGroup}>
          <button
            type="button"
            aria-label={searchLabel}
            aria-expanded={isSearchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            className={cn(
              FILTER_STYLES.iconButton,
              search.trim().length > 0 && FILTER_STYLES.iconButtonActive
            )}
          >
            <SearchIcon className={FILTER_STYLES.glyph} />
          </button>
          <input
            ref={searchRef}
            value={search}
            tabIndex={isSearchOpen ? 0 : -1}
            aria-label={searchLabel}
            placeholder={searchLabel}
            onChange={(event) => onSearch(event.target.value)}
            className={cn(FILTER_STYLES.searchInput, isSearchOpen && FILTER_STYLES.searchInputOpen)}
          />
        </div>

        {action && <div className={FILTER_STYLES.trailing}>{action}</div>}
      </div>

      {isPanelOpen && filters.length > 0 && (
        <div className={FILTER_STYLES.panel}>
          <div className={FILTER_STYLES.options}>
            {filters.map((filter, index) => {
              const id = `filter-${filter.name}`

              return (
                // Each dropdown arrives a beat after the one before
                <div
                  key={filter.name}
                  className={cn('filter-arrive', FILTER_STYLES.optionField)}
                  style={{ animationDelay: `${index * FILTER_STAGGER_MS}ms` }}
                >
                  <Field id={id} label={filter.label} maturity={filter.maturity}>
                    <SelectMenu
                      id={id}
                      label={filter.label}
                      options={filter.options}
                      value={values[filter.name] ?? ''}
                      emptyLabel={filter.allLabel}
                      mark={filter.mark}
                      onChange={(value) => onFilter(filter.name, value)}
                    />
                  </Field>
                </div>
              )
            })}
          </div>

          <Button
            disabled={!isFiltered}
            onClick={onReset}
            className={cn('filter-arrive', FILTER_STYLES.reset)}
            style={{ animationDelay: `${filters.length * FILTER_STAGGER_MS}ms` }}
          >
            {ACTION_COPY.reset}
          </Button>
        </div>
      )}
    </div>
  )
}
