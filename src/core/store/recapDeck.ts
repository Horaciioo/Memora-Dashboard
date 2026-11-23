'use client'

import { create } from 'zustand'

// Where the deck keeps what was done, so a reload finds it as left
const KEY = 'memora:recap-deck'

/**
 * What the member did with the cards of one window
 * @typedef {Object} DeckSaved
 * @property {string} since - Start of the window the cards come from
 * @property {string[]} done - Threads handled
 * @property {string[]} skipped - Threads put at the bottom
 * @property {boolean} isFolded - Deck folded to one row
 */

interface DeckSaved {
  since: string
  done: string[]
  skipped: string[]
  isFolded: boolean
}

const fresh = (since: string): DeckSaved => ({ since, done: [], skipped: [], isFolded: false })

const read = (since: string): DeckSaved => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as DeckSaved | null

    return saved?.since === since ? saved : fresh(since)
  } catch {
    return fresh(since)
  }
}

const write = (saved: DeckSaved): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    // Without storage the deck simply starts over
  }
}

interface RecapDeckStore extends DeckSaved {
  open: (since: string) => void
  finish: (key: string) => void
  skip: (key: string) => void
  fold: (isFolded: boolean) => void
  clear: () => void
}

export const useRecapDeck = create<RecapDeckStore>()((set, get) => {
  // Every change is kept
  const keep = (change: Partial<DeckSaved>) => {
    set(change)
    const { since, done, skipped, isFolded } = get()
    write({ since, done, skipped, isFolded })
  }

  return {
    ...fresh(''),
    open: (since) => {
      if (get().since !== since) set(read(since))
    },
    finish: (key) => keep({ done: [...get().done, key] }),
    skip: (key) => keep({ skipped: [...get().skipped.filter((entry) => entry !== key), key] }),
    fold: (isFolded) => keep({ isFolded }),
    clear: () => {
      set(fresh(''))
      try {
        window.localStorage.removeItem(KEY)
      } catch {
        // Nothing kept, nothing to forget
      }
    },
  }
})
