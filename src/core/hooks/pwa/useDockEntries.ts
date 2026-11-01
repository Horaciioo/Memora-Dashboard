'use client'

import { useMemo } from 'react'

import { useRailEntries } from '@/core/hooks/interaction/layout/useRailEntries'
import { dockCandidatesOf, resolveDock, splitDock } from '@/core/lib/pwa/dock'
import { APPLICATION_SETTINGS } from '@/declarations/configurations/settings'
import type { NavigationItem } from '@/declarations/navigation'
import { FAVORITE_COPY } from '@/declarations/ui/favorites'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'

/**
 * Pages beside Home in the dock, split around it
 * @param {ViewContext} viewContext - View on screen
 * @param {readonly string[]} held - Pages held back on a phone
 * @return {{ left: NavigationItem[], right: NavigationItem[] }} - Pages left and right of Home
 */

export const useDockEntries = (
  viewContext: ViewContext,
  held: readonly string[]
): { left: NavigationItem[]; right: NavigationItem[] } => {
  const { session } = useAuthContext()
  const { shortcuts, groups } = useRailEntries(viewContext)
  const saved = session?.mobileDock

  return useMemo(() => {
    // Starred pages stay in the menu
    const rail = [
      { label: '', from: viewContext.view, items: shortcuts },
      ...groups.filter((group) => group.label !== FAVORITE_COPY.group),
    ]

    return splitDock(
      resolveDock(saved ?? [], dockCandidatesOf(rail, held), APPLICATION_SETTINGS.dockSlots)
    )
  }, [shortcuts, groups, saved, held, viewContext.view])
}
