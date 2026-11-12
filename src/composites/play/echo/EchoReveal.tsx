import { ECHO_ART } from '@/composites/play/echo/EchoSymbols'
import type { EchoFace } from '@/composites/play/echo/types'
import { ECHO_BOARD_COPY, ECHO_SYMBOLS, fillPlayMessage } from '@/declarations/play'
import { ECHO_BOARD } from '@/declarations/ui/variants'

/**
 * Round verdict for the viewer: the symbol, the rank and the gain
 * @param {Object} props - Banner
 * @param {number | null} props.answer - Symbol of the viewer
 * @param {EchoFace | undefined} props.me - Seat of the viewer
 * @return {JSX.Element}
 */

export const EchoReveal = ({ answer, me }: { answer: number | null; me: EchoFace | undefined }) => {
  const symbol = answer === null ? undefined : ECHO_SYMBOLS[answer]

  return (
    <div className={ECHO_BOARD.reveal} aria-live="polite">
      {symbol && (
        <svg viewBox="0 0 64 64" className={ECHO_BOARD.revealArt} aria-hidden="true">
          {ECHO_ART[symbol.key]}
        </svg>
      )}
      {me?.rank ? (
        <>
          <span className={ECHO_BOARD.revealName}>{ECHO_BOARD_COPY.found}</span>
          <span className={ECHO_BOARD.gain}>
            {fillPlayMessage(ECHO_BOARD_COPY.points, { points: me.gain })}
          </span>
          {me.rank === 1 && <span className={ECHO_BOARD.ribbon}>{ECHO_BOARD_COPY.first}</span>}
        </>
      ) : (
        <>
          <span className={ECHO_BOARD.timeout}>{ECHO_BOARD_COPY.nobody}</span>
          {symbol && (
            <span className={ECHO_BOARD.itWas}>
              {fillPlayMessage(ECHO_BOARD_COPY.answer, { symbol: symbol.label.toLowerCase() })}
            </span>
          )}
        </>
      )}
    </div>
  )
}
