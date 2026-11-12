import type { CSSProperties } from 'react'

import { JUMBLE_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Tilt cycle of the tiles, in degrees
const TILTS = [-7, 5, -3, 8, -5, 3, -8, 6]
// Pause between two tiles dropping, in ms
const STAGGER_MS = 45

/**
 * Tile style from its place
 * @param {number} index - Place
 * @param {number} stagger - Pause between tiles in ms
 * @return {CSSProperties} - Variables
 */

const tileStyle = (index: number, stagger: number): CSSProperties =>
  ({
    '--tilt': `${TILTS[index % TILTS.length]}deg`,
    '--delay': `${index * stagger}ms`,
  }) as CSSProperties

/**
 * Mixed letters as chunky tiles dropping in, then the word flipping face up on the reveal
 * @param {Object} props - Tiles
 * @param {string} props.scrambled - Mixed letters
 * @param {string | null} props.word - Answer once revealed
 * @param {boolean} props.isFound - Round won, green; lost, red
 * @param {number} props.round - Round, restarts the animation
 * @return {JSX.Element}
 */

export const JumbleTiles = ({
  scrambled,
  word,
  isFound,
  round,
}: {
  scrambled: string
  word: string | null
  isFound: boolean
  round: number
}) => {
  const letters = [...(word ?? scrambled)]

  return (
    <div
      // Fresh key, fresh drop
      key={`${round}-${word ? 'answer' : 'mix'}`}
      className={JUMBLE_BOARD.tiles}
      aria-label={word ?? scrambled}
    >
      {letters.map((letter, index) => (
        <span
          // The letter order is the identity
          key={`${index}-${letter}`}
          aria-hidden="true"
          style={tileStyle(index, STAGGER_MS)}
          className={cn(
            JUMBLE_BOARD.tile,
            word && JUMBLE_BOARD.tileFlip,
            word && (isFound ? JUMBLE_BOARD.tileWon : JUMBLE_BOARD.tileLost)
          )}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}

/**
 * Empty slots under the tiles, the first one lit by the hint
 * @param {Object} props - Slots
 * @param {number} props.length - Letters of the word
 * @param {string | null} props.hint - First letter once given
 * @return {JSX.Element}
 */

export const JumbleSlots = ({ length, hint }: { length: number; hint: string | null }) => (
  <div className={JUMBLE_BOARD.slots} aria-hidden="true">
    {Array.from({ length }, (_, index) => (
      <span
        // Slots only differ by place
        key={index}
        style={{ animationDelay: `${index * STAGGER_MS}ms` }}
        className={cn(JUMBLE_BOARD.slot, index === 0 && hint && JUMBLE_BOARD.slotHint)}
      >
        {index === 0 && hint ? hint : ' '}
      </span>
    ))}
  </div>
)
