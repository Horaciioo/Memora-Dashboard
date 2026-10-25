'use client'

import { visibleNavGroups } from '@/declarations/navigation'
import { FAVORITE_COPY } from '@/declarations/ui/favorites'
import { useTour } from '@/managers/front-end/TourManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'

/**
 * Shortcuts and groups the rail and the phone sheet both draw
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {{ shortcuts: ShortcutEntry[], groups: ReturnType<typeof visibleNavGroups> }} - Entries on screen
 */

export const useRailEntries = (viewContext: ViewContext) => {
  const { can, session } = useAuthContext()
  // The first visit shows pages as it explains them
  const { isUnlocked } = useTour()

  const entries = visibleNavGroups(viewContext.view, session, can)
  // Shortcuts leave the groups too
  const shortcuts = entries
    .flatMap((group) => group.items)
    .filter((item) => item.quick && isUnlocked(item.href))
  const groups = entries
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.quick && isUnlocked(item.href)),
    }))
    .filter((group) => group.items.length > 0)

  // Starred pages lead the menu
  const favorites = session?.favorites ?? []
  const starred = favorites.length
    ? [
        {
          label: FAVORITE_COPY.group,
          from: viewContext.view,
          items: favorites.map((page) => ({
            href: page.path,
            label: page.label,
            icon: 'star' as const,
          })),
        },
      ]
    : []

  return { shortcuts, groups: [...starred, ...groups] }
}
