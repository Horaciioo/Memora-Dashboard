'use client'

import { usePathname } from 'next/navigation'

import { usePageTree } from '@/core/hooks/data/pages'
import { useVisitedPaths } from '@/core/hooks/interaction/state/useVisitedPaths'
import { pathLine } from '@/core/lib/favorites/lines'
import type { FavoriteLine } from '@/core/lib/favorites/lines'
import { ASSISTANT_OFFERS } from '@/declarations/assistant/offers'
import type { AssistantOffer } from '@/declarations/assistant/offers'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { NavigationViews, visibleNavGroups } from '@/declarations/navigation'
import type { NavigationItem } from '@/declarations/navigation'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

export interface PaletteEntries {
  asks: { offer: AssistantOffer; icon: NavigationItem['icon'] }[]
  shortcuts: NavigationItem[]
  recents: FavoriteLine[]
}

/**
 * Creations and shortcuts the member reaches
 * @return {PaletteEntries} - Entries of the empty palette
 */

export const usePaletteEntries = (): PaletteEntries => {
  const { can, session } = useAuthContext()
  const pathname = usePathname()
  const { pages } = usePageTree()
  const { visited } = useVisitedPaths()
  const items = visibleNavGroups(NavigationViews.Administration, session, can).flatMap(
    (group) => group.items
  )
  const reached = new Map(items.map((item) => [item.href, item.icon]))

  const asks = Object.values<AssistantOffer>(ASSISTANT_OFFERS).flatMap((offer) => {
    const icon = reached.get(offer.href)

    return icon ? [{ offer, icon }] : []
  })

  // The page the member stands on is no use as a way back
  const byId = new Map(pages.map((page) => [page.id, page]))
  const recents = visited
    .filter((path) => path !== pathname)
    .flatMap((path) => pathLine(path, byId) ?? [])
    .slice(0, SEARCH_SETTINGS.recentPagesShown)

  return {
    recents,
    asks: asks.slice(0, ASSISTANT_SETTINGS.paletteAsks),
    shortcuts: items.filter((item) => item.quick),
  }
}
