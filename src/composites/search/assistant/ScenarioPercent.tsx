'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'

export interface ScenarioPercentProps {
  value: number
  max: number
  onPick: (percent: number) => void
}

// Distance between two stops of the slider
const STEP = 5

/**
 * Slider to move a percentage, validated by one button
 * @param {number} value - Percentage it starts from
 * @param {number} max - Highest percentage
 * @param {(percent: number) => void} onPick - Gets the percentage chosen
 * @return {JSX.Element}
 */

export const ScenarioPercent = ({ value, max, onPick }: ScenarioPercentProps) => {
  const [percent, setPercent] = useState(value)

  return (
    <div className={ASSISTANT_STYLES.percent}>
      <input
        type="range"
        min={0}
        max={max}
        step={STEP}
        value={percent}
        aria-label={`${percent} %`}
        onChange={(event) => setPercent(Number(event.target.value))}
        className={ASSISTANT_STYLES.percentRange}
      />
      <span className={ASSISTANT_STYLES.percentValue}>{percent} %</span>
      <Button variant="primary" onClick={() => onPick(percent)}>
        {SCENARIO_COPY.percentGo}
      </Button>
    </div>
  )
}
