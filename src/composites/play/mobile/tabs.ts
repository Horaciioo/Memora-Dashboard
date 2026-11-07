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
}

export const PLAY_TAB_ORDER: PlayTab[] = [
  { key: 'group', href: ROUTES.playGroup },
  { key: 'feed', href: ROUTES.playFeed },
  { key: 'home', href: ROUTES.play },
  { key: 'ranking', href: ROUTES.playRanking() },
  { key: 'stats', href: ROUTES.playStatsHistory },
]

// Words of each tab
export const PLAY_TAB_LABELS: Record<PlayTabGlyphName, string> = {
  group: PLAY_MOBILE_COPY.tabGroup,
  feed: PLAY_MOBILE_COPY.tabFeed,
  home: PLAY_MOBILE_COPY.tabHome,
  ranking: PLAY_MOBILE_COPY.tabRanking,
  stats: PLAY_MOBILE_COPY.tabStats,
}

// Stats and history share the last tab
const STATS_INDEX = 4

// Pages outside the tabs sit with the home
const HOME_INDEX = 2

/**
 * Tab index a page belongs to
 * @param {string} path - Current path
 * @return {number} - Index in PLAY_TAB_ORDER
 */

export const playTabIndexOf = (path: string): number => {
  if (path.startsWith(ROUTES.playHistory())) return STATS_INDEX

  const index = PLAY_TAB_ORDER.findIndex(
    (tab) => tab.href !== ROUTES.play && path.startsWith(tab.href.split('?')[0])
  )

  return index === -1 ? HOME_INDEX : index
}
