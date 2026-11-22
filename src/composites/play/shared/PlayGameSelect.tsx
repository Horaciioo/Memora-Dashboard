'use client'

import { useRouter } from 'next/navigation'

import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_MOBILE_COPY } from '@/declarations/play'
import type { PlayGameName } from '@/utils/constants/play'

// Page of one game for each filtered page, no slug for all of them
const PAGES = {
  ranking: (slug?: string) => ROUTES.playRanking(slug),
  history: (slug?: string) => ROUTES.playHistory(slug),
  stats: (slug?: string) => (slug ? ROUTES.playStatsGame(slug) : ROUTES.playStats),
} as const

export interface PlayGameSelectProps {
  // Null: every game together
  current: PlayGameName | null
  // Games offered, the playable ones when left out
  games?: PlayGameName[]
  // Page filtered by the menu
  page: keyof typeof PAGES
  // Run before leaving, to reset a sibling filter
  onPick?: () => void
  // Extra classes on the trigger
  className?: string
}

/**
 * Game menu shared by every Play page that filters by game
 * @param {PlayGameSelectProps} props - Current game, offered games, filtered page
 * @return {JSX.Element}
 */

export const PlayGameSelect = ({
  current,
  games,
  page,
  onPick,
  className,
}: PlayGameSelectProps) => {
  const router = useRouter()
  const offered = games ?? PLAY_GAMES.keys.filter((game) => PLAY_GAMES.get(game).playable)

  return (
    <SelectMenu
      isPlay
      className={className}
      label={PLAY_MOBILE_COPY.rankingGame}
      mark="playGame"
      emptyLabel={PLAY_MOBILE_COPY.gameAll}
      options={offered.map((game) => ({
        value: PLAY_GAMES.get(game).slug,
        label: PLAY_GAMES.label(game),
        icon: game,
      }))}
      value={current ? PLAY_GAMES.get(current).slug : ''}
      onChange={(slug) => {
        onPick?.()
        router.push(PAGES[page](slug || undefined))
      }}
    />
  )
}
