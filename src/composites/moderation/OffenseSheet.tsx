'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { Input } from '@/components/elements/forms/Input'
import { MultiSelect } from '@/components/elements/forms/MultiSelect'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { Drawer } from '@/components/structures/Drawer'
import { InlineArea } from '@/components/structures/InlineArea'
import { InlineMarkdown } from '@/components/structures/InlineMarkdown'
import { InlineText } from '@/components/structures/InlineText'
import { useActionMenu } from '@/core/hooks/interaction/useActionMenu'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { toOptions } from '@/core/lib/forms/options'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import {
  SANCTION_GRAVITY_REGISTRY,
  SANCTION_PANEL_REGISTRY,
} from '@/declarations/sanctions/registries'
import { accentPaint, accentVars } from '@/declarations/ui/theme'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { FormValues } from '@/types/forms'
import type { LiveconLevelView } from '@/types/livecon'
import type {
  SanctionMeasureView,
  SanctionOffenseDetail,
  SanctionRungInput,
  SanctionRungView,
} from '@/types/sanctions'
import type { SanctionGravityName } from '@/utils/constants/moderation'
import { SanctionGravities } from '@/utils/constants/moderation'
import { cn } from '@/utils/classnames'
import { fillCommand, writeDuration } from '@/utils/format/sanctions'

export interface OffenseSheetProps {
  offense: SanctionOffenseDetail
  level: LiveconLevelView
  measures: SanctionMeasureView[]
  canManage: boolean
  isSaving: boolean
  onSaveOffense: (id: string, values: FormValues) => Promise<boolean>
  onSaveLadder: (
    id: string,
    levelId: string,
    gravity: SanctionGravityName,
    steps: SanctionRungInput[]
  ) => Promise<boolean>
  onClose: () => void
}

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
    const tool = surface.commands[measure.kind]
    if (!tool) return []

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
 * The ladder of one level as a staircase
 * @param {Object} props - Steps and their offence
 * @return {JSX.Element}
 */

const LadderView = ({
  rungs,
  offense,
}: {
  rungs: SanctionRungView[]
  offense: SanctionOffenseDetail
}) => {
  if (rungs.length === 0) return <p className={OFFENSE_SHEET.how}>{SANCTION_COPY.noLadder}</p>

  return (
    <ol className={OFFENSE_SHEET.ladder}>
      {rungs.map((rung, index) => (
        <li key={rung.id} className={OFFENSE_SHEET.rung}>
          {index < rungs.length - 1 && (
            <span className={OFFENSE_SHEET.rungRail} aria-hidden="true" />
          )}
          <span className={OFFENSE_SHEET.rungDot} aria-hidden="true">
            {index + 1}
          </span>
          <div className={OFFENSE_SHEET.rungBody}>
            <span className={OFFENSE_SHEET.rungCondition}>{rung.condition}</span>
            <span className={OFFENSE_SHEET.measures}>
              {rung.measures.map((measure) => (
                <span
                  key={measure.id}
                  className={cn(OFFENSE_SHEET.measure, accentPaint(measure.accent).soft)}
                  style={accentPaint(measure.accent).style}
                >
                  {measure.name}
                </span>
              ))}
            </span>
            <RungCommands rung={rung} offense={offense} />
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Ladder editor of one level: gravity
 * @param {Object} props - Starting ladder and handlers
 * @return {JSX.Element}
 */

const LadderEditor = ({
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

/**
 * One offence opened in full: what it covers, the ladder of
 * the livecon in force with each command ready to paste, and the warning to send. A manager
 * rewrites any of it by clicking it, nothing carries an edit button
 * @param {OffenseSheetProps} props - Offence
 * @return {JSX.Element}
 */

export const OffenseSheet = ({
  offense,
  level,
  measures,
  canManage,
  isSaving,
  onSaveOffense,
  onSaveLadder,
  onClose,
}: OffenseSheetProps) => {
  const [editingLadder, setEditingLadder] = useState(false)
  const copy = useCopy(SANCTION_COPY.copied)
  const gravity = offense.gravities[level.id] ?? SanctionGravities.Low
  const tone = SANCTION_GRAVITY_REGISTRY.get(gravity)
  const rungs = offense.ladders[level.id] ?? []

  const asInputs = (from: SanctionRungView[]): SanctionRungInput[] =>
    from.map((rung) => ({
      condition: rung.condition,
      measureIds: rung.measures.map((measure) => measure.id),
    }))

  const saveField = (name: string) => (value: string) =>
    onSaveOffense(offense.id, { [name]: value })

  // Gravity picked from the label
  const gravityMenu = useActionMenu(
    canManage
      ? SANCTION_GRAVITY_REGISTRY.keys
          .filter((key) => key !== gravity)
          .map((key) => ({
            id: key,
            label: SANCTION_GRAVITY_REGISTRY.label(key),
            onSelect: () => void onSaveLadder(offense.id, level.id, key, asInputs(rungs)),
          }))
      : [],
    SANCTION_COPY.changeGravity
  )

  const ladderMenu = useActionMenu(
    canManage
      ? [
          {
            id: 'ladder',
            label: SANCTION_COPY.ladderEmpty,
            icon: 'edit',
            onSelect: () => setEditingLadder(true),
          },
        ]
      : []
  )

  const gravityLabel = (
    <>
      <span
        className={cn(OFFENSE_SHEET.gravityLabel, canManage && OFFENSE_SHEET.gravityLabelLive)}
        style={accentVars(tone.accent)}
      >
        {tone.label}
      </span>
      <span>{level.name}</span>
    </>
  )

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        <InlineText
          id="offense-name"
          value={offense.name}
          disabled={!canManage}
          maxLength={FORM_SETTINGS.titleMaxLength}
          onCommit={saveField('name')}
        />
      }
      icon="sanctions"
      subheader={
        canManage ? (
          <button type="button" className={OFFENSE_SHEET.gravity} {...gravityMenu}>
            {gravityLabel}
          </button>
        ) : (
          <span className={OFFENSE_SHEET.gravity}>{gravityLabel}</span>
        )
      }
    >
      <div className={OFFENSE_SHEET.body}>
        {(offense.summary || canManage) && (
          <div className={OFFENSE_SHEET.block}>
            <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.descriptionTitle}</span>
            {canManage ? (
              <InlineMarkdown
                id="offense-summary"
                value={offense.summary ?? ''}
                placeholder={SANCTION_COPY.descriptionEmpty}
                maxLength={FORM_SETTINGS.markdownMaxLength}
                onCommit={saveField('summary')}
              />
            ) : (
              <Markdown source={offense.summary ?? ''} />
            )}
          </div>
        )}

        <div className={OFFENSE_SHEET.block}>
          <span className={OFFENSE_SHEET.label}>
            {SANCTION_COPY.ladderTitle.replace('{level}', level.name)}
          </span>
          {editingLadder ? (
            <LadderEditor
              initial={rungs}
              gravity={gravity}
              measures={measures}
              isSaving={isSaving}
              onCancel={() => setEditingLadder(false)}
              onSave={async (nextGravity, steps) => {
                const done = await onSaveLadder(offense.id, level.id, nextGravity, steps)
                if (done) setEditingLadder(false)
              }}
            />
          ) : canManage ? (
            <div
              role="button"
              tabIndex={0}
              className={OFFENSE_SHEET.ladderLive}
              onClick={() => setEditingLadder(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setEditingLadder(true)
              }}
              onContextMenu={ladderMenu.onContextMenu}
            >
              {rungs.length === 0 ? (
                <span className={OFFENSE_SHEET.placeholder}>{SANCTION_COPY.ladderEmpty}</span>
              ) : (
                <LadderView rungs={rungs} offense={offense} />
              )}
            </div>
          ) : (
            <LadderView rungs={rungs} offense={offense} />
          )}
        </div>

        {(offense.warningExample || canManage) && (
          <div className={OFFENSE_SHEET.block}>
            <span className={OFFENSE_SHEET.label}>{SANCTION_COPY.warningTitle}</span>
            <div className={OFFENSE_SHEET.warning}>
              <InlineArea
                id="offense-warning"
                value={offense.warningExample ?? ''}
                placeholder={SANCTION_COPY.warningEmpty}
                disabled={!canManage}
                maxLength={FORM_SETTINGS.longTextMaxLength}
                className="min-w-0 flex-1"
                onCommit={saveField('warningExample')}
              />
              {offense.warningExample && (
                <Button
                  variant="icon"
                  icon="copy"
                  aria-label={SANCTION_COPY.copy}
                  onClick={() => void copy(offense.warningExample!)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
