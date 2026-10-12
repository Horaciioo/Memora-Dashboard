'use client'

import { ROUTES, visibleNavGroups } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
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
  const shortcuts = [
    ...entries.flatMap((group) => group.items).filter((item) => item.quick),
    { href: ROUTES.preferences, label: NAV_COPY.preferences, icon: 'settings' as const },
  ].filter((item) => isUnlocked(item.href))
  const groups = entries
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.quick && isUnlocked(item.href)),
    }))
    .filter((group) => group.items.length > 0)

  return { shortcuts, groups }
}
