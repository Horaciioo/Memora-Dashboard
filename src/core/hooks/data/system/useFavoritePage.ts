'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FAVORITE_LIMIT } from '@/declarations/ui/favorites'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Star state of a page
 * @typedef {Object} FavoriteState
 * @property {boolean} isFavorite - Page is starred
 * @property {boolean} isFull - Another star cannot be given
 * @property {() => void} toggle - Star or unstar
 */

export interface FavoriteState {
  isFavorite: boolean
  isFull: boolean
  toggle: () => void
}

/**
 * Favorite star of a page
 * @param {string} path - Page path
 * @param {string} label - Page name
 * @return {FavoriteState} - State and handler
 */

export const useFavoritePage = (path: string, label: string): FavoriteState => {
  const router = useRouter()
  const { session } = useAuthContext()
  const [pending, setPending] = useState<boolean | null>(null)

  const held = session?.favorites ?? []

  // Optimistic until the refresh lands
  const isFavorite = pending ?? held.some((entry) => entry.path === path)
  const isFull = !isFavorite && held.length >= FAVORITE_LIMIT

  const toggle = () => {
    if (isFull) return

    setPending(!isFavorite)
    void apiPost(API_ROUTES.favoritePage, { path, label })
      .then(() => router.refresh())
      .catch(() => undefined)
      .finally(() => setPending(null))
  }

  return { isFavorite, isFull, toggle }
}
