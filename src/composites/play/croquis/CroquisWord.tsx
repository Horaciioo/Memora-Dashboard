import { CROQUIS_BOARD_COPY } from '@/declarations/play'
import { CROQUIS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Word line above the paper: the word itself for the drawer or once revealed, else empty slots
 * @param {Object} props - Word
 * @param {string | null} props.word - Word to show in full
 * @param {number[]} props.shape - Letters of each part of the word
 * @param {string | null} props.hint - First letter, once given
 * @param {boolean} props.isDrawer - The viewer draws
 * @return {JSX.Element}
 */

export const CroquisWord = ({
  word,
  shape,
  hint,
  isDrawer,
}: {
  word: string | null
  shape: number[]
  hint: string | null
  isDrawer: boolean
}) => {
  if (word) {
    return (
      <div className={CROQUIS_BOARD.word}>
        {isDrawer && <span className={CROQUIS_BOARD.wordKicker}>{CROQUIS_BOARD_COPY.wordIs}</span>}
        <span className={CROQUIS_BOARD.wordBig}>{word}</span>
      </div>
    )
  }

  return (
    <div className={CROQUIS_BOARD.word}>
      <div className={CROQUIS_BOARD.slots} role="img" aria-label={`${shape.join(' ')}`}>
        {shape.map((length, group) => (
          // Parts repeat in length, the place is the identity
          <div key={`${group}-${length}`} className={CROQUIS_BOARD.slotGroup}>
            {Array.from({ length }, (_, letter) => (
              <span
                key={letter}
                className={cn(
                  CROQUIS_BOARD.slot,
                  hint && group === 0 && letter === 0 && CROQUIS_BOARD.slotHint
                )}
              >
                {hint && group === 0 && letter === 0 ? hint : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
