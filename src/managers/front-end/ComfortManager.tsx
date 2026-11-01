'use client'

import { useEffect } from 'react'

import { useComfortStore } from '@/core/store/comfort'
import { COMFORT_DEFAULTS } from '@/declarations/preferences/comfort'
import type { ComfortKey } from '@/declarations/preferences/comfort'

/**
 * Project the interface settings on the page, a default leaving no trace
 * @return {null} - No render
 */

export const ComfortManager = () => {
  const values = useComfortStore((state) => state.values)

  useEffect(() => {
    const { dataset } = document.documentElement

    for (const key of Object.keys(COMFORT_DEFAULTS) as ComfortKey[]) {
      if (values[key] === COMFORT_DEFAULTS[key]) delete dataset[key]
      else dataset[key] = String(values[key])
    }
  }, [values])

  return null
}
