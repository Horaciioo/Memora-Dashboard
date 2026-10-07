import { Avatar } from '@/components/elements/display/Avatar'
import { LIVE_COPY, LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { LIVE_COORDINATOR } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_BOARD, LIVE_COORDINATION } from '@/declarations/ui/variants'
import type { LiveCoordinatorSeat, LiveGap } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { CoordinationStatuses } from '@/utils/constants/lives'
import { formatClock } from '@/utils/format/dates'

export interface LiveCoordinatorProps {
  seats: LiveCoordinatorSeat[]
  gaps: LiveGap[]
}

/**
 * What a seat says under the name
 * @param {LiveCoordinatorSeat} seat - Coordinator asked
 * @return {string} - Window or answer
 */

const seatNote = (seat: LiveCoordinatorSeat): string => {
  if (seat.status === CoordinationStatuses.Declined) return LIVE_COORDINATION_COPY.seatDeclined
  if (seat.status === CoordinationStatuses.Asked || !seat.startsAt || !seat.endsAt) {
    return LIVE_COORDINATION_COPY.seatAsked
  }

  return LIVE_COORDINATION_COPY.seatAccepted
    .replace('{from}', formatClock(seat.startsAt))
    .replace('{to}', formatClock(seat.endsAt))
}

/**
 * Coordinators with their agreed hours, and the hours nobody covers
 * @param {LiveCoordinatorSeat[]} seats - Members asked
 * @param {LiveGap[]} gaps - Uncovered stretches
 * @return {JSX.Element}
 */

export const LiveCoordinator = ({ seats, gaps }: LiveCoordinatorProps) => {
  const Icon = ICONS[LIVE_COORDINATOR.icon]

  if (seats.length === 0) {
    return (
      <div className={LIVE_BOARD.fact}>
        <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinators}</span>
        <p className={LIVE_BOARD.coordinatorEmpty}>{LIVE_COPY.noCoordinator}</p>
      </div>
    )
  }

  return (
    <div className={LIVE_BOARD.fact}>
      <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinators}</span>
      <ul className={LIVE_COORDINATION.seats}>
        {seats.map((seat) => (
          <li
            key={seat.person.id}
            className={cn(
              LIVE_COORDINATION.seat,
              seat.status === CoordinationStatuses.Declined && LIVE_COORDINATION.seatMuted
            )}
          >
            <span className={LIVE_BOARD.coordinatorPortrait}>
              <Avatar name={seat.person.name} src={seat.person.avatar} size="md" />
              <span className={LIVE_BOARD.coordinatorBadge}>
                <Icon className={LIVE_BOARD.coordinatorGlyph} />
              </span>
            </span>
            <span className={LIVE_COORDINATION.seatText}>
              <span className={LIVE_COORDINATION.seatName}>{seat.person.name}</span>
              <span className={LIVE_COORDINATION.seatMeta}>{seatNote(seat)}</span>
            </span>
          </li>
        ))}
      </ul>
      {gaps.length > 0 && (
        <p className={LIVE_COORDINATION.gap}>
          {LIVE_COORDINATION_COPY.gapHint.replace(
            '{ranges}',
            gaps
              .map((gap) =>
                LIVE_COORDINATION_COPY.gapRange
                  .replace('{from}', formatClock(gap.from))
                  .replace('{to}', formatClock(gap.to))
              )
              .join(', ')
          )}
        </p>
      )}
    </div>
  )
}
