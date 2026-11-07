import { BacClock } from '@/composites/play/baccalaureat/BacClock'
import { BacStopBanner } from '@/composites/play/baccalaureat/BacStopBanner'
import type { BacPlayer } from '@/composites/play/baccalaureat/types'
import { BAC_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { BAC_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface BacHeaderProps {
  // Zero based round
  index: number
  total: number
  // Hidden before the countdown ends
  letter: string | null
  // Null when no clock runs
  clock: { left: number; total: number } | null
  stopper: BacPlayer | null
}

/**
 * Round number, letter tile and clock, the three things a round is read by
 * @param {BacHeaderProps} props - Round state
 * @return {JSX.Element}
 */

export const BacHeader = ({ index, total, letter, clock, stopper }: BacHeaderProps) => (
  <div className={BAC_BOARD.bar}>
    <div className={BAC_BOARD.roundBlock}>
      <span className={BAC_BOARD.roundLabel}>{BAC_BOARD_COPY.roundLabel}</span>
      <span className={BAC_BOARD.roundFigure}>
        {index + 1}
        <span className={BAC_BOARD.roundTotal}>
          {fillPlayMessage(BAC_BOARD_COPY.roundTotal, { total })}
        </span>
      </span>
      <span className={BAC_BOARD.pips} aria-hidden="true">
        {Array.from({ length: total }, (_, step) => (
          <span
            key={step}
            className={cn(
              BAC_BOARD.pip,
              step < index && BAC_BOARD.pipDone,
              step === index && BAC_BOARD.pipNow
            )}
          />
        ))}
      </span>
    </div>
    <span
      key={letter ?? 'hidden'}
      className={cn(BAC_BOARD.letter, !letter && BAC_BOARD.letterHidden)}
    >
      {letter ?? BAC_BOARD_COPY.letterHidden}
    </span>
    <div className={BAC_BOARD.clockSlot}>
      {stopper ? (
        <BacStopBanner stopper={stopper} />
      ) : (
        clock && <BacClock left={clock.left} total={clock.total} />
      )}
    </div>
  </div>
)
