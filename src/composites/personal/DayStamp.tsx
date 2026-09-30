import { HOME_STYLES } from '@/declarations/ui/variants'
import { parseDay, shortMonthLabel } from '@/utils/format/days'

export interface DayStampProps {
  date: string
}

/**
 * Day number over its month, the left column of a dated row
 * @param {string} date - ISO moment
 * @return {JSX.Element}
 */

export const DayStamp = ({ date }: DayStampProps) => {
  const day = parseDay(date)

  return (
    <span className={HOME_STYLES.stamp} aria-hidden="true">
      <span className={HOME_STYLES.stampDay}>{day.getDate()}</span>
      <span className={HOME_STYLES.stampMonth}>{shortMonthLabel(day)}</span>
    </span>
  )
}
