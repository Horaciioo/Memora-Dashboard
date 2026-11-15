'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Query parameters kept in the address without a navigation
 * @typedef {Object} UrlParams
 * @property {Record<string, string>} values - Current values, empty when absent
 * @property {(patch: Record<string, string>) => void} set - Change some, an empty value removes it
 */

export interface UrlParams {
  values: Record<string, string>
  set: (patch: Record<string, string>) => void
}

/**
 * Read and write named query parameters, the page stays mounted
 * @param {readonly string[]} names - Parameters owned
 * @return {UrlParams} - Values and setter
 */

export const useUrlParams = (names: readonly string[]): UrlParams => {
  const search = useSearchParams()

  const values = useMemo(
    () => Object.fromEntries(names.map((name) => [name, search.get(name) ?? ''])),
    [names, search]
  )

  const set = useCallback((patch: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search)
    for (const [name, value] of Object.entries(patch)) {
      if (value) next.set(name, value)
      else next.delete(name)
    }
    const query = next.toString()

    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
  }, [])

  return { values, set }
}
