'use client'

import { create } from 'zustand'

import {
  appendPage,
  dropEntry,
  dropRead,
  receiveEntry,
  refreshFeed,
  settleAll,
  settleEntry,
} from '@/core/lib/notifications/feed'
import type { NotificationEntry, NotificationFeed } from '@/types/notifications'

/**
 * Notifications shared by the bell, the full page and the bubbles
 * @typedef {Object} NotificationsStore
 * @property {NotificationFeed} feed - Entries newest first, badge, whether older ones wait
 * @property {NotificationEntry[]} nudges - Arrived during the visit, waiting for their bubble
 * @property {boolean} isSeeded - Server state received once
 */

interface NotificationsStore {
  feed: NotificationFeed
  nudges: NotificationEntry[]
  isSeeded: boolean
  seed: (feed: NotificationFeed) => void
  replace: (feed: NotificationFeed) => void
  receive: (entry: NotificationEntry, withBubble: boolean) => void
  settle: (id: string) => void
  settleEvery: () => void
  drop: (id: string) => void
  dropOpened: () => void
  extend: (page: NotificationFeed) => void
  shiftNudge: () => void
}

export const useNotificationsStore = create<NotificationsStore>()((set) => ({
  feed: { entries: [], unread: 0 },
  nudges: [],
  isSeeded: false,
  // A listing replaces the badge-only start, a badge-only start never empties a listing
  seed: (feed) =>
    set((state) =>
      !state.isSeeded || feed.entries.length > 0
        ? { feed, isSeeded: true }
        : { feed: { ...state.feed, unread: feed.unread }, isSeeded: true }
    ),
  replace: (page) => set((state) => ({ feed: refreshFeed(state.feed, page) })),
  receive: (entry, withBubble) =>
    set((state) => {
      const feed = receiveEntry(state.feed, entry)
      if (feed === state.feed) return state

      return { feed, nudges: withBubble && !entry.isRead ? [...state.nudges, entry] : state.nudges }
    }),
  settle: (id) => set((state) => ({ feed: settleEntry(state.feed, id) })),
  settleEvery: () => set((state) => ({ feed: settleAll(state.feed) })),
  drop: (id) => set((state) => ({ feed: dropEntry(state.feed, id) })),
  dropOpened: () => set((state) => ({ feed: dropRead(state.feed) })),
  extend: (page) => set((state) => ({ feed: appendPage(state.feed, page) })),
  shiftNudge: () => set((state) => ({ nudges: state.nudges.slice(1) })),
}))
