'use client'

import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { SANCTION_COPY, SANCTION_FIELD_COPY, stepLabel } from '@/declarations/sanctions/copy'
import { SANCTION_SETTINGS } from '@/declarations/configurations/settings'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { SANCTION_STYLES } from '@/declarations/ui/variants'
import { TONES, toTone } from '@/declarations/ui/theme'
import type { FieldDefinition, FieldIssue, FormValues } from '@/types/forms'
import type { LadderStepInput } from '@/core/services/sanctions/SanctionService'
import type { SanctionMeasureView, SanctionOffenseDetail } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

export interface SanctionOffenseDialogProps {
  offense: SanctionOffenseDetail | null
  levelId: string | null
  levelName: string
  measures: SanctionMeasureView[]
  fields: FieldDefinition[]
  issues: FieldIssue[]
  isSaving: boolean
  canManage: boolean
  onSaveOffense: (id: string, values: FormValues) => Promise<boolean>
  onSaveLadder: (id: string, levelId: string, steps: LadderStepInput[]) => Promise<boolean>
  onClose: () => void
}

/**
 * Read the ladder of the open panel as an editable draft
 * @param {SanctionOffenseDetail | null} offense - Offence opened
 * @param {string | null} levelId - Panel on screen
 * @return {LadderStepInput[]} - Draft rungs
 */

const toDraft = (
  offense: SanctionOffenseDetail | null,
  levelId: string | null
): LadderStepInput[] =>
  levelId && offense
    ? (offense.ladders[levelId] ?? []).map((tier) => ({
        measureId: tier.measure.id,
        note: tier.note,
      }))
    : []

/**
 * One offence in full — what it covers, a case, its ladder for the open panel, and the
 * reason a moderator pastes. An administrator edits all of it right here
 * @param {SanctionOffenseDetail | null} offense - Offence opened
 * @param {string | null} levelId - Panel on screen
 * @param {string} levelName - Panel label
 * @param {SanctionMeasureView[]} measures - Measures a rung may pick
 * @param {FieldDefinition[]} fields - Declarations of the offence form
 * @param {FieldIssue[]} issues - Rejections to paint
 * @param {boolean} isSaving - Mutation in flight
 * @param {boolean} canManage - Member may edit the panel
 * @param {(id: string, values: FormValues) => Promise<boolean>} onSaveOffense - Wording handler
 * @param {(id: string, levelId: string, steps: LadderStepInput[]) => Promise<boolean>} onSaveLadder - Ladder handler
 * @param {() => void} onClose - Close handler
 * @return {JSX.Element | null}
 */

export const SanctionOffenseDialog = ({
  offense,
  levelId,
  levelName,
  measures,
  fields,
  issues,
  isSaving,
  canManage,
  onSaveOffense,
  onSaveLadder,
  onClose,
}: SanctionOffenseDialogProps) => {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<FormValues>({})
  const [ladder, setLadder] = useState<LadderStepInput[]>([])

  if (!offense) return null

  const rungs = levelId ? (offense.ladders[levelId] ?? []) : []
  const tone = toTone(offense.accent, 'neutral')
  const options = measures.map((measure) => ({
    value: measure.id,
    label: measure.name,
    accent: measure.accent ?? undefined,
  }))

  const startEditing = () => {
    setValues({
      name: offense.name,
      summary: offense.summary,
      example: offense.example,
      warningExample: offense.warningExample,
      accent: offense.accent,
    })
    setLadder(toDraft(offense, levelId))
    setEditing(true)
  }

  const save = async () => {
    const saved = await onSaveOffense(offense.id, values)
    if (!saved) return

    if (levelId) await onSaveLadder(offense.id, levelId, ladder)
    setEditing(false)
  }

  const close = () => {
    setEditing(false)
    onClose()
  }

  const readingBody = (
    <>
      <section className={SANCTION_STYLES.block}>
        <p className={SANCTION_STYLES.blockLabel}>{SANCTION_COPY.descriptionTitle}</p>
        <p className="text-sm">{offense.summary}</p>
      </section>

      {offense.example && (
        <section className={SANCTION_STYLES.block}>
          <p className={SANCTION_STYLES.blockLabel}>{SANCTION_COPY.exampleTitle}</p>
          <p className={cn(SANCTION_STYLES.example, TONES.neutral.soft)}>{offense.example}</p>
        </section>
      )}

      <section className={SANCTION_STYLES.block}>
        <p className={SANCTION_STYLES.blockLabel}>{`${SANCTION_COPY.ladderTitle} · ${levelName}`}</p>
        {rungs.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-subtle)] italic">{SANCTION_COPY.noLadder}</p>
        ) : (
          <ol className={SANCTION_STYLES.ladder}>
            {rungs.map((tier) => (
              <li key={tier.id} className={cn(SANCTION_STYLES.rung, TONES.neutral.soft)}>
                <span className={SANCTION_STYLES.rungLabel}>
                  {tier.note ?? stepLabel(tier.step)}
                </span>
                <Badge
                  label={tier.measure.name}
                  tone={toTone(tier.measure.accent, 'neutral')}
                  dot
                />
              </li>
            ))}
          </ol>
        )}
      </section>

      {offense.warningExample && (
        <section className={SANCTION_STYLES.block}>
          <p className={SANCTION_STYLES.blockLabel}>{SANCTION_COPY.warningTitle}</p>
          <p className={SANCTION_STYLES.warning}>{offense.warningExample}</p>
        </section>
      )}
    </>
  )

  const editingBody = (
    <>
      <FormRenderer
        fields={fields}
        values={values}
        issues={issues}
        disabled={isSaving}
        idPrefix={`offense-${offense.id}`}
        onChange={(name, next) => setValues((current) => ({ ...current, [name]: next }))}
      />

      <section className={SANCTION_STYLES.block}>
        <p className={SANCTION_STYLES.blockLabel}>{`${SANCTION_COPY.ladderTitle} · ${levelName}`}</p>
        {ladder.map((rung, step) => (
          <div key={step} className={SANCTION_STYLES.rung}>
            <span className={SANCTION_STYLES.rungLabel}>{rung.note ?? stepLabel(step)}</span>
            <SelectMenu
              label={SANCTION_FIELD_COPY.measure}
              options={options}
              value={rung.measureId}
              mark="dot"
              onChange={(measureId) =>
                setLadder((current) =>
                  current.map((entry, index) =>
                    index === step ? { ...entry, measureId } : entry
                  )
                )
              }
            />
            <Button
              variant="ghost"
              icon="remove"
              aria-label={ACTION_COPY.delete}
              onClick={() =>
                setLadder((current) => current.filter((_, index) => index !== step))
              }
            />
          </div>
        ))}
        {ladder.length < SANCTION_SETTINGS.maxSteps && measures.length > 0 && (
          <Button
            icon="add"
            onClick={() =>
              setLadder((current) => [...current, { measureId: measures[0].id, note: null }])
            }
          >
            {SANCTION_FIELD_COPY.measure}
          </Button>
        )}
      </section>
    </>
  )

  return (
    <Dialog
      open
      onClose={close}
      title={offense.name}
      description={editing ? undefined : (offense.summary ?? undefined)}
      tone={tone}
      icon="sanctions"
      size="lg"
      footer={
        canManage ? (
          editing ? (
            <Button variant="primary" icon="confirm" disabled={isSaving} onClick={() => void save()}>
              {isSaving ? ACTION_COPY.saving : ACTION_COPY.save}
            </Button>
          ) : (
            <Button icon="edit" onClick={startEditing}>
              {SANCTION_COPY.edit}
            </Button>
          )
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">{editing ? editingBody : readingBody}</div>
    </Dialog>
  )
}
