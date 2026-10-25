import { PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { PLAY_MEMBER } from '@/declarations/ui/variants'

export interface PlayRecordProps {
  wins: number
  draws: number
  losses: number
}

// Figure classes and units, in order
const PARTS = [
  { key: 'wins', figure: PLAY_MEMBER.win, unit: PLAY_MEMBER_COPY.wins },
  { key: 'draws', figure: PLAY_MEMBER.draw, unit: PLAY_MEMBER_COPY.draws },
  { key: 'losses', figure: PLAY_MEMBER.loss, unit: PLAY_MEMBER_COPY.losses },
] as const

/**
 * Wins, draws and losses in colour
 * @param {PlayRecordProps} props - Counters
 * @return {JSX.Element}
 */

export const PlayRecord = (props: PlayRecordProps) => (
  <span className={PLAY_MEMBER.record}>
    {PARTS.map((part, index) => (
      <span key={part.key} className="contents">
        {index > 0 && <span className={PLAY_MEMBER.divider} aria-hidden />}
        <span>
          <span className={part.figure}>{props[part.key]}</span>{' '}
          <span className={PLAY_MEMBER.unit}>{part.unit}</span>
        </span>
      </span>
    ))}
  </span>
)
