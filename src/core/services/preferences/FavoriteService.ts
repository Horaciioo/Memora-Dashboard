import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/core/lib/db'
import { FAVORITE_LIMIT } from '@/declarations/ui/favorites'
import type { FavoritePage } from '@/types/favorites'

/**
 * Read the stored stars
 * @param {unknown} stored - Json column
 * @return {FavoritePage[]} - Well-formed stars
 */

export const toFavorites = (stored: unknown): FavoritePage[] =>
  Array.isArray(stored)
    ? stored.filter(
        (entry): entry is FavoritePage =>
          typeof entry?.path === 'string' && typeof entry?.label === 'string'
      )
    : []

/**
 * Star or unstar a page
 * @param {string} accountId - Account identifier
 * @param {FavoritePage} page - Page to toggle
 * @return {Promise<FavoritePage[] | null>} - Stars now held, null when full
 */

export const toggleFavoritePage = async (
  accountId: string,
  page: FavoritePage
): Promise<FavoritePage[] | null> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { favorites: true },
  })
  const held = toFavorites(account?.favorites)

  // Toggle the path
  const isHeld = held.some((entry) => entry.path === page.path)
  if (!isHeld && held.length >= FAVORITE_LIMIT) return null
  const next = isHeld ? held.filter((entry) => entry.path !== page.path) : [...held, page]

  await prisma.account.update({
    where: { id: accountId },
    data: { favorites: next as unknown as Prisma.InputJsonValue },
  })

  return next
}
