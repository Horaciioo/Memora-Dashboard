import { PLAY_TAB_LABELS } from '@/composites/play/mobile/tabs'
import type { PlayTabGlyphName } from '@/composites/play/mobile/PlayTabGlyphs'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_SECTION_COPY } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY } from '@/declarations/play/admin'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import type { IconName } from '@/declarations/ui/icons'

export interface PlayPage {
  key: PlayTabGlyphName
  label: string
  icon: IconName
  href: string
}

export interface PlaySection {
  key: 'play' | 'compete' | 'social' | 'trophies'
  label: string
  pages: PlayPage[]
}

/**
 * Pages of Play under category titles, each page its own tab
 * @type {PlaySection[]}
 */

export const PLAY_SECTIONS: PlaySection[] = [
  {
    key: 'play',
    label: PLAY_SECTION_COPY.play,
    pages: [
      {
        key: 'quests',
        label: PLAY_TAB_LABELS.quests,
        icon: 'playFlame',
        href: ROUTES.playQuests,
      },
      { key: 'home', label: PLAY_TAB_LABELS.home, icon: 'play', href: ROUTES.play },
    ],
  },
  {
    key: 'compete',
    label: PLAY_SECTION_COPY.compete,
    pages: [
      {
        key: 'ranking',
        label: PLAY_TAB_LABELS.ranking,
        icon: 'playCrown',
        href: ROUTES.playRanking(),
      },
    ],
  },
  {
    key: 'social',
    label: PLAY_SECTION_COPY.social,
    pages: [
      {
        key: 'group',
        label: PLAY_TAB_LABELS.group,
        icon: 'playPlayers',
        href: ROUTES.playGroup,
      },
    ],
  },
  {
    key: 'trophies',
    label: PLAY_SECTION_COPY.trophies,
    pages: [
      {
        key: 'trophies',
        label: PLAY_TAB_LABELS.trophies,
        icon: 'playTrophy',
        href: ROUTES.playTrophies,
      },
    ],
  },
]

export interface PlayAdminPage {
  key: 'adminPlayers' | 'adminGames' | 'adminBoosts' | 'adminSettings' | 'adminLogs' | 'adminStats'
  label: string
  icon: IconName
  href: string
}

/**
 * Administration pages, the sidebar of its room
 * @type {PlayAdminPage[]}
 */

export const PLAY_ADMIN_PAGES: PlayAdminPage[] = [
  {
    key: 'adminPlayers',
    label: PLAY_BOARD_ADMIN_COPY.tabPlayers,
    icon: 'members',
    href: ROUTES.playAdmin,
  },
  {
    key: 'adminGames',
    label: PLAY_CONFIG_COPY.tabGames,
    icon: 'play',
    href: ROUTES.playAdminGames,
  },
  {
    key: 'adminBoosts',
    label: PLAY_CONFIG_COPY.tabBoosts,
    icon: 'playStar',
    href: ROUTES.playAdminBoosts,
  },
  {
    key: 'adminSettings',
    label: PLAY_CONFIG_COPY.tabSettings,
    icon: 'settings',
    href: ROUTES.playAdminSettings,
  },
  {
    key: 'adminLogs',
    label: PLAY_BOARD_ADMIN_COPY.tabLogs,
    icon: 'history',
    href: ROUTES.playAdminLogs,
  },
  {
    key: 'adminStats',
    label: PLAY_BOARD_ADMIN_COPY.tabStats,
    icon: 'playStats',
    href: ROUTES.playAdminStats,
  },
]

/**
 * Administration page a path belongs to, a player file counting as the players page
 * @param {string} path - Current path
 * @return {PlayAdminPage['key'] | undefined}
 */

export const adminPageOfPath = (path: string): PlayAdminPage['key'] | undefined => {
  if (!path.startsWith(ROUTES.playAdmin)) return undefined
  if (path.startsWith(ROUTES.playAdminGames)) return 'adminGames'
  if (path.startsWith(ROUTES.playAdminBoosts)) return 'adminBoosts'
  if (path.startsWith(ROUTES.playAdminSettings)) return 'adminSettings'
  if (path.startsWith(ROUTES.playAdminLogs)) return 'adminLogs'
  if (path.startsWith(ROUTES.playAdminStats)) return 'adminStats'

  return 'adminPlayers'
}
