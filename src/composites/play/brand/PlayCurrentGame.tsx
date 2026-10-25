import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * "You are in a game of" line, the game name in its own colour
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Game played
 * @return {JSX.Element}
 */

export const PlayCurrentGame = ({ game }: { game: PlayGameName }) => {
  const [before, after] = PLAY_HUB_COPY.current.split('{game}')

  return (
    <>
      {before}
      <span style={{ color: `var(${PLAY_GAMES.get(game).tone})` }}>{PLAY_GAMES.label(game)}</span>
      {after}
    </>
  )
}
