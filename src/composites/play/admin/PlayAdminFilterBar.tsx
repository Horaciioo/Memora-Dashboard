'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import type { FilterDefinition } from '@/components/structures/data/FilterBar'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Pause between two dropdowns arriving
const FILTER_STAGGER_MS = 70

export interface PlayAdminFilterBarProps {
  searchLabel: string
  search: string
  onSearch: (value: string) => void
  filters: FilterDefinition[]
  values: Record<string, string>
  onFilter: (name: string, value: string) => void
  onReset: () => void
  isFiltered: boolean
  // Control standing before the filter icon
  leading?: ReactNode
  // Control aligned to the right
  action?: ReactNode
  // Extra row of the filter sheet
  extra?: ReactNode
}

/**
 * Filter bar of the moderator list in Play colours: a filter icon opening the dropdown sheet, a search icon unfolding its field
 * @param {PlayAdminFilterBarProps} props - Search, filters and values
 * @return {JSX.Element}
 */

export const PlayAdminFilterBar = ({
  searchLabel,
  search,
  onSearch,
  filters,
  values,
  onFilter,
  onReset,
  isFiltered,
  leading,
  action,
  extra,
}: PlayAdminFilterBarProps) => {
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
      <div className={PLAY_ADMIN.bar}>
        {leading}
        <button
          type="button"
          aria-label={ACTION_COPY.filters}
          aria-expanded={isPanelOpen}
          onClick={() => setPanelOpen((open) => !open)}
          className={cn(PLAY_ADMIN.iconButton, tally > 0 && PLAY_ADMIN.iconButtonActive)}
        >
          <ICONS.filter className={PLAY_ADMIN.glyph} />
          {tally > 0 && <span className={PLAY_ADMIN.tally}>{tally}</span>}
        </button>

        <div className={PLAY_ADMIN.searchGroup}>
          <button
            type="button"
            aria-label={searchLabel}
            aria-expanded={isSearchOpen}
            onClick={() => setSearchOpen((open) => !open)}
            className={cn(
              PLAY_ADMIN.iconButton,
              search.trim().length > 0 && PLAY_ADMIN.iconButtonActive
            )}
          >
            <SearchIcon className={PLAY_ADMIN.glyph} />
          </button>
          <input
            ref={searchRef}
            value={search}
            tabIndex={isSearchOpen ? 0 : -1}
            aria-label={searchLabel}
            placeholder={searchLabel}
            onChange={(event) => onSearch(event.target.value)}
            className={cn(PLAY_ADMIN.searchInput, isSearchOpen && PLAY_ADMIN.searchInputOpen)}
          />
        </div>

        {action && <div className={PLAY_ADMIN.trailing}>{action}</div>}
      </div>

      {isPanelOpen && (
        <div className={PLAY_ADMIN.filterPanel}>
          <div className={PLAY_ADMIN.filterOptions}>
            {filters.map((filter, index) => {
              const id = `play-filter-${filter.name}`

              return (
                // Each dropdown arrives a beat after the one before
                <div
                  key={filter.name}
                  className={cn('filter-arrive', PLAY_ADMIN.filterField)}
                  style={{ animationDelay: `${index * FILTER_STAGGER_MS}ms` }}
                >
                  <label htmlFor={id} className={PLAY_ADMIN.filterLabel}>
                    {filter.label}
                  </label>
                  <SelectMenu
                    isPlay
                    id={id}
                    label={filter.label}
                    options={filter.options}
                    value={values[filter.name] ?? ''}
                    emptyLabel={filter.allLabel}
                    emptyIcon={filter.allIcon}
                    mark={filter.mark}
                    onChange={(value) => onFilter(filter.name, value)}
                  />
                </div>
              )
            })}
            {extra}
          </div>

          <Button
            variant="arcade"
            disabled={!isFiltered}
            onClick={onReset}
            className={cn('filter-arrive', 'shrink-0')}
            style={{ animationDelay: `${filters.length * FILTER_STAGGER_MS}ms` }}
          >
            {ACTION_COPY.reset}
          </Button>
        </div>
      )}
    </div>
  )
}
