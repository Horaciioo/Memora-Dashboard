'use client'

import { Status } from '@/components/elements/display/Status'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ATTENDANCE_STATUS_REGISTRY } from '@/declarations/calendar/registries'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { ACCOMPANIED_LIVES, LIST_STYLES } from '@/declarations/ui/variants'
import { AttendanceStatuses } from '@/utils/constants/workflow'
import { formatDay } from '@/utils/format/dates'

/**
 * Lives the junior was called on since their PIM began, with who came and who did not
 * @return {JSX.Element}
 */

export const JuniorLives = () => {
  const { lives } = useJuniorState()
  const present = lives.filter((live) => live.attendance === AttendanceStatuses.Present).length

  return (
    <div className={ACCOMPANIED_LIVES.root}>
      <span className={ACCOMPANIED_LIVES.label}>
        {ACADEMY_COPY.livesTitle}
        {lives.length > 0 && ` · ${ACADEMY_COPY.livesPresent(present, lives.length)}`}
      </span>
      {lives.length === 0 ? (
        <p className={ACCOMPANIED_LIVES.empty}>{ACADEMY_COPY.livesEmpty}</p>
      ) : (
        <ul className={LIST_STYLES.stack}>
          {lives.map((live) => {
            const Glyph = ICONS[LIVE_PLATFORM_REGISTRY.get(live.platform).icon]
            const attendance = ATTENDANCE_STATUS_REGISTRY.get(live.attendance)

            return (
              <li key={live.liveId} className={LIST_STYLES.item}>
                <Glyph className={ACCOMPANIED_LIVES.glyph} aria-hidden="true" />
                <span className={ACCOMPANIED_LIVES.body}>
                  <span className={ACCOMPANIED_LIVES.creator}>{live.creator}</span>
                  <span className={ACCOMPANIED_LIVES.title}>{live.title}</span>
                </span>
                <span className={ACCOMPANIED_LIVES.date}>{formatDay(live.startedAt)}</span>
                <Status label={attendance.label} tone={attendance.tone} icon={attendance.icon} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
