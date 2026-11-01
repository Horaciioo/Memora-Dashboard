'use client'

import { useEffect, useRef } from 'react'

import { useAssistantDock } from '@/core/store/assistantDock'
import type { AssistantOffer } from '@/declarations/assistant/offers'

export interface FloatingAddProps {
  // What Memora says
  offer: AssistantOffer
  onClick: () => void
  // Beacons
  [attribute: `data-${string}`]: string
}

/**
 * Hands the page creation to the Memora button
 * @param {AssistantOffer} offer - Lines dropped
 * @param {() => void} onClick - Creation handler
 * @return {null}
 */

export const FloatingAdd = ({ offer, onClick, ...attributes }: FloatingAddProps) => {
  const place = useAssistantDock((state) => state.place)
  const clear = useAssistantDock((state) => state.clear)
  const takeHandoff = useAssistantDock((state) => state.takeHandoff)
  const latest = useRef(onClick)
  const attributesKey = JSON.stringify(attributes)

  useEffect(() => {
    latest.current = onClick
  })

  // Asked from the chat on another page
  useEffect(() => {
    if (takeHandoff(offer)) latest.current()
  }, [offer, takeHandoff])

  useEffect(() => {
    const action = {
      label: offer.ask,
      offer,
      run: () => latest.current(),
      attributes: JSON.parse(attributesKey) as Record<string, string>,
    }

    place(action)

    return () => clear(action)
  }, [offer, attributesKey, place, clear])

  return null
}
