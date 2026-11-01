'use client'

import { create } from 'zustand'

import type { AssistantMemory } from '@/types/assistant'

/**
 * Assistant store, never persisted
 * @typedef {Object} AssistantStore
 * @property {AssistantMemory} memory - Last references
 * @property {(memory: AssistantMemory) => void} remember - Merge references
 */

interface AssistantStore {
  memory: AssistantMemory
  remember: (memory: AssistantMemory) => void
}

export const useAssistantStore = create<AssistantStore>()((set) => ({
  memory: {},
  remember: (memory) => set((state) => ({ memory: { ...state.memory, ...memory } })),
}))
