import { SUSPENS_BOARD_COPY } from '@/declarations/play'
import { SUSPENS_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Cells of the word: found letters in place, empty cells for the rest; the setter reads the whole word
 * @param {Object} props - Word
 * @param {number} props.length - Cells
 * @param {(string | null)[]} props.mask - Letter of each cell once found
 * @param {string | null} props.secret - Word the setter reads, null for the others
 * @param {string | null} props.revealed - Word once the round is over
 * @return {JSX.Element}
 */

export const SuspensWord = ({
  length,
  mask,
  secret,
  revealed,
}: {
  length: number
  mask: (string | null)[]
  secret: string | null
  revealed: string | null
}) => {
  const full = revealed ?? secret
  const letters = full ? Array.from(full) : []

  return (
    <div className={SUSPENS_BOARD.word} role="img" aria-label={SUSPENS_BOARD_COPY.word}>
      {Array.from({ length }, (_, index) => {
        const found = mask[index] ?? null

        return (
          <span
            // The place is the identity, letters repeat
            key={index}
            className={cn(
              SUSPENS_BOARD.cell,
              found && SUSPENS_BOARD.cellFound,
              !found && full && SUSPENS_BOARD.cellSecret
            )}
          >
            {found ?? letters[index] ?? ''}
          </span>
        )
      })}
    </div>
  )
}
