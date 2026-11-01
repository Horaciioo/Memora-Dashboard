'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { AbsenceCalendar } from '@/composites/absences/AbsenceCalendar'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import type { ScenarioSpan } from '@/types/scenario'
import { absenceRange } from '@/utils/format/absences'
import { capitalizeFirstLetter } from '@/utils/format/strings'

export interface ScenarioPeriodProps {
  booked: ScenarioSpan[]
  focus?: string
  onPick: (value: string, label: string) => void
}

/**
 * Calendar to pick the first and the last day, validated by one button
 * @param {ScenarioSpan[]} booked - Days already taken
 * @param {string} [focus] - Day whose month opens first
 * @param {(value: string, label: string) => void} onPick - Gets "start/end" and its words
 * @return {JSX.Element}
 */

export const ScenarioPeriod = ({ booked, focus, onPick }: ScenarioPeriodProps) => {
  const [range, setRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })
  const { start, end } = range

  return (
    <div className={ASSISTANT_STYLES.period}>
      <AbsenceCalendar
        isCompact
        start={start}
        end={end}
        booked={booked}
        focusDay={focus}
        onChange={(from, to) => setRange({ start: from, end: to })}
      />
      <p className={start && end ? ASSISTANT_STYLES.periodPicked : ASSISTANT_STYLES.periodHint}>
        {start && end ? capitalizeFirstLetter(absenceRange(start, end)) : SCENARIO_COPY.periodHint}
      </p>
      <Button
        variant="primary"
        disabled={!start || !end}
        onClick={() =>
          start && end && onPick(`${start}/${end}`, capitalizeFirstLetter(absenceRange(start, end)))
        }
      >
        {SCENARIO_COPY.periodConfirm}
      </Button>
    </div>
  )
}
