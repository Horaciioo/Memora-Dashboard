'use client'

import { useState } from 'react'

import { writeTerms } from '@/core/lib/modview/terms'

/**
 * Term list saved as it changes
 * @param {string[]} initial - Stored terms
 * @param {(text: string) => Promise<boolean>} save - Writes the field
 * @return {[string[], (next: string[]) => void]} - Terms and setter
 */

export const useSavedTerms = (
  initial: string[],
  save: (text: string) => Promise<boolean>
): [string[], (next: string[]) => void] => {
  const [terms, setTerms] = useState(initial)

  const change = (next: string[]) => {
    const previous = terms
    setTerms(next)

    // Back to the stored list on failure
    void save(writeTerms(next)).then((done) => {
      if (!done) setTerms(previous)
    })
  }

  return [terms, change]
}
