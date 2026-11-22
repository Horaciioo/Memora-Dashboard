'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { subscribeTo } from '@/utils/subscribeTo'

const STORAGE_KEY = 'memora:play-shelf'
const RECENT_LIMIT = 4
const EMPTY = '{"favorites":[],"recents":[]}'
const listeners = new Set<() => void>()
const subscribe = subscribeTo(listeners)

const readRaw = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY
  } catch {
    return EMPTY
  }
}

/**
 * Favourite and recent games, kept in the browser
 * @return {Object} - Lists and their setters
 */

export const usePlayShelf = () => {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY)
  const shelf = useMemo(() => {
    try {
      const data = JSON.parse(raw) as { favorites?: string[]; recents?: string[] }

      return { favorites: data.favorites ?? [], recents: data.recents ?? [] }
    } catch {
      return { favorites: [], recents: [] }
    }
  }, [raw])

  const save = useCallback((next: { favorites: string[]; recents: string[] }) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage blocked
    }
    listeners.forEach((listener) => listener())
  }, [])

  const toggleFavorite = (game: string) =>
    save({
      ...shelf,
      favorites: shelf.favorites.includes(game)
        ? shelf.favorites.filter((name) => name !== game)
        : [...shelf.favorites, game],
    })
  const pushRecent = (game: string) =>
    save({
      ...shelf,
      recents: [game, ...shelf.recents.filter((name) => name !== game)].slice(0, RECENT_LIMIT),
    })

  const removeRecent = (game: string) =>
    save({ ...shelf, recents: shelf.recents.filter((name) => name !== game) })

  return { ...shelf, toggleFavorite, pushRecent, removeRecent }
}
