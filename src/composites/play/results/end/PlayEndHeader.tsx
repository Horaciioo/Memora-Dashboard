import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PLAY_END_COPY, PLAY_END_TIMING, PLAY_GAMES } from '@/declarations/play'
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
      <h2 className={PLAY_END_PAGE.title} aria-label={PLAY_END_COPY.title}>
        {[...PLAY_END_COPY.title].map((letter, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={PLAY_END_PAGE.letter}
            style={{
              animationDelay: `${PLAY_END_TIMING.intro + index * PLAY_END_TIMING.letterStep}ms`,
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </h2>
    </div>
  </header>
)
