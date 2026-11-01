'use client'

import { useEffect } from 'react'

import { useAssistantDock } from '@/core/store/assistantDock'
import type { ScenarioId } from '@/types/scenario'

export interface FloatingFocusProps {
  scenario: ScenarioId
  entry: string
  data: Record<string, string>
}

/**
 * Tells Memora what the page is about, she opens the talk herself
 * @param {ScenarioId} scenario - Guided talk
 * @param {string} entry - Way in
 * @param {Record<string, string>} data - What the page knows
 * @return {null}
 */

export const FloatingFocus = ({ scenario, entry, data }: FloatingFocusProps) => {
  const focusOn = useAssistantDock((state) => state.focusOn)
  const focusOff = useAssistantDock((state) => state.focusOff)
  const dataKey = JSON.stringify(data)

  useEffect(() => {
    const focus = { scenario, entry, data: JSON.parse(dataKey) as Record<string, string> }

    focusOn(focus)

    return () => focusOff(focus)
  }, [scenario, entry, dataKey, focusOn, focusOff])

  return null
}
