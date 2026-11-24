'use client'

import { useEffect } from 'react'

import { useAssistantDock } from '@/core/store/assistantDock'
import type { ScenarioId } from '@/types/scenario'

/**
 * Record a page is about
 * @typedef {Object} PageFocus
 * @property {ScenarioId} kind - Record kind, also the guided talk it opens
 * @property {string} id - Record identifier
 * @property {string} label - Display name
 * @property {string} [entry] - Way into the guided talk
 */

export interface PageFocus {
  kind: ScenarioId
  id: string
  label: string
  entry?: string
}

/**
 * Tells Memora what the page is about, she opens the talk herself and reads « it » as this record
 * @param {PageFocus | null} focus - Record on screen, null when nothing can be done on it
 * @return {void}
 */

export const usePageFocus = (focus: PageFocus | null): void => {
  const focusOn = useAssistantDock((state) => state.focusOn)
  const focusOff = useAssistantDock((state) => state.focusOff)
  const { kind, id, label, entry } = focus ?? { kind: null, id: '', label: '', entry: '' }

  useEffect(() => {
    if (!kind) return

    const dock = {
      scenario: kind,
      entry: entry || 'onFile',
      data: { [`${kind}Id`]: id, name: label },
      element: { kind, id, label },
    }

    focusOn(dock)

    return () => focusOff(dock)
  }, [kind, id, label, entry, focusOn, focusOff])
}
