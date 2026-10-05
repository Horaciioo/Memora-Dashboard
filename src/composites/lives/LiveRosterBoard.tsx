'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { useLiveRoster } from '@/core/hooks/data/useLiveRoster'
import { useActionMenu } from '@/core/hooks/interaction/useActionMenu'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { LIVE_ROSTER_COPY } from '@/declarations/lives/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { LIVE_ROSTER } from '@/declarations/ui/variants'
import type { LiveRosterPerson } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import type { AttendanceStatusName } from '@/utils/constants/workflow'

// Column order
const COLUMNS: AttendanceStatusName[] = [
  AttendanceStatuses.Present,
  AttendanceStatuses.Pending,
  AttendanceStatuses.Absent,
]

export interface LiveRosterBoardProps {
  liveId: string
}

/**
 * Roll-call of one live
 * @param {string} liveId - Live identifier
 * @return {JSX.Element}
 */

export const LiveRosterBoard = ({ liveId }: LiveRosterBoardProps) => {
  const { roster, move } = useLiveRoster(liveId)
  const { dragged, over, itemProps, containerProps } = useDragAndDrop((item, container) => {
    if (item.from !== container) void move(item.id, container as AttendanceStatusName)
  })

  return (
    <section className={LIVE_ROSTER.root} aria-label={LIVE_ROSTER_COPY.title}>
      <header className={LIVE_ROSTER.head}>
        <h3 className={LIVE_ROSTER.title}>{LIVE_ROSTER_COPY.title}</h3>
        <p className={LIVE_ROSTER.lead}>
          {roster?.canManage ? LIVE_ROSTER_COPY.leadManage : LIVE_ROSTER_COPY.lead}
        </p>
      </header>

      {!roster ? (
        <SkeletonList shape="row" rows={3} />
      ) : (
        <div className={LIVE_ROSTER.columns}>
          {COLUMNS.map((status) => {
            const option = ATTENDANCE_STATUS_REGISTRY.get(status)
            const Glyph = ICONS[option.icon]
            const people = roster.people.filter((person) => person.status === status)

            return (
              <div
                key={status}
                className={cn(
                  LIVE_ROSTER.column,
                  roster.canManage && over === status && LIVE_ROSTER.columnOver
                )}
                {...(roster.canManage ? containerProps(status) : {})}
              >
                <p className={cn(LIVE_ROSTER.columnHead, TONES[option.tone].text)}>
                  <Glyph className={LIVE_ROSTER.columnGlyph} aria-hidden="true" />
                  {option.label}
                </p>
                {people.length === 0 && (
                  <p className={LIVE_ROSTER.columnEmpty}>{LIVE_ROSTER_COPY.empty}</p>
                )}
                {people.map((person) => (
                  <RosterPerson
                    key={person.id}
                    person={person}
                    canManage={roster.canManage}
                    isDragged={dragged?.id === person.id}
                    dragProps={roster.canManage ? itemProps({ id: person.id, from: status }) : {}}
                    onMove={(next) => void move(person.id, next)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

interface RosterPersonProps {
  person: LiveRosterPerson
  canManage: boolean
  isDragged: boolean
  dragProps: object
  onMove: (status: AttendanceStatusName) => void
}

/**
 * One name on the roll-call
 * @param {LiveRosterPerson} person - Member
 * @param {boolean} canManage - Viewer runs the roll-call
 * @param {boolean} isDragged - Currently held
 * @param {object} dragProps - Drag handlers
 * @param {(status: AttendanceStatusName) => void} onMove - Move handler
 * @return {JSX.Element}
 */

const RosterPerson = ({ person, canManage, isDragged, dragProps, onMove }: RosterPersonProps) => {
  const menu = useActionMenu(
    COLUMNS.filter((status) => status !== person.status).map((status) => ({
      id: status,
      label: LIVE_ROSTER_COPY.moveTo.replace('{status}', ATTENDANCE_STATUS_REGISTRY.label(status)),
      icon: ATTENDANCE_STATUS_REGISTRY.get(status).icon,
      onSelect: () => onMove(status),
    })),
    person.name
  )

  return (
    <div
      className={cn(
        LIVE_ROSTER.person,
        canManage && LIVE_ROSTER.personMovable,
        isDragged && LIVE_ROSTER.personDragged
      )}
      {...dragProps}
      {...(canManage ? { onContextMenu: menu.onContextMenu } : {})}
    >
      <Avatar name={person.name} src={person.avatar} size="xs" />
      {person.name}
      {person.isJunior && <span className={LIVE_ROSTER.junior}>{LIVE_ROSTER_COPY.junior}</span>}
    </div>
  )
}
