import { useState } from 'react'

import { Avatar, AvatarStack } from '@/components/elements/display/Avatar'
import { AddRow } from '@/components/structures/inline/AddRow'
import { LiveCoordinatorsEditor } from '@/composites/lives/LiveCoordinatorsEditor'
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
  // Several coordinators pile their portraits, no names
  stacked?: boolean
  // Live whose Coordinators the viewer may change
  editLiveId?: string
}

/**
 * What a seat says under the name
 * @param {LiveCoordinatorSeat} seat - Coordinator asked
 * @return {string} - Window or answer
 */

export const seatNote = (seat: LiveCoordinatorSeat): string => {
  if (seat.status === CoordinationStatuses.Declined) return LIVE_COORDINATION_COPY.seatDeclined
  if (seat.status === CoordinationStatuses.Asked || !seat.startsAt || !seat.endsAt) {
    return LIVE_COORDINATION_COPY.seatAsked
  }

  return LIVE_COORDINATION_COPY.seatAccepted
    .replace('{from}', formatClock(seat.startsAt))
    .replace('{to}', formatClock(seat.endsAt))
}

/**
 * Line under a seat name: the answer, or the agreed window in small grey italics
 * @param {LiveCoordinatorSeat} seat - Coordinator asked
 * @return {JSX.Element}
 */

export const SeatNote = ({ seat }: { seat: LiveCoordinatorSeat }) => (
  <span
    className={cn(
      LIVE_COORDINATION.seatMeta,
      seat.status === CoordinationStatuses.Accepted && LIVE_COORDINATION.seatWindow
    )}
  >
    {seatNote(seat)}
  </span>
)

/**
 * Coordinators with their agreed hours, and the hours nobody covers
 * @param {LiveCoordinatorSeat[]} seats - Members asked
 * @param {LiveGap[]} gaps - Uncovered stretches
 * @param {boolean} [stacked] - Pile the portraits when several are asked
 * @param {string} [editLiveId] - Live the viewer may change the Coordinators of
 * @return {JSX.Element}
 */

export const LiveCoordinator = ({
  seats,
  gaps,
  stacked = false,
  editLiveId,
}: LiveCoordinatorProps) => {
  const [isEditing, setEditing] = useState(false)
  const Icon = ICONS[LIVE_COORDINATOR.icon]

  // One window for all: first agreed start to last agreed end
  const agreed = seats.filter(
    (seat) => seat.status === CoordinationStatuses.Accepted && seat.startsAt && seat.endsAt
  )
  const windowNote = agreed.length
    ? LIVE_COORDINATION_COPY.availableRange
        .replace('{from}', formatClock(agreed.map((seat) => seat.startsAt as string).sort()[0]))
        .replace(
          '{to}',
          formatClock(
            agreed
              .map((seat) => seat.endsAt as string)
              .sort()
              .at(-1) as string
          )
        )
    : LIVE_COORDINATION_COPY.seatAsked

  // Drawer and its dashed row, only for who may change the seats
  const editor = editLiveId && (
    <>
      <AddRow
        label={LIVE_COORDINATION_COPY.edit}
        className="mt-3"
        onClick={() => setEditing(true)}
      />
      <LiveCoordinatorsEditor
        liveId={editLiveId}
        open={isEditing}
        onClose={() => setEditing(false)}
      />
    </>
  )

  if (seats.length === 0) {
    return (
      <div className={LIVE_BOARD.fact}>
        <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinators}</span>
        <p className={LIVE_BOARD.coordinatorEmpty}>{LIVE_COPY.noCoordinator}</p>
        {editor}
      </div>
    )
  }

  const gapNote = gaps.length > 0 && (
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
  )

  if (stacked && seats.length > 1) {
    return (
      <div className={LIVE_BOARD.fact}>
        <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinators}</span>
        <div className={LIVE_COORDINATION.pile}>
          <AvatarStack
            size="md"
            people={seats.map((seat) => ({
              id: seat.person.id,
              name: seat.person.name,
              src: seat.person.avatar,
            }))}
          />
          <span className={LIVE_COORDINATION.seatMeta}>{windowNote}</span>
        </div>
        {gapNote}
        {editor}
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
              <SeatNote seat={seat} />
            </span>
          </li>
        ))}
      </ul>
      {gapNote}
      {editor}
    </div>
  )
}
