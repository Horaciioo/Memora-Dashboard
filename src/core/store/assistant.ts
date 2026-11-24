'use client'

import { create } from 'zustand'

import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantEntityKind, AssistantMemory } from '@/types/assistant'

/**
 * Assistant store, never persisted
 * @typedef {Object} AssistantStore
 * @property {AssistantMemory} memory - References still fresh
 * @property {Partial<Record<AssistantEntityKind, number>>} ages - Sentences since each was named
 * @property {(memory: AssistantMemory) => void} remember - Merge references, they are fresh again
 * @property {() => void} tick - A sentence went by, old references are forgotten
 * @property {() => void} forget - Start from nothing
 */

interface AssistantStore {
  memory: AssistantMemory
  ages: Partial<Record<AssistantEntityKind, number>>
  remember: (memory: AssistantMemory) => void
  tick: () => void
  forget: () => void
}

export const useAssistantStore = create<AssistantStore>()((set) => ({
  memory: {},
  ages: {},
  remember: (memory) =>
    set((state) => ({
      memory: { ...state.memory, ...memory },
      ages: {
        ...state.ages,
        ...Object.fromEntries(Object.keys(memory).map((kind) => [kind, 0])),
      },
    })),
  tick: () =>
    set((state) => {
      const ages = Object.fromEntries(
        Object.entries(state.ages).map(([kind, age]) => [kind, (age ?? 0) + 1])
      ) as AssistantStore['ages']
      const stale = (Object.keys(ages) as AssistantEntityKind[]).filter(
        (kind) => (ages[kind] ?? 0) > ASSISTANT_SETTINGS.memoryTurns
      )
      const memory = { ...state.memory }
      for (const kind of stale) {
        delete memory[kind]
        delete ages[kind]
      }

      return { memory, ages }
    }),
  forget: () => set({ memory: {}, ages: {} }),
}))
