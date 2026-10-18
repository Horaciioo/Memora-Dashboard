import type { AudienceDay } from '@/core/services/system/AudienceService'
import { DAILY_BARS_STYLES } from '@/declarations/ui/variants'
import { formatDay } from '@/utils/format/dates'

export interface DailyBarsProps {
  days: AudienceDay[]
}

/**
 * Bars of members active per day
 * @param {AudienceDay[]} days - Daily series
 * @return {JSX.Element}
 */

export const DailyBars = ({ days }: DailyBarsProps) => {
  const peak = Math.max(1, ...days.map((day) => day.active))

  return (
    <div>
      <div
        className={DAILY_BARS_STYLES.chart}
        role="img"
        aria-label={days.map((day) => `${formatDay(day.day)} ${day.active}`).join(', ')}
      >
        {days.map((day) => (
          <div
            key={day.day}
            className={DAILY_BARS_STYLES.column}
            title={`${formatDay(day.day)} : ${day.active}`}
          >
            {day.active === 0 ? (
              <span className={DAILY_BARS_STYLES.empty} />
            ) : (
              <span
                className={DAILY_BARS_STYLES.bar}
                style={{ height: `${(day.active / peak) * 100}%` }}
              />
            )}
          </div>
        ))}
      </div>
      <div className={DAILY_BARS_STYLES.axis}>
        <span>{formatDay(days[0].day)}</span>
        <span>{formatDay(days[days.length - 1].day)}</span>
      </div>
    </div>
  )
}
