'use client'

import { useRouter } from 'next/navigation'

import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { PlayLeaderboard } from '@/composites/play/hub/leaderboard/PlayLeaderboard'
import type { PlayLeaderboardProps } from '@/composites/play/hub/leaderboard/PlayLeaderboard'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_BOX } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayRankingBoxProps extends PlayLeaderboardProps {
  games: PlayGameName[]
  // Null: every game together
  game: PlayGameName | null
}

/**
 * Ranking in its box: the game picked in a menu, its name written nowhere else
 * @param {PlayRankingBoxProps} props - Games, current game, leaders and reader
 * @return {JSX.Element}
 */

export const PlayRankingBox = ({ games, game, leaders, meId }: PlayRankingBoxProps) => {
  const router = useRouter()

  return (
    <section className={PLAY_BOX.flat}>
      <SelectMenu
        isPlay
        label={PLAY_MOBILE_COPY.rankingGame}
        mark="playGame"
        emptyLabel={PLAY_MOBILE_COPY.gameAll}
        options={games.map((entry) => ({
          value: PLAY_GAMES.get(entry).slug,
          label: PLAY_GAMES.label(entry),
          icon: entry,
        }))}
        value={game ? PLAY_GAMES.get(game).slug : ''}
        onChange={(slug) => router.push(ROUTES.playRanking(slug || undefined))}
      />
      <PlayLeaderboard key={game ?? 'all'} leaders={leaders} meId={meId} />
    </section>
  )
}
