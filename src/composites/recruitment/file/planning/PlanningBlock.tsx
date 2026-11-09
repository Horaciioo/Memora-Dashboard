import { PLANNING_LAYOUT } from '@/declarations/recruitment/planning'
import type { PlanningPalette } from '@/declarations/recruitment/planning'
import type { PlannedBlock } from '@/core/lib/recruitment/rangePlanning'
import { minuteLabel } from '@/utils/format/calendar'

export interface PlanningBlockProps {
  block: PlannedBlock
  x: number
  y: number
  width: number
  height: number
  palette: PlanningPalette
  // Page of a candidate, names stay plain text without it
  hrefOf?: (candidateId: string) => string
}

/**
 * Cut a name to the room it has
 * @param {string} name - Full name
 * @param {number} room - Characters that fit
 * @return {string} - Name with an ellipsis when cut
 */

const fitName = (name: string, room: number): string =>
  name.length > room ? `${name.slice(0, Math.max(room - 1, 1))}…` : name

/**
 * Interviews of one minute, drawn as a block
 * @param {PlanningBlockProps} props - Block, box and paint
 * @return {JSX.Element}
 */

export const PlanningBlock = ({
  block,
  x,
  y,
  width,
  height,
  palette,
  hrefOf,
}: PlanningBlockProps) => {
  const { eventInset, eventSize, lineHeight, timeWidth, glyphWidth } = PLANNING_LAYOUT
  const isAlone = block.people.length === 1
  const room = Math.floor((width - (isAlone ? timeWidth : 0) - eventInset * 3) / glyphWidth)

  // Name on screen links to the file
  const nameOf = (person: PlannedBlock['people'][number]) => {
    const label = (
      <tspan fontWeight={600} fill={palette.ink}>
        {fitName(person.name, room)}
      </tspan>
    )

    return hrefOf ? (
      <a href={hrefOf(person.id)} aria-label={person.name}>
        {label}
      </a>
    ) : (
      label
    )
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={palette.accent}
        fillOpacity={0.14}
      />
      <text
        x={x + eventInset}
        y={isAlone ? y + height / 2 : y + eventInset}
        dominantBaseline={isAlone ? 'central' : 'hanging'}
        fontSize={eventSize}
      >
        <tspan fontWeight={700} fill={palette.ink}>
          {minuteLabel(block.startMinute)}
        </tspan>
        {isAlone ? (
          <tspan dx={eventInset}>{nameOf(block.people[0])}</tspan>
        ) : (
          block.people.map((person) => (
            <tspan key={person.id} x={x + eventInset} dy={lineHeight}>
              {nameOf(person)}
            </tspan>
          ))
        )}
      </text>
    </g>
  )
}
