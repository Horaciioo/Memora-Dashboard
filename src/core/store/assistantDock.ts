'use client'

import { create } from 'zustand'

import { ASSISTANT_GREETINGS } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantOffer } from '@/declarations/assistant/offers'

/**
 * Creation offered by the open page
 * @typedef {Object} DockAction
 * @property {string} label - Creation label
 * @property {AssistantOffer} offer - Lines dropped
 * @property {() => void} run - Opens the form
 * @property {Record<string, string>} attributes - Beacons on the button
 */

export interface DockAction {
  label: string
  offer: AssistantOffer
  run: () => void
  attributes: Record<string, string>
}

/**
 * Memora button state, never persisted
 * @typedef {Object} AssistantDockStore
 * @property {DockAction | null} action - Page creation
 * @property {string | null} greeting - Opening line, set while the chat is open
 * @property {Handoff | null} handoff - Creation asked from another page
 */

interface Handoff {
  offer: AssistantOffer
  at: number
}

interface AssistantDockStore {
  action: DockAction | null
  greeting: string | null
  handoff: Handoff | null
  place: (action: DockAction) => void
  clear: (action: DockAction) => void
  open: () => void
  close: () => void
  toggle: () => void
  handOff: (offer: AssistantOffer) => void
  takeHandoff: (offer: AssistantOffer) => boolean
}

// A new line each time
const pickGreeting = () =>
  ASSISTANT_GREETINGS[Math.floor(Math.random() * ASSISTANT_GREETINGS.length)]

export const useAssistantDock = create<AssistantDockStore>()((set, get) => ({
  action: null,
  greeting: null,
  handoff: null,
  place: (action) => set({ action }),
  // Only the page that placed it
  clear: (action) => set((state) => (state.action === action ? { action: null } : state)),
  open: () => set((state) => ({ greeting: state.greeting ?? pickGreeting() })),
  close: () => set({ greeting: null }),
  toggle: () => set((state) => ({ greeting: state.greeting ? null : pickGreeting() })),
  handOff: (offer) => set({ handoff: { offer, at: Date.now() }, greeting: null }),
  // Only fresh, only once
  takeHandoff: (offer) => {
    const { handoff } = get()
    if (handoff?.offer !== offer) return false

    set({ handoff: null })

    return Date.now() - handoff.at < ASSISTANT_SETTINGS.handoffSeconds * 1000
  },
}))
