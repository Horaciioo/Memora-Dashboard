import type { CSSProperties } from 'react'

import { PLAY_FINALES } from '@/declarations/play'
import { PLAY_END_PAGE } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Scene of the game that closes the table: its own motion, then its word
 * @param {Object} props - Game
 * @param {PlayGameName} props.game - Game that just ended
 * @return {JSX.Element}
 */

export const PlayEndFinale = ({ game }: { game: PlayGameName }) => {
  const { word, bits } = PLAY_FINALES[game]

  return (
    <>
      <div className={PLAY_END_PAGE.finale} data-finale={game.toLowerCase()} aria-hidden="true">
        {Array.from({ length: bits }, (_, index) => (
          <i key={index} style={{ '--bit': index } as CSSProperties} />
        ))}
      </div>
      <span className={PLAY_END_PAGE.introTitle} data-finale-word={game.toLowerCase()}>
        {word}
      </span>
    </>
  )
}
