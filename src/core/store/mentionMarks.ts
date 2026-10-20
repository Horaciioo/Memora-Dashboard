'use client'

import { create } from 'zustand'

import type { MentionMark } from '@/types/mentions'

/**
 * Mentions found on the open record, and the remarks lit or calmed since
 * @typedef {Object} MentionMarksStore
 * @property {MentionMark[]} marks - Mentions unseen when the record opened
 * @property {string[]} forced - Remarks lit again by hand
 * @property {string[]} calmed - Remarks back to normal
 */

interface MentionMarksStore {
  marks: MentionMark[]
  forced: string[]
  calmed: string[]
  receive: (marks: MentionMark[]) => void
  calm: (ids: string[]) => void
  light: (id: string) => void
}

export const useMentionMarksStore = create<MentionMarksStore>()((set) => ({
  marks: [],
  forced: [],
  calmed: [],
  receive: (marks) => set((state) => ({ marks: [...state.marks, ...marks] })),
  calm: (ids) => set((state) => ({ calmed: [...state.calmed, ...ids] })),
  light: (id) =>
    set((state) => ({
      forced: [...state.forced, id],
      calmed: state.calmed.filter((calmedId) => calmedId !== id),
    })),
}))
