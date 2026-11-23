'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'

export interface ScenarioHoursProps {
  from: string
  to: string
  onPick: (value: string, label: string) => void
}

/**
 * Two date and time fields, validated by one button
 * @param {string} from - Wall clock the window starts from
 * @param {string} to - Wall clock the window ends at
 * @param {(value: string, label: string) => void} onPick - Gets "from/to" and a readable label
 * @return {JSX.Element}
 */

export const ScenarioHours = ({ from, to, onPick }: ScenarioHoursProps) => {
  const [start, setStart] = useState(from)
  const [end, setEnd] = useState(to)
  const isValid = Boolean(start && end && start < end)

  return (
    <div className={ASSISTANT_STYLES.hours}>
      <label className={ASSISTANT_STYLES.hoursField}>
        <span>{SCENARIO_COPY.hoursFrom}</span>
        <input
          type="datetime-local"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className={ASSISTANT_STYLES.hoursInput}
        />
      </label>
      <label className={ASSISTANT_STYLES.hoursField}>
        <span>{SCENARIO_COPY.hoursTo}</span>
        <input
          type="datetime-local"
          value={end}
          min={start}
          onChange={(event) => setEnd(event.target.value)}
          className={ASSISTANT_STYLES.hoursInput}
        />
      </label>
      <Button
        variant="primary"
        disabled={!isValid}
        onClick={() => onPick(`${start}/${end}`, `${start.slice(11)} à ${end.slice(11)}`)}
      >
        {SCENARIO_COPY.hoursGo}
      </Button>
    </div>
  )
}
