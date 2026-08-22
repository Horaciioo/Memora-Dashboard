'use client'

import { useEffect, useState } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import type { SearchSection } from '@/types/search'

/**
 * Search state
 * @typedef {Object} SearchResult
 * @property {SearchSection[]} sections - Grouped results
 * @property {boolean} isLoading - Request in flight
 */

interface SearchResult {
  sections: SearchSection[]
  isLoading: boolean
}

/**
 * Query the global search, debounced
 * @param {string} term - Raw search term
 * @return {SearchResult} - Results and loading state
 */

export const useSearch = (term: string): SearchResult => {
  const query = term.trim()
  const isActive = query.length >= SEARCH_SETTINGS.minLength
  const [result, setResult] = useState<{ term: string; sections: SearchSection[] }>({
    term: '',
    sections: [],
  })

  useEffect(() => {
    if (!isActive) return

    // Abort the previous request as soon as the term moves on
    const controller = new AbortController()
    const timer = setTimeout(() => {
      apiGet<SearchSection[]>(`${API_ROUTES.search}?q=${encodeURIComponent(query)}`)
        .then((sections) => {
          if (!controller.signal.aborted) setResult({ term: query, sections })
        })
        .catch(() => {
          if (!controller.signal.aborted) setResult({ term: query, sections: [] })
        })
    }, SEARCH_SETTINGS.debounceMs)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, isActive])

  // Loading is derived from the gap between the asked term and the settled one
  const isSettled = result.term === query

  return {
    sections: isActive && isSettled ? result.sections : [],
    isLoading: isActive && !isSettled,
  }
}
