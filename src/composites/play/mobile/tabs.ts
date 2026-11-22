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
  // Left out of the phone bar, reached through the portrait menu
  isHidden?: boolean
}

// Same five pages as the desktop bar, the games in the middle
export const PLAY_TAB_ORDER: PlayTab[] = [
  { key: 'quests', href: ROUTES.playQuests },
  { key: 'ranking', href: ROUTES.playRanking() },
  { key: 'home', href: ROUTES.play },
  { key: 'group', href: ROUTES.playGroup },
  { key: 'trophies', href: ROUTES.playTrophies },
  { key: 'stats', href: ROUTES.playStats, isHidden: true },
  { key: 'feed', href: ROUTES.playFeed, isHidden: true },
]

// Tabs of the phone bar, the swipe walks through them
export const PLAY_PHONE_TABS = PLAY_TAB_ORDER.filter((tab) => !tab.isHidden)

// Words of each tab
export const PLAY_TAB_LABELS: Record<PlayTabGlyphName, string> = {
  group: PLAY_MOBILE_COPY.tabGroup,
  trophies: PLAY_MOBILE_COPY.tabTrophies,
  feed: PLAY_MOBILE_COPY.tabFeed,
  home: PLAY_MOBILE_COPY.tabHome,
  quests: PLAY_MOBILE_COPY.tabQuests,
  live: PLAY_MOBILE_COPY.tabLive,
  online: PLAY_MOBILE_COPY.tabOnline,
  ranking: PLAY_MOBILE_COPY.tabRanking,
  stats: PLAY_MOBILE_COPY.tabStats,
}

/**
 * Tab index a page belongs to, stats and history sharing one tab
 * @param {string} path - Current path
 * @param {PlayTab[]} [order] - Tabs to search
 * @return {number} - Index in the order, -1 off the tabs
 */

export const playTabIndexOf = (path: string, order: PlayTab[] = PLAY_TAB_ORDER): number => {
  const target = path.startsWith(ROUTES.playHistory()) ? ROUTES.playStats : path
  const index = order.findIndex(
    (tab) => tab.href !== ROUTES.play && target.startsWith(tab.href.split('?')[0])
  )
  if (index !== -1) return index

  return target === ROUTES.play ? order.findIndex((tab) => tab.key === 'home') : -1
}
