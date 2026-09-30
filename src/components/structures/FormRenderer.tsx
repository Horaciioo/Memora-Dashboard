'use client'

import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { EmojiPicker } from '@/components/elements/forms/EmojiPicker'
import { Field } from '@/components/elements/forms/Field'
import { FieldControl } from '@/components/elements/forms/FieldControl'
import { HandleLookup } from '@/components/elements/forms/HandleLookup'
import { Toggle } from '@/components/elements/forms/Toggle'
import { busyNotice, visibleFields } from '@/core/lib/forms'
import { FIELD_STYLES, FORM_GRID, FORM_ROWS } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface FormRendererProps {
  fields: FieldDefinition[]
  values: FormValues
  issues: FieldIssue[]
  onChange: (name: string, value: FieldValue) => void
  disabled?: boolean
  idPrefix?: string
  // Settings rows, label left
  layout?: 'grid' | 'rows'
  // One field per line, e.g. in the narrow drawer
  single?: boolean
  // Record being edited, never busy against itself
  recordId?: string | null
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

  return { ...field, prefix: picked?.prefix, lookup: picked?.value }
}

/**
 * Render field declarations into controls, one control shape per field kind
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {(name: string, value: FieldValue) => void} onChange - Value handler
 * @param {boolean} [disabled] - Blocks every control
 * @param {string} [idPrefix] - Namespace of the generated identifiers
 * @param {'grid' | 'rows'} [layout] - Grid or settings rows
 * @param {boolean} [single] - One field per line
 * @param {string | null} [recordId] - Record being edited
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
}: FormRendererProps) => {
  const shown = visibleFields(fields, values)
  const errorOf = (name: string) => issues.find((issue) => issue.field === name)?.message

  // A glyph field is drawn inside the control it decorates, never on a row of its own
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
                  disabled={disabled}
                  invalid={Boolean(error)}
                  describedBy={error ? `${id}-error` : undefined}
                  onChange={(next) => onChange(field.name, next)}
                />
              )

            return (
              <div key={field.name}>
                {isBlock ? (
                  <div className={FORM_ROWS.block}>
                    {caption}
                    {control}
                  </div>
                ) : (
                  <div className={FORM_ROWS.line}>
                    {caption}
                    <div className={field.kind === 'toggle' ? undefined : FORM_ROWS.control}>
                      {control}
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
    <div className="flex flex-col gap-4">
      <div className={single ? FORM_GRID.single : FORM_GRID.split}>
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
                disabled={disabled}
                invalid={invalid}
                describedBy={describedBy}
                onChange={(next) => onChange(field.name, next)}
              />
            )

            // A toggle carries its own label, so it skips the field wrapper
            if (field.kind === 'toggle') {
              return (
                <div key={field.name} className={cn(field.span === 'half' ? '' : 'sm:col-span-2')}>
                  <Toggle
                    id={id}
                    checked={raw === true}
                    onChange={(checked) => onChange(field.name, checked)}
                    label={field.label}
                    binary={field.binary}
                    disabled={disabled || field.readOnly}
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
                  field.span === 'half' ? '' : 'sm:col-span-2',
                  glyph && FIELD_STYLES.glyphField
                )}
              >
                {glyph ? (
                  <div className={FIELD_STYLES.row}>
                    <EmojiPicker
                      id={`${idPrefix}-${glyph.name}`}
                      label={glyph.label}
                      value={typeof values[glyph.name] === 'string' ? `${values[glyph.name]}` : ''}
                      disabled={disabled || glyph.readOnly}
                      invalid={Boolean(errorOf(glyph.name))}
                      onChange={(next) => onChange(glyph.name, next)}
                    />
                    <div className={FIELD_STYLES.rowControl}>{control}</div>
                  </div>
                ) : (
                  control
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
