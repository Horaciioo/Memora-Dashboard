import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { MultiSelect } from '@/components/elements/forms/selects/MultiSelect'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { toOptions } from '@/core/lib/forms/options'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { SanctionMeasureView, SanctionRungInput, SanctionRungView } from '@/types/sanctions'
import type { SanctionGravityName } from '@/utils/constants/moderation'

/**
 * Ladder editor of one level: gravity
 * @param {Object} props - Starting ladder and handlers
 * @return {JSX.Element}
 */

export const LadderEditor = ({
  initial,
  gravity: initialGravity,
  measures,
  isSaving,
  onSave,
  onCancel,
}: {
  initial: SanctionRungView[]
  gravity: SanctionGravityName
  measures: SanctionMeasureView[]
  isSaving: boolean
  onSave: (gravity: SanctionGravityName, steps: SanctionRungInput[]) => void
  onCancel: () => void
}) => {
  const [gravity, setGravity] = useState(initialGravity)
  const [steps, setSteps] = useState<SanctionRungInput[]>(
    initial.map((rung) => ({
      condition: rung.condition,
      measureIds: rung.measures.map((measure) => measure.id),
    }))
  )
  const options = measures.map((measure) => ({
    value: measure.id,
    label: measure.name,
    accent: measure.accent ?? undefined,
  }))

  const patch = (index: number, next: Partial<SanctionRungInput>) =>
    setSteps((current) => current.map((step, at) => (at === index ? { ...step, ...next } : step)))

  return (
    <div className={OFFENSE_SHEET.editor}>
      <SelectMenu
        label={SANCTION_COPY.gravity}
        options={toOptions(SANCTION_GRAVITY_REGISTRY)}
        value={gravity}
        mark="dot"
        onChange={(next) => setGravity(next as SanctionGravityName)}
      />
      {steps.map((step, index) => (
        <div key={index} className={OFFENSE_SHEET.editorRung}>
          <span className={OFFENSE_SHEET.editorRow}>
            <Input
              value={step.condition ?? ''}
              placeholder={SANCTION_COPY.conditionPlaceholder}
              aria-label={SANCTION_COPY.conditionPlaceholder}
              onChange={(event) => patch(index, { condition: event.target.value })}
            />
            <Button
              variant="icon"
              icon="remove"
              aria-label={SANCTION_COPY.removeRung}
              onClick={() => setSteps((current) => current.filter((_, at) => at !== index))}
            />
          </span>
          <MultiSelect
            id={`rung-${index}`}
            label={SANCTION_COPY.measures}
            emptyLabel={SANCTION_COPY.measures}
            options={options}
            value={step.measureIds}
            mark="dot"
            onChange={(next) => patch(index, { measureIds: next })}
          />
        </div>
      ))}
      <div className={OFFENSE_SHEET.actions}>
        <Button
          icon="add"
          onClick={() => setSteps((current) => [...current, { condition: null, measureIds: [] }])}
        >
          {SANCTION_COPY.addRung}
        </Button>
        <Button
          variant="success"
          icon="confirm"
          disabled={steps.some((step) => step.measureIds.length === 0)}
          isLoading={isSaving}
          onClick={() => onSave(gravity, steps)}
        >
          {SANCTION_COPY.saveLadder}
        </Button>
        <Button variant="danger" icon="close" onClick={onCancel}>
          {SANCTION_COPY.cancel}
        </Button>
      </div>
    </div>
  )
}
