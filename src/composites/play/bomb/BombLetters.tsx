import { BOMB_BOARD_COPY } from '@/declarations/play'
import { BOMB_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Bonus letters in a column, the gathered ones lit
 * @param {Object} props - Letters
 * @param {string[]} props.alphabet - Letters to use
 * @param {string[]} props.gathered - Letters used
 * @return {JSX.Element}
 */

export const BombLetters = ({ alphabet, gathered }: { alphabet: string[]; gathered: string[] }) => (
  <aside
    className={BOMB_BOARD.letters}
    aria-label={BOMB_BOARD_COPY.letters}
    title={BOMB_BOARD_COPY.lettersHint}
  >
    {alphabet.map((letter) => (
      <span
        key={letter}
        className={cn(BOMB_BOARD.letter, gathered.includes(letter) && BOMB_BOARD.letterOn)}
      >
        {letter}
      </span>
    ))}
  </aside>
)
