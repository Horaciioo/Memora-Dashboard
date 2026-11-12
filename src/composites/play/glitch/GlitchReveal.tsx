import type { GlitchFace } from '@/composites/play/glitch/types'
import { secondsLabel } from '@/core/lib/play/glitch/rules'
import { GLITCH_BOARD_COPY, fillPlayMessage } from '@/declarations/play'
import { GLITCH_BOARD } from '@/declarations/ui/variants'

/**
 * Round verdict for the viewer: what was found, the place and the gain
 * @param {Object} props - Banner
 * @param {GlitchFace | undefined} props.me - Seat of the viewer
 * @param {number} props.total - Differences of the round
 * @param {boolean} props.hasMissed - Some differences are still ringed
 * @return {JSX.Element}
 */

export const GlitchReveal = ({
  me,
  total,
  hasMissed,
}: {
  me: GlitchFace | undefined
  total: number
  hasMissed: boolean
}) => (
  <div className={GLITCH_BOARD.reveal} aria-live="polite">
    {me?.rank ? (
      <>
        <span className={GLITCH_BOARD.revealName}>
          {fillPlayMessage(GLITCH_BOARD_COPY.allFound, { seconds: secondsLabel(me.ms) })}
        </span>
        <span className={GLITCH_BOARD.gain}>
          {fillPlayMessage(GLITCH_BOARD_COPY.points, { points: me.gain })}
        </span>
        <span className={GLITCH_BOARD.ribbon}>
          {me.rank === 1
            ? GLITCH_BOARD_COPY.first
            : fillPlayMessage(GLITCH_BOARD_COPY.rank, { rank: me.rank })}
        </span>
      </>
    ) : (
      <>
        <span className={GLITCH_BOARD.timeout}>
          {me?.found
            ? fillPlayMessage(GLITCH_BOARD_COPY.someFound, { found: me.found, total })
            : GLITCH_BOARD_COPY.noneFound}
        </span>
        {me?.found ? (
          <span className={GLITCH_BOARD.gain}>
            {fillPlayMessage(GLITCH_BOARD_COPY.points, { points: me.gain })}
          </span>
        ) : null}
      </>
    )}
    {hasMissed && <span className={GLITCH_BOARD.itWas}>{GLITCH_BOARD_COPY.missed}</span>}
  </div>
)
