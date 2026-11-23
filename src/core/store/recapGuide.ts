'use client'

import { create } from 'zustand'

/**
 * How a guided stop ended
 * @type {'handled' | 'skipped'}
 */

export type GuideResult = 'handled' | 'skipped'

/**
 * Gesture Memora offers to do in the member's place
 * @typedef {Object} GuideAction
 * @property {string} label - Button text
 * @property {'success' | 'danger'} [tone] - Colour of the button
 * @property {() => Promise<void>} run - Does it
 */

export interface GuideAction {
  label: string
  tone?: 'success' | 'danger'
  run: () => Promise<void>
}

/**
 * Page Memora takes the member to, and the part of it she lights
 * @typedef {Object} Guide
 * @property {string} href - Page opened
 * @property {string | null} key - Route of the record lit on the page
 * @property {string | null} label - Title of the record, to find its box by its text
 * @property {boolean} isGoOnly - The stop ends once the page is open, nothing is lit
 * @property {GuideAction[]} actions - What she offers to do for the member
 * @property {string | null} scope - Id of the record, only a save touching it ends the stop
 * @property {(result: GuideResult) => void} resolve - Ends the stop
 */

export interface Guide {
  href: string
  key: string | null
  label: string | null
  isGoOnly: boolean
  actions: GuideAction[]
  scope: string | null
  resolve: (result: GuideResult) => void
}

interface RecapGuideStore {
  guide: Guide | null
  begin: (guide: Guide) => void
  end: (result: GuideResult) => void
}

export const useRecapGuide = create<RecapGuideStore>()((set, get) => ({
  guide: null,
  begin: (guide) => set({ guide }),
  end: (result) => {
    const { guide } = get()
    if (!guide) return

    set({ guide: null })
    guide.resolve(result)
  },
}))

/**
 * Take the member to a page and light what concerns them, until they act on it or skip
 * @param {string} href - Page opened
 * @param {string | null} [key] - Route of the record lit
 * @param {string | null} [label] - Title of the record
 * @param {boolean} [isGoOnly] - Only open the page, light nothing
 * @param {GuideAction[]} [actions] - Gestures offered in the member's place
 * @param {string | null} [scope] - Id of the record the stop is about
 * @return {Promise<GuideResult>} - Settled once handled or skipped
 */

export const requestGuide = (
  href: string,
  key: string | null = null,
  label: string | null = null,
  isGoOnly = false,
  actions: GuideAction[] = [],
  scope: string | null = null
): Promise<GuideResult> =>
  new Promise((resolve) => {
    // A stop still open gives way
    useRecapGuide.getState().end('skipped')
    useRecapGuide.getState().begin({ href, key, label, isGoOnly, actions, scope, resolve })
  })
