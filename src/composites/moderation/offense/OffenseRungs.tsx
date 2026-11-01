import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { RungMeasures } from '@/composites/moderation/offense/RungMeasures'
import { AddRow } from '@/components/structures/inline/AddRow'
import { InlineText } from '@/components/structures/inline/InlineText'
import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type {
  SanctionMeasureView,
  SanctionOffenseDetail,
  SanctionRungInput,
  SanctionRungView,
} from '@/types/sanctions'
import { fillCommand, writeDuration } from '@/utils/format/sanctions'

/**
 * Commands of one step on the surface of its panel
 * @param {Object} props - Step
 * @return {JSX.Element | null}
 */

const RungCommands = ({
  rung,
  offense,
}: {
  rung: SanctionRungView
  offense: SanctionOffenseDetail
}) => {
  const copy = useCopy(SANCTION_COPY.copied)
  const surface = SANCTION_PANEL_REGISTRY.get(offense.panel)

  const lines = rung.measures.flatMap((measure) => {
    const base = surface.commands[measure.kind]
    if (!base) return []
    const tool = measure.durationMinutes && base.timed ? base.timed : base

    const command = tool.command
      ? fillCommand(tool.command, {
          user: surface.userPlaceholder,
          duration: measure.durationMinutes
            ? writeDuration(measure.durationMinutes, surface.durationFormat)
            : '',
          reason: offense.name,
        })
      : null

    return [{ key: measure.id, command, how: tool.how }]
  })

  if (lines.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line) =>
        line.command ? (
          <div key={line.key} className="flex flex-col gap-0.5">
            <span className={OFFENSE_SHEET.command}>
              <code className={OFFENSE_SHEET.commandText}>{line.command}</code>
              <Button
                variant="icon"
                icon="copy"
                aria-label={SANCTION_COPY.copy}
                onClick={() => void copy(line.command!)}
              />
            </span>
            <span className={OFFENSE_SHEET.how}>{line.how}</span>
          </div>
        ) : (
          <span key={line.key} className={OFFENSE_SHEET.how}>
            {line.how}
          </span>
        )
      )}
    </div>
  )
}

/**
 * Handlers turning the staircase into its own editor
 * @typedef {Object} LadderEdit
 * @property {SanctionMeasureView[]} measures - Measures a step picks from
 * @property {(steps: SanctionRungInput[]) => Promise<boolean>} onSave - Persists the whole ladder
 */

export interface LadderEdit {
  measures: SanctionMeasureView[]
  onSave: (steps: SanctionRungInput[]) => Promise<boolean>
}

const toSteps = (rungs: SanctionRungView[]): SanctionRungInput[] =>
  rungs.map((rung) => ({ condition: rung.condition, measureIds: rung.measures.map((m) => m.id) }))

/**
 * One step of the staircase, read as is and edited where it stands
 * @param {Object} props - Step, its place and editing handlers
 * @return {JSX.Element}
 */

const Rung = ({
  rung,
  index,
  last,
  rungs,
  offense,
  edit,
}: {
  rung: SanctionRungView
  index: number
  last: boolean
  rungs: SanctionRungView[]
  offense: SanctionOffenseDetail
  edit?: LadderEdit
}) => {
  const steps = toSteps(rungs)
  const replace = (next: Partial<SanctionRungInput>) =>
    edit!.onSave(steps.map((step, at) => (at === index ? { ...step, ...next } : step)))

  const menu = useActionMenu(
    edit
      ? [
          {
            id: 'remove',
            label: SANCTION_COPY.removeRung,
            icon: 'remove',
            onSelect: () => void edit.onSave(steps.filter((_, at) => at !== index)),
          },
        ]
      : []
  )

  return (
    <li className={OFFENSE_SHEET.rung} onContextMenu={edit ? menu.onContextMenu : undefined}>
      {!last && <span className={OFFENSE_SHEET.rungRail} aria-hidden="true" />}
      <span className={OFFENSE_SHEET.rungDot} aria-hidden="true">
        {index + 1}
      </span>
      <div className={OFFENSE_SHEET.rungBody}>
        <InlineText
          id={`condition-${rung.id}`}
          value={rung.condition ?? ''}
          disabled={!edit}
          className={OFFENSE_SHEET.rungCondition}
          placeholder={SANCTION_COPY.conditionPlaceholder}
          onCommit={(condition) => replace({ condition })}
        />
        <RungMeasures
          measures={rung.measures}
          choices={edit?.measures ?? []}
          disabled={!edit}
          onCommit={(measureIds) => replace({ measureIds })}
        />
        <RungCommands rung={rung} offense={offense} />
      </div>
    </li>
  )
}

/**
 * The ladder of one level as a staircase
 * @param {Object} props - Steps, their offence and, when editable, the handlers
 * @return {JSX.Element}
 */

export const LadderView = ({
  rungs,
  offense,
  edit,
}: {
  rungs: SanctionRungView[]
  offense: SanctionOffenseDetail
  edit?: LadderEdit
}) => {
  const [adding, setAdding] = useState(false)

  if (rungs.length === 0 && !adding) {
    return (
      <>
        <p className={OFFENSE_SHEET.how}>{SANCTION_COPY.noLadder}</p>
        {edit && <AddRow label={SANCTION_COPY.addRung} onClick={() => setAdding(true)} />}
      </>
    )
  }

  return (
    <>
      <ol className={OFFENSE_SHEET.ladder}>
        {rungs.map((rung, index) => (
          <Rung
            key={rung.id}
            rung={rung}
            index={index}
            last={index === rungs.length - 1 && !adding}
            rungs={rungs}
            offense={offense}
            edit={edit}
          />
        ))}
        {adding && edit && (
          <li className={OFFENSE_SHEET.rung}>
            <span className={OFFENSE_SHEET.rungDot} aria-hidden="true">
              {rungs.length + 1}
            </span>
            <div className={OFFENSE_SHEET.rungBody}>
              <RungMeasures
                startOpen
                measures={[]}
                choices={edit.measures}
                onDismiss={() => setAdding(false)}
                onCommit={async (measureIds) => {
                  const done = await edit.onSave([
                    ...toSteps(rungs),
                    { condition: null, measureIds },
                  ])
                  if (done) setAdding(false)

                  return done
                }}
              />
            </div>
          </li>
        )}
      </ol>
      {edit && !adding && <AddRow label={SANCTION_COPY.addRung} onClick={() => setAdding(true)} />}
    </>
  )
}
