'use client'

import { useCallback, useMemo, useState } from 'react'

import { useDebouncedValue } from '@/core/hooks/interaction/useDebouncedValue'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'

/**
 * FilterBar state
 * @typedef {Object} ListControls
 * @property {string} search - Typed term
 * @property {string} settledSearch - Debounced term
 * @property {(value: string) => void} setSearch - Term setter
 * @property {Record<string, string>} filterValues - Value per filter
 * @property {(name: string, value: string) => void} setFilter - Filter setter
 * @property {boolean} isFiltered - Anything narrows the list
 * @property {() => void} reset - Clear everything
 */

export interface ListControls {
  search: string
  settledSearch: string
  setSearch: (value: string) => void
  filterValues: Record<string, string>
  setFilter: (name: string, value: string) => void
  isFiltered: boolean
  reset: () => void
}

/**
 * Shared state of a filterable list
 * @param {Record<string, string>} [initialFilters] - Starting values
 * @return {ListControls} - FilterBar bindings
 */

export const useListControls = (initialFilters: Record<string, string> = {}): ListControls => {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState(initialFilters)
  const settledSearch = useDebouncedValue(search.trim(), SEARCH_SETTINGS.debounceMs)

  const setFilter = useCallback(
    (name: string, value: string) => setFilterValues((current) => ({ ...current, [name]: value })),
    []
  )

  const reset = useCallback(() => {
    setSearch('')
    setFilterValues({})
  }, [])

  const isFiltered = useMemo(
    () => search.trim().length > 0 || Object.values(filterValues).some((value) => value.length > 0),
    [search, filterValues]
  )

  return { search, settledSearch, setSearch, filterValues, setFilter, isFiltered, reset }
}
