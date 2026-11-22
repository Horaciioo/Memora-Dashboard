import { PlayLeaderboard } from '@/composites/play/hub/leaderboard/PlayLeaderboard'
import type { PlayLeaderboardProps } from '@/composites/play/hub/leaderboard/PlayLeaderboard'
import { PlayGameSelect } from '@/composites/play/shared/PlayGameSelect'
import { PLAY_BOX, PLAY_LEADER_PODIUM } from '@/declarations/ui/variants'
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
  return (
    <section className={PLAY_BOX.flat}>
      <PlayLeaderboard key={game ?? 'all'} leaders={leaders} meId={meId}>
        <PlayGameSelect
          current={game}
          games={games}
          page="ranking"
          className={PLAY_LEADER_PODIUM.gameField}
        />
      </PlayLeaderboard>
    </section>
  )
}
