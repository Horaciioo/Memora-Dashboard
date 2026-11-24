'use client'

import { create } from 'zustand'

import type { RecapChapterName } from '@/declarations/recap/chapters'

/**
 * Subjects of the recap Memora tells, one at a time, in the order the member picks
 * @typedef {Object} RecapAgendaStore
 * @property {RecapChapterName[]} chapters - Subjects to cover
 * @property {RecapChapterName[]} done - Subjects finished, struck through
 * @property {RecapChapterName | null} current - Subject being talked about
 * @property {boolean} isPoint - Told by a point, the subjects are not clickable
 */

interface RecapAgendaStore {
  chapters: RecapChapterName[]
  done: RecapChapterName[]
  current: RecapChapterName | null
  isPoint: boolean
  set: (chapters: RecapChapterName[], isPoint?: boolean) => void
  focus: (chapter: RecapChapterName) => void
  finish: (chapter: RecapChapterName) => void
  clear: () => void
}

export const useRecapAgenda = create<RecapAgendaStore>((set) => ({
  chapters: [],
  done: [],
  current: null,
  isPoint: false,
  set: (chapters, isPoint = false) => set({ chapters, done: [], current: null, isPoint }),
  focus: (current) => set({ current }),
  finish: (chapter) =>
    set((state) => ({
      done: state.done.includes(chapter) ? state.done : [...state.done, chapter],
      current: state.current === chapter ? null : state.current,
    })),
  clear: () => set({ chapters: [], done: [], current: null, isPoint: false }),
}))
