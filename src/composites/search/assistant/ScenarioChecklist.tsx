'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import type { ScenarioChoice } from '@/types/scenario'
import { cn } from '@/utils/classnames'

export interface ScenarioChecklistProps {
  choices: ScenarioChoice[]
  allLabel: string
  goLabel: string
  onPick: (value: string, label: string) => void
}

/**
 * Rows to tick, an "all" row on top, validated by one button
 * @param {ScenarioChoice[]} choices - Rows offered
 * @param {string} allLabel - Words of the row that ticks everything
 * @param {string} goLabel - Words of the validation button
 * @param {(value: string, label: string) => void} onPick - Gets the ticked values and their words
 * @return {JSX.Element}
 */

export const ScenarioChecklist = ({
  choices,
  allLabel,
  goLabel,
  onPick,
}: ScenarioChecklistProps) => {
  const [ticked, setTicked] = useState<string[]>([])
  const CheckGlyph = ICONS.check
  const isAll = ticked.length === choices.length
  const toggle = (value: string) =>
    setTicked((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
    )
  // Asked in the order of the list, whatever the order of the clicks
  const picked = choices.filter((choice) => ticked.includes(choice.value))

  const row = (label: string, isOn: boolean, onClick: () => void, isMaster = false) => (
    <button
      key={label}
      type="button"
      role="checkbox"
      aria-checked={isOn}
      onClick={onClick}
      className={cn(ASSISTANT_STYLES.checkRow, isMaster && ASSISTANT_STYLES.checkMaster)}
    >
      <span className={cn(ASSISTANT_STYLES.checkBox, isOn && ASSISTANT_STYLES.checkBoxOn)}>
        {isOn && <CheckGlyph className={ASSISTANT_STYLES.checkGlyph} aria-hidden="true" />}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )

  return (
    <div className={ASSISTANT_STYLES.checklist} role="group">
      {row(
        allLabel,
        isAll,
        () => setTicked(isAll ? [] : choices.map((choice) => choice.value)),
        true
      )}
      {choices.map((choice) =>
        row(choice.label, ticked.includes(choice.value), () => toggle(choice.value))
      )}
      <Button
        variant="primary"
        disabled={picked.length === 0}
        className={ASSISTANT_STYLES.checkGo}
        onClick={() =>
          onPick(
            picked.map((choice) => choice.value).join(','),
            picked.map((choice) => choice.label).join(', ')
          )
        }
      >
        {goLabel}
      </Button>
    </div>
  )
}
