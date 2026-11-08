import { ROUTES } from '@/declarations/navigation'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import type { PlayTabGlyphName } from '@/composites/play/mobile/PlayTabGlyphs'

/**
 * One Play tab, left to right
 * @typedef {Object} PlayTab
 */

export interface PlayTab {
  key: PlayTabGlyphName
  href: string
  // Left out of the phone bar
  isDesktopOnly?: boolean
}

export const PLAY_TAB_ORDER: PlayTab[] = [
  { key: 'group', href: ROUTES.playGroup },
  { key: 'feed', href: ROUTES.playFeed },
  { key: 'home', href: ROUTES.play },
  { key: 'lounge', href: ROUTES.playLounge, isDesktopOnly: true },
  { key: 'ranking', href: ROUTES.playRanking() },
  { key: 'stats', href: ROUTES.playStats },
]

// Tabs of the phone bar
export const PLAY_PHONE_TABS = PLAY_TAB_ORDER.filter((tab) => !tab.isDesktopOnly)

// The profile sits right after this tab on desktop
export const PLAY_ME_AFTER: PlayTabGlyphName = 'home'

// Words of each tab
export const PLAY_TAB_LABELS: Record<PlayTabGlyphName, string> = {
  group: PLAY_MOBILE_COPY.tabGroup,
  feed: PLAY_MOBILE_COPY.tabFeed,
  home: PLAY_MOBILE_COPY.tabHome,
  lounge: PLAY_MOBILE_COPY.tabLounge,
  ranking: PLAY_MOBILE_COPY.tabRanking,
  stats: PLAY_MOBILE_COPY.tabStats,
}

/**
 * Tab index a page belongs to, stats and history sharing the last tab
 * @param {string} path - Current path
 * @param {PlayTab[]} [order] - Tabs to search
 * @return {number} - Index in the order
 */

export const playTabIndexOf = (path: string, order: PlayTab[] = PLAY_TAB_ORDER): number => {
  if (path.startsWith(ROUTES.playHistory())) return order.findIndex((tab) => tab.key === 'stats')

  const index = order.findIndex(
    (tab) => tab.href !== ROUTES.play && path.startsWith(tab.href.split('?')[0])
  )

  return index === -1 ? order.findIndex((tab) => tab.key === 'home') : index
}
