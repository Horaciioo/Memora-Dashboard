import { PlayGameLevels } from '@/composites/play/member/stats/PlayGameLevels'
import { PlayPlayerCard } from '@/composites/play/member/stats/PlayPlayerCard'
import { PlayStatTiles } from '@/composites/play/member/stats/PlayStatTiles'
import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { PLAY_STATS } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'

export interface PlayStatsBoardProps {
  state: PlayProfileView
  player: { name: string; avatarUrl: string | null }
}

/**
 * Whole progression in the classic Memora look, for the personal settings
 * @param {PlayStatsBoardProps} props - Profile and player
 * @return {JSX.Element}
 */

export const PlayStatsBoard = ({ state, player }: PlayStatsBoardProps) => (
  <div className={PLAY_STATS.classic}>
    <PlayPlayerCard totals={state.global} player={player} />
    <PlayStatTiles totals={state.global} />
    <PlayGameLevels games={state.games} />
    <PlayTrophies global={state.global} />
  </div>
)
