'use client'

import type { ReactNode } from 'react'

import { Tip } from '@/components/elements/feedback/Tip'
import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { EmojiPicker } from '@/components/elements/forms/pickers/EmojiPicker'
import { Field } from '@/components/elements/forms/Field'
import { FieldControl } from '@/components/elements/forms/FieldControl'
import { HandleLookup } from '@/components/elements/forms/HandleLookup'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { toWallText } from '@/core/lib/forms/values'
import { busyNotice, holds, isLockedOn, narrowOptions, visibleFields } from '@/core/lib/forms'
import { FIELD_STYLES, FORM_GRID, FORM_ROWS } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'

/**
 * Earliest moment a date field accepts: the field it can never precede, as a wall clock
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @return {string | undefined} - Wall clock, none without a bound
 */

const minOf = (field: FieldDefinition, values: FormValues): string | undefined => {
  const bound = field.notBefore ? values[field.notBefore] : null

  return typeof bound === 'string' && bound !== '' ? toWallText(bound) : undefined
}

/**
 * Tell whether the flag a date field depends on drops its hour
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @param {FieldDefinition[]} shown - Visible fields
 * @return {boolean} - Flag on
 */

const locked = (field: FieldDefinition, values: FormValues, shown: FieldDefinition[]): boolean =>
  Boolean(field.hoursOffWhen) &&
  values[field.hoursOffWhen as string] === true &&
  // A hidden flag never locks
  shown.some((candidate) => candidate.name === field.hoursOffWhen)

/**
 * Reason a field is greyed: it waits for another one, or a rule froze it
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @return {string | null} - Explanation shown on hover, none while the field is free
 */

const blockedBy = (field: FieldDefinition, values: FormValues): string | null => {
  if (field.needs) {
    const needed = values[field.needs.field]
    if (needed === null || needed === undefined || needed === '' || needed === false) {
      return field.needs.hint
    }
  }

  return field.frozen?.find((rule) => holds(rule.when, values))?.hint ?? null
}

/**
 * Wrap a greyed control in the bubble telling why
 * @param {ReactNode} control - Control drawn
 * @param {FieldDefinition} field - Field declaration
 * @param {FormValues} values - Current values
 * @return {ReactNode} - Control, with its bubble while it is greyed
 */

const gated = (control: ReactNode, field: FieldDefinition, values: FormValues): ReactNode => {
  const reason = blockedBy(field, values)

  return reason ? (
    <Tip label={reason} floating className="w-full">
      {control}
    </Tip>
  ) : (
    control
  )
}

export interface FormRendererProps {
  fields: FieldDefinition[]
  values: FormValues
  issues: FieldIssue[]
  onChange: (name: string, value: FieldValue) => void
  disabled?: boolean
  idPrefix?: string
  // Settings rows
  layout?: 'grid' | 'rows'
  // One field per line
  single?: boolean
  // Record being edited
  recordId?: string | null
  // Last field takes the height left
  fill?: boolean
}

// Kinds kept whole in rows
const BLOCK_KINDS = [
  'textarea',
  'markdown',
  'announcement',
  'multiselect',
  'tags',
  'image',
  'daterange',
  'scale',
]

/**
 * Field with the prefix and network its chosen option hands down
 * @param {FieldDefinition} field - Field declaration
 * @param {Map<string, FieldDefinition>} byName - Visible fields
 * @param {FormValues} values - Current values
 * @return {FieldDefinition} - Resolved field
 */

const resolvePrefix = (
  field: FieldDefinition,
  byName: Map<string, FieldDefinition>,
  values: FormValues
): FieldDefinition => {
  if (!field.prefixFrom) return field

  const source = byName.get(field.prefixFrom)
  const picked = source?.options?.find((option) => option.value === values[field.prefixFrom!])

  return { ...field, prefix: picked?.prefix, lookup: field.noLookup ? undefined : picked?.value }
}

/**
 * Columns a field takes
 * @param {FieldDefinition} field - Field declaration
 * @param {boolean} [single] - One field per line
 * @return {string} - Span class
 */

const spanOf = (field: FieldDefinition, single?: boolean): string =>
  single || field.span === 'half' ? '' : 'sm:col-span-2'

/**
 * Render field declarations into controls
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {(name: string, value: FieldValue) => void} onChange - Value handler
 * @param {boolean} [disabled] - Blocks every control
 * @param {string} [idPrefix] - Namespace of the generated identifiers
 * @param {'grid' | 'rows'} [layout] - Grid or settings rows
 * @param {boolean} [single] - One field per line
 * @param {string | null} [recordId] - Record being edited
 * @param {boolean} [fill] - Last field takes the height left
 * @return {JSX.Element}
 */

export const FormRenderer = ({
  fields,
  values,
  issues,
  onChange,
  disabled,
  idPrefix = 'field',
  layout = 'grid',
  single,
  recordId,
  fill,
}: FormRendererProps) => {
  const shown = visibleFields(fields, values).map((field) => narrowOptions(field, values))
  const errorOf = (name: string) => issues.find((issue) => issue.field === name)?.message

  // A glyph field is drawn inside the control it decorates
  const attached = new Set(shown.map((field) => field.glyph).filter(Boolean))
  const byName = new Map(shown.map((field) => [field.name, field]))

  // Settings rows
  if (layout === 'rows') {
    return (
      <div className={FORM_ROWS.list}>
        {shown
          .filter((field) => !attached.has(field.name))
          .map((field) => {
            const id = `${idPrefix}-${field.name}`
            const error = errorOf(field.name)
            const raw = values[field.name]
            const isBlock = BLOCK_KINDS.includes(field.kind)
            const caption = (
              <span className={FIELD_STYLES.labelRow}>
                <label htmlFor={id} className={FORM_ROWS.label}>
                  {field.label}
                  {field.required && <span className={FIELD_STYLES.required}> *</span>}
                </label>
                {field.info && <InfoHint text={field.info} align="start" />}
              </span>
            )
            const control =
              field.kind === 'toggle' ? (
                <Toggle
                  id={id}
                  bare
                  checked={raw === true}
                  onChange={(checked) => onChange(field.name, checked)}
                  label={field.label}
                  binary={field.binary}
                  disabled={disabled || field.readOnly}
                />
              ) : (
                <FieldControl
                  id={id}
                  field={field}
                  value={raw}
                  disabled={disabled || blockedBy(field, values) !== null}
                  invalid={Boolean(error)}
                  describedBy={error ? `${id}-error` : undefined}
                  min={minOf(field, values)}
                  hoursLocked={locked(field, values, shown)}
                  onChange={(next) => onChange(field.name, next)}
                />
              )

            return (
              <div key={field.name}>
                {isBlock ? (
                  <div className={FORM_ROWS.block}>
                    {caption}
                    {gated(control, field, values)}
                  </div>
                ) : (
                  <div className={FORM_ROWS.line}>
                    {caption}
                    <div className={field.kind === 'toggle' ? undefined : FORM_ROWS.control}>
                      {gated(control, field, values)}
                    </div>
                  </div>
                )}
                {error && (
                  <p id={`${id}-error`} className={FORM_ROWS.error}>
                    {error}
                  </p>
                )}
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', fill && 'flex-1')}>
      <div className={fill ? FORM_GRID.fill : single ? FORM_GRID.single : FORM_GRID.split}>
        {shown
          .filter((field) => !attached.has(field.name))
          .map((declared) => {
            const field = resolvePrefix(declared, byName, values)
            const id = `${idPrefix}-${field.name}`
            const error = errorOf(field.name)
            const raw = values[field.name]
            const invalid = Boolean(error)
            const describedBy = error ? `${id}-error` : field.hint ? `${id}-hint` : undefined
            const glyph = field.glyph ? byName.get(field.glyph) : undefined

            const control = (
              <FieldControl
                id={id}
                field={field}
                value={raw}
                disabled={disabled || blockedBy(field, values) !== null}
                invalid={invalid}
                describedBy={describedBy}
                min={minOf(field, values)}
                hoursLocked={locked(field, values, shown)}
                onChange={(next) => onChange(field.name, next)}
              />
            )

            // A toggle carries its own label
            if (field.kind === 'toggle') {
              return (
                <div key={field.name} className={cn(spanOf(field, single))}>
                  <Toggle
                    id={id}
                    checked={raw === true}
                    onChange={(checked) => onChange(field.name, checked)}
                    label={field.label}
                    binary={field.binary}
                    disabled={disabled || field.readOnly || isLockedOn(field, values)}
                  />
                </div>
              )
            }

            return (
              <Field
                key={field.name}
                id={id}
                label={field.label}
                hint={field.hint}
                info={field.info}
                error={error}
                notice={busyNotice(raw, field.kind, field.busy, recordId)}
                required={field.required}
                maturity={field.maturity}
                className={cn(
                  spanOf(field, single),
                  fill && field.kind === 'announcement' && 'flex-1'
                )}
              >
                {glyph ? (
                  <div className={FIELD_STYLES.glyphInside}>
                    {gated(control, field, values)}
                    <div className={FIELD_STYLES.glyphSeat}>
                      <EmojiPicker
                        id={`${idPrefix}-${glyph.name}`}
                        label={glyph.label}
                        value={
                          typeof values[glyph.name] === 'string' ? `${values[glyph.name]}` : ''
                        }
                        disabled={disabled || glyph.readOnly}
                        invalid={Boolean(errorOf(glyph.name))}
                        onChange={(next) => onChange(glyph.name, next)}
                      />
                    </div>
                  </div>
                ) : (
                  gated(control, field, values)
                )}
                {field.lookup && typeof raw === 'string' && (
                  <HandleLookup
                    network={field.lookup}
                    handle={raw}
                    onPick={(picked) => onChange(field.name, picked)}
                  />
                )}
              </Field>
            )
          })}
      </div>
    </div>
  )
}
