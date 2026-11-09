'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { PlayNoticeView } from '@/types/play'

/**
 * Invitations waiting on this screen
 * @typedef {Object} PlayNoticeStore
 * @property {PlayNoticeView[]} invites - Newest first
 * @property {string[]} dismissed - Closed here, kept per browser
 * @property {(invites: PlayNoticeView[]) => void} receive - Fresh list
 * @property {(id: string) => void} dismiss - Close one
 */

interface PlayNoticeStore {
  invites: PlayNoticeView[]
  dismissed: string[]
  receive: (invites: PlayNoticeView[]) => void
  dismiss: (id: string) => void
}

export const usePlayNoticeStore = create<PlayNoticeStore>()(
  persist(
    (set) => ({
      invites: [],
      dismissed: [],
      // Closed ones forgotten once gone
      receive: (invites) =>
        set((state) => ({
          invites,
          dismissed: state.dismissed.filter((id) => invites.some((invite) => invite.id === id)),
        })),
      dismiss: (id) => set((state) => ({ dismissed: [...state.dismissed, id] })),
    }),
    { name: 'play-invites', partialize: (state) => ({ dismissed: state.dismissed }) }
  )
)

/**
 * Invitation to show, the newest still open
 * @return {PlayNoticeView | null} - Invitation
 */

export const usePendingNotice = (): PlayNoticeView | null =>
  usePlayNoticeStore(
    (state) => state.invites.find((invite) => !state.dismissed.includes(invite.id)) ?? null
  )
