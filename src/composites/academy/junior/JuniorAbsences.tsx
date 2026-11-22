'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { Status } from '@/components/elements/display/Status'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { JUNIOR_ABSENCES, LIST_STYLES } from '@/declarations/ui/variants'
import { endOfDay } from '@/utils/format/time/days'
import { formatDayRange } from '@/utils/format/time/dates'

/**
 * Absences the junior declared, for their referent
 * @return {JSX.Element}
 */

export const JuniorAbsences = () => {
  const { absences } = useJuniorState()
  const upcoming = absences.filter((absence) => endOfDay(new Date(absence.endDate)) >= new Date())

  return (
    <div className={JUNIOR_ABSENCES.root}>
      <span className={JUNIOR_ABSENCES.label}>
        {ACADEMY_COPY.absencesTitle}
        {upcoming.length > 0 && (
          <>
            <DotMark />
            {ACADEMY_COPY.absencesUpcoming(upcoming.length)}
          </>
        )}
      </span>
      {absences.length === 0 ? (
        <p className={JUNIOR_ABSENCES.empty}>{ACADEMY_COPY.absencesEmpty}</p>
      ) : (
        <ul className={LIST_STYLES.stack}>
          {absences.map((absence) => {
            const status = ABSENCE_STATUS_REGISTRY.get(absence.status)

            return (
              <li key={absence.id} className={LIST_STYLES.item}>
                <span className={JUNIOR_ABSENCES.dates}>
                  {formatDayRange(absence.startDate, absence.endDate)}
                </span>
                <span className={JUNIOR_ABSENCES.duration}>
                  {absence.dayCount === 1
                    ? ABSENCE_COPY.durationOne
                    : ABSENCE_COPY.duration.replace('{days}', String(absence.dayCount))}
                </span>
                <Status label={status.label} accent={status.accent} icon="statusDot" />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
