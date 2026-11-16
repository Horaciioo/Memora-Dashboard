import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PLAY_END_COPY, PLAY_GAMES } from '@/declarations/play'
import { PLAY_END_PAGE } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Banner of the end page: the game logo, then the title
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Game that ended
 * @return {JSX.Element}
 */

export const PlayEndHeader = ({ game }: { game: PlayGameName }) => (
  <header className={PLAY_END_PAGE.header}>
    <PlayGameLogo game={game} className={PLAY_END_PAGE.logo} />
    <div className={PLAY_END_PAGE.headText}>
      <span className={PLAY_END_PAGE.headGame}>{PLAY_GAMES.get(game).label}</span>
      <h2 className={PLAY_END_PAGE.title}>{PLAY_END_COPY.title}</h2>
    </div>
  </header>
)
