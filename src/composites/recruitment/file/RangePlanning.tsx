import { PlanningBlock } from '@/composites/recruitment/file/PlanningBlock'
import {
  PLANNING_FONT,
  PLANNING_LAYOUT,
  PLANNING_SVG_NAMESPACE,
} from '@/declarations/recruitment/planning'
import type { PlanningPalette } from '@/declarations/recruitment/planning'
import { WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import type { RangePlan } from '@/core/lib/recruitment/rangePlanning'
import { minuteLabel, weekdayOf } from '@/utils/format/calendar'
import { placeInLanes } from '@/utils/lanes'

export interface RangePlanningProps {
  plan: RangePlan
  palette: PlanningPalette
  // Page of a candidate, names stay plain text without it
  hrefOf?: (candidateId: string) => string
  // Replaces the scrolling width, the picture then fits its box
  className?: string
}

/**
 * Size of the picture of a period
 * @param {RangePlan} plan - Period laid out
 * @return {{ width: number, height: number }} - Picture size
 */

export const planningSize = (plan: RangePlan): { width: number; height: number } => ({
  width: Math.max(
    PLANNING_LAYOUT.width,
    PLANNING_LAYOUT.gutter + plan.days.length * PLANNING_LAYOUT.minColumn
  ),
  height: PLANNING_LAYOUT.headerHeight + (plan.toHour - plan.fromHour) * PLANNING_LAYOUT.hourHeight,
})

/**
 * Period of interviews, drawn as a picture
 * @param {RangePlanningProps} props - Plan, paint, candidate links and size
 * @return {JSX.Element}
 */

export const RangePlanning = ({ plan, palette, hrefOf, className }: RangePlanningProps) => {
  const { width, height } = planningSize(plan)
  const { gutter, headerHeight, hourHeight, eventInset, eventGap } = PLANNING_LAYOUT
  const columnWidth = (width - gutter) / plan.days.length
  const minuteHeight = hourHeight / 60
  const hours = Array.from({ length: plan.toHour - plan.fromHour + 1 }, (_, i) => plan.fromHour + i)
  const yOf = (minute: number) => headerHeight + (minute - plan.fromHour * 60) * minuteHeight

  return (
    <svg
      xmlns={PLANNING_SVG_NAMESPACE}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fontFamily={PLANNING_FONT}
      className={className ?? 'h-auto w-full min-w-[56rem]'}
    >
      <rect width={width} height={height} fill={palette.surface} />

      {hours.map((hour) => (
        <g key={hour}>
          <line
            x1={gutter}
            x2={width}
            y1={yOf(hour * 60)}
            y2={yOf(hour * 60)}
            stroke={palette.line}
            strokeOpacity={0.55}
          />
          {hour < plan.toHour && (
            <text
              x={gutter - 10}
              y={yOf(hour * 60) + PLANNING_LAYOUT.hourSize}
              textAnchor="end"
              fontSize={PLANNING_LAYOUT.hourSize}
              fill={palette.subtle}
            >
              {minuteLabel(hour * 60)}
            </text>
          )}
        </g>
      ))}

      {plan.days.map((day, index) => {
        const left = gutter + index * columnWidth
        const placed = placeInLanes(plan.byDay[day.key] ?? [])

        return (
          <g key={day.key}>
            <line x1={left} x2={left} y1={0} y2={height} stroke={palette.line} />
            <text
              x={left + columnWidth / 2}
              y={PLANNING_LAYOUT.dayNameSize + 16}
              textAnchor="middle"
              fontSize={PLANNING_LAYOUT.dayNameSize}
              fill={palette.subtle}
            >
              {WEEKDAY_LABELS[weekdayOf(day.key)]}
            </text>
            {day.isToday && (
              <circle
                cx={left + columnWidth / 2}
                cy={headerHeight - 14 - PLANNING_LAYOUT.dayNumberSize / 3}
                r={PLANNING_LAYOUT.dayNumberSize * 0.85}
                fill={palette.accent}
                fillOpacity={0.18}
              />
            )}
            <text
              x={left + columnWidth / 2}
              y={headerHeight - 14}
              textAnchor="middle"
              fontSize={PLANNING_LAYOUT.dayNumberSize}
              fontWeight={700}
              fill={palette.ink}
            >
              {day.dayOfMonth}
            </text>

            {placed.map(({ item, lane, lanes }) => {
              const laneWidth = (columnWidth - eventInset * 2) / lanes

              return (
                <PlanningBlock
                  key={item.startMinute}
                  block={item}
                  x={left + eventInset + lane * laneWidth}
                  y={yOf(item.startMinute) + eventGap}
                  width={laneWidth - eventGap}
                  height={(item.endMinute - item.startMinute) * minuteHeight - eventGap * 2}
                  palette={palette}
                  hrefOf={hrefOf}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
