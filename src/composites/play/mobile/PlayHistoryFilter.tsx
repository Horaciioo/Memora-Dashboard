import { PlayGameSelect } from '@/composites/play/shared/PlayGameSelect'
import { PLAY_GAMES } from '@/declarations/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Game menu of the history, every game offered
 * @param {Object} props - Filter
 * @param {PlayGameName | null} props.game - Game on, null for all
 * @return {JSX.Element}
 */

export const PlayHistoryFilter = ({ game }: { game: PlayGameName | null }) => (
  <PlayGameSelect current={game} games={PLAY_GAMES.keys} page="history" />
)
