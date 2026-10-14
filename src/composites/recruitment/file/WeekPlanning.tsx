import {
  PLANNING_FONT,
  PLANNING_LAYOUT,
  PLANNING_SVG_NAMESPACE,
} from '@/declarations/recruitment/planning'
import type { PlanningPalette } from '@/declarations/recruitment/planning'
import { WEEKDAY_LABELS } from '@/declarations/calendar/copy'
import type { WeekPlan } from '@/core/lib/recruitment/weekPlanning'
import { minuteLabel } from '@/utils/format/calendar'
import { placeInLanes } from '@/utils/lanes'

export interface WeekPlanningProps {
  plan: WeekPlan
  palette: PlanningPalette
}

/**
 * Size of the picture of a week
 * @param {WeekPlan} plan - Week laid out
 * @return {{ width: number, height: number }} - Picture size
 */

export const planningSize = (plan: WeekPlan): { width: number; height: number } => ({
  width: PLANNING_LAYOUT.width,
  height: PLANNING_LAYOUT.headerHeight + (plan.toHour - plan.fromHour) * PLANNING_LAYOUT.hourHeight,
})

/**
 * Week of interviews, drawn as a picture
 * @param {WeekPlan} plan - Week laid out
 * @param {PlanningPalette} palette - Paint per role
 * @return {JSX.Element}
 */

export const WeekPlanning = ({ plan, palette }: WeekPlanningProps) => {
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
      className="h-auto w-full"
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
              {WEEKDAY_LABELS[index]}
            </text>
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
              const x = left + eventInset + lane * laneWidth
              const y = yOf(item.startMinute) + eventGap
              const eventHeight = (item.endMinute - item.startMinute) * minuteHeight - eventGap * 2
              const room = Math.floor(
                (laneWidth - PLANNING_LAYOUT.timeWidth - eventInset * 3) /
                  PLANNING_LAYOUT.glyphWidth
              )
              const name = item.name.length > room ? `${item.name.slice(0, room - 1)}…` : item.name

              return (
                <g key={item.id}>
                  <rect
                    x={x}
                    y={y}
                    width={laneWidth - eventGap}
                    height={eventHeight}
                    rx={8}
                    fill={palette.accent}
                    fillOpacity={0.14}
                  />
                  <rect x={x} y={y} width={4} height={eventHeight} rx={2} fill={palette.accent} />
                  <text
                    x={x + eventInset + 4}
                    y={y + eventHeight / 2}
                    dominantBaseline="central"
                    fontSize={PLANNING_LAYOUT.eventSize}
                  >
                    <tspan fontWeight={700} fill={palette.accent}>
                      {minuteLabel(item.startMinute)}
                    </tspan>
                    <tspan dx={eventInset} fontWeight={600} fill={palette.ink}>
                      {name}
                    </tspan>
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
