'use client'

import { useEffect } from 'react'

import { useSanctionColoursStore } from '@/core/store/appearance/sanctionColours'
import {
  SANCTION_COLOUR_KINDS,
  SANCTION_COLOUR_TOKENS,
} from '@/declarations/preferences/sanctionColours'

/**
 * Sync chosen sanction colours, darkened toward the ink to stay readable
 * @return {null} - No render
 */

export const SanctionColoursManager = () => {
  const colours = useSanctionColoursStore((state) => state.colours)

  useEffect(() => {
    const root = document.documentElement.style

    for (const kind of SANCTION_COLOUR_KINDS) {
      const colour = colours[kind]
      if (colour)
        root.setProperty(
          SANCTION_COLOUR_TOKENS[kind],
          `color-mix(in oklab, ${colour} 70%, var(--color-ink))`
        )
      else root.removeProperty(SANCTION_COLOUR_TOKENS[kind])
    }
  }, [colours])

  return null
}
