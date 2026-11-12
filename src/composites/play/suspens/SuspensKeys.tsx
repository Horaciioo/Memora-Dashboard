import { SUSPENS_BOARD_COPY, SUSPENS_SETTINGS } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Alphabet keys: green when the letter was in the word, red when it was not
 * @param {Object} props - Keys
 * @param {string[]} props.tried - Letters tried
 * @param {string[]} props.wrong - Letters tried that the word does not hold
 * @param {boolean} props.isOpen - The viewer may play a letter
 * @param {(letter: string) => void} props.onPick - Letter chosen
 * @return {JSX.Element}
 */

export const SuspensKeys = ({
  tried,
  wrong,
  isOpen,
  onPick,
}: {
  tried: string[]
  wrong: string[]
  isOpen: boolean
  onPick: (letter: string) => void
}) => (
  <div className={SUSPENS_BOARD.keys} role="group" aria-label={SUSPENS_BOARD_COPY.keyboard}>
    {SUSPENS_SETTINGS.alphabet.map((letter) => {
      const isTried = tried.includes(letter)

      return (
        <button
          key={letter}
          type="button"
          disabled={!isOpen || isTried}
          onClick={() => onPick(letter)}
          className={cn(
            SUSPENS_BOARD.key,
            !isTried && SUSPENS_BOARD.keyIdle,
            isTried && (wrong.includes(letter) ? SUSPENS_BOARD.keyMiss : SUSPENS_BOARD.keyHit)
          )}
        >
          {letter}
        </button>
      )
    })}
  </div>
)
