import { groupByPeriod } from '@/core/lib/academy/periodGroups'
import type { MilestoneState } from '@/core/lib/academy/parkourTimeline'
import { PIM_PERIOD_REGISTRY } from '@/declarations/academy/timeline'
import type { PimPeriodName } from '@/declarations/academy/timeline'
import { PERIOD_TIMELINE_COPY } from '@/declarations/ui/copy'
import type { PeriodTimelineGroup } from '@/components/structures/data/PeriodTimeline'
import type { TimelineItem } from '@/components/structures/data/Timeline'
import type { PeriodView } from '@/types/academy'
import { formatDay, formatDayRange } from '@/utils/format/dates'

/**
 * Days a period runs between
 * @param {PeriodView | undefined} period - Period read
 * @return {string | null} - Range, or the day it began while it is open
 */

const datesOf = (period: PeriodView | undefined): string | null => {
  if (!period) return null

  const end = period.endsAt ?? period.expectedEndsAt

  return end
    ? formatDayRange(period.startsAt, end)
    : PERIOD_TIMELINE_COPY.since(formatDay(period.startsAt))
}

/**
 * Cut moments into the periods they belong to, each with its dates and standing
 * @param {T[]} moments - Moments in running order
 * @param {(moment: T) => TimelineItem} toItem - How one moment is drawn
 * @param {PeriodView[]} periods - Dated periods of the promotion
 * @return {PeriodTimelineGroup[]} - One group per period
 */

export const toPeriodGroups = <T extends { period: PimPeriodName; state: MilestoneState }>(
  moments: T[],
  toItem: (moment: T) => TimelineItem,
  periods: PeriodView[]
): PeriodTimelineGroup[] =>
  groupByPeriod(moments).map((group) => {
    const option = PIM_PERIOD_REGISTRY.get(group.period)

    return {
      id: group.period,
      title: option.label,
      lead: option.lead,
      dates: datesOf(periods.find((period) => period.key === group.period)),
      icon: option.icon,
      tone: option.tone,
      state: group.state,
      done: group.done,
      items: group.items.map(toItem),
    }
  })
