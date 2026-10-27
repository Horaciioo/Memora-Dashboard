'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { PlayInviteView } from '@/types/play'

/**
 * Invitations waiting on this screen
 * @typedef {Object} PlayInviteStore
 * @property {PlayInviteView[]} invites - Newest first
 * @property {string[]} dismissed - Closed here, kept per browser
 * @property {(invites: PlayInviteView[]) => void} receive - Fresh list
 * @property {(id: string) => void} dismiss - Close one
 */

interface PlayInviteStore {
  invites: PlayInviteView[]
  dismissed: string[]
  receive: (invites: PlayInviteView[]) => void
  dismiss: (id: string) => void
}

export const usePlayInviteStore = create<PlayInviteStore>()(
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
 * @return {PlayInviteView | null} - Invitation
 */

export const usePendingInvite = (): PlayInviteView | null =>
  usePlayInviteStore(
    (state) => state.invites.find((invite) => !state.dismissed.includes(invite.id)) ?? null
  )
