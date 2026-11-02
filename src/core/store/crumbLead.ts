'use client'

import type { ReactNode } from 'react'
import { create } from 'zustand'

/**
 * Portrait the page hands to the phone trail
 * @typedef {Object} CrumbLeadStore
 * @property {ReactNode} lead - Glyph or portrait before the last crumb
 * @property {(lead: ReactNode) => void} set - Hand a lead over
 */

interface CrumbLeadStore {
  lead: ReactNode
  set: (lead: ReactNode) => void
}

export const useCrumbLead = create<CrumbLeadStore>()((set) => ({
  lead: null,
  set: (lead) => set({ lead }),
}))
