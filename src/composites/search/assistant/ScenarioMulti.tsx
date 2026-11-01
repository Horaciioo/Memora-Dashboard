'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import type { ScenarioChoice } from '@/types/scenario'

export interface ScenarioMultiProps {
  choices: ScenarioChoice[]
  onPick: (value: string, label: string) => void
}

/**
 * Answers to tick, validated by one button
 * @param {ScenarioChoice[]} choices - Answers offered
 * @param {(value: string, label: string) => void} onPick - Gets the ticked values and their words
 * @return {JSX.Element}
 */

export const ScenarioMulti = ({ choices, onPick }: ScenarioMultiProps) => {
  const [ticked, setTicked] = useState<string[]>([])
  const toggle = (value: string) =>
    setTicked((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
    )
  // Asked in the order of the list, whatever the order of the clicks
  const picked = choices.filter((choice) => ticked.includes(choice.value))

  return (
    <div className={ASSISTANT_STYLES.answers} role="group">
      {choices.map((choice) => (
        <Button
          key={choice.value}
          variant={ticked.includes(choice.value) ? 'primary' : 'secondary'}
          aria-pressed={ticked.includes(choice.value)}
          title={choice.hint}
          className={ASSISTANT_STYLES.answer}
          onClick={() => toggle(choice.value)}
        >
          {choice.label}
        </Button>
      ))}
      <Button
        variant="primary"
        disabled={picked.length === 0}
        className={ASSISTANT_STYLES.answer}
        onClick={() =>
          onPick(
            picked.map((choice) => choice.value).join(','),
            picked.map((choice) => choice.label).join(', ')
          )
        }
      >
        {SCENARIO_COPY.multiGo}
      </Button>
    </div>
  )
}
