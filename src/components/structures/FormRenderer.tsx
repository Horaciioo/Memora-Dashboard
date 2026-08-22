'use client'

import { Field } from '@/components/elements/forms/Field'
import { Input } from '@/components/elements/forms/Input'
import { MarkdownEditor } from '@/components/elements/forms/MarkdownEditor'
import { MultiSelect } from '@/components/elements/forms/MultiSelect'
import { Select } from '@/components/elements/forms/Select'
import { TagsInput } from '@/components/elements/forms/TagsInput'
import { Textarea } from '@/components/elements/forms/Textarea'
import { Toggle } from '@/components/elements/forms/Toggle'
import { visibleFields } from '@/core/lib/forms'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface FormRendererProps {
  fields: FieldDefinition[]
  values: FormValues
  issues: FieldIssue[]
  onChange: (name: string, value: FieldValue) => void
  disabled?: boolean
  idPrefix?: string
}

/**
 * Render field declarations into controls, one control shape per field kind
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} values - Current values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {(name: string, value: FieldValue) => void} onChange - Value handler
 * @param {boolean} [disabled] - Blocks every control
 * @param {string} [idPrefix] - Namespace of the generated identifiers
 * @return {JSX.Element}
 */

export const FormRenderer = ({
  fields,
  values,
  issues,
  onChange,
  disabled,
  idPrefix = 'field',
}: FormRendererProps) => {
  const shown = visibleFields(fields, values)
  const errorOf = (name: string) => issues.find((issue) => issue.field === name)?.message

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {shown.map((field) => {
        const id = `${idPrefix}-${field.name}`
        const error = errorOf(field.name)
        const raw = values[field.name]
        const invalid = Boolean(error)
        const describedBy = error ? `${id}-error` : field.hint ? `${id}-hint` : undefined

        // A toggle carries its own label, so it skips the field wrapper
        if (field.kind === 'toggle') {
          return (
            <div key={field.name} className={cn(field.span === 'half' ? '' : 'sm:col-span-2')}>
              <Toggle
                id={id}
                checked={raw === true}
                onChange={(checked) => onChange(field.name, checked)}
                label={field.label}
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
            error={error}
            required={field.required}
            className={field.span === 'half' ? '' : 'sm:col-span-2'}
          >
            {field.kind === 'select' && (
              <Select
                id={id}
                value={typeof raw === 'string' ? raw : ''}
                disabled={disabled || field.readOnly}
                aria-describedby={describedBy}
                onChange={(event) =>
                  onChange(field.name, event.target.value === '' ? null : event.target.value)
                }
              >
                <option value="">{ACTION_COPY.none}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}

            {field.kind === 'multiselect' && (
              <MultiSelect
                id={id}
                options={field.options ?? []}
                value={Array.isArray(raw) ? raw : []}
                maxItems={field.maxItems}
                emptyLabel={field.placeholder ?? ACTION_COPY.none}
                onChange={(next) => onChange(field.name, next)}
              />
            )}

            {field.kind === 'tags' && (
              <TagsInput
                id={id}
                value={Array.isArray(raw) ? raw : []}
                maxItems={field.maxItems}
                placeholder={field.placeholder}
                invalid={invalid}
                onChange={(next) => onChange(field.name, next)}
              />
            )}

            {field.kind === 'textarea' && (
              <Textarea
                id={id}
                value={typeof raw === 'string' ? raw : ''}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                disabled={disabled || field.readOnly}
                invalid={invalid}
                aria-describedby={describedBy}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}

            {field.kind === 'markdown' && (
              <MarkdownEditor
                id={id}
                value={typeof raw === 'string' ? raw : ''}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                invalid={invalid}
                onChange={(next) => onChange(field.name, next)}
              />
            )}

            {SIMPLE_KINDS.includes(field.kind) && (
              <Input
                id={id}
                type={INPUT_TYPES[field.kind]}
                value={raw === null || raw === undefined ? '' : String(raw)}
                min={field.min}
                max={field.max}
                step={field.step}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                disabled={disabled || field.readOnly}
                invalid={invalid}
                aria-describedby={describedBy}
                onChange={(event) => {
                  const next = event.target.value

                  // Numbers land as numbers so the parser never re-reads a string
                  if (field.kind === 'number') {
                    onChange(field.name, next === '' ? null : Number(next))
                    return
                  }

                  onChange(field.name, next === '' ? null : next)
                }}
              />
            )}
          </Field>
        )
      })}
    </div>
  )
}

/**
 * Field kinds rendered by a single native input
 * @type {string[]}
 */

const SIMPLE_KINDS = [
  'text',
  'number',
  'date',
  'datetime',
  'email',
  'phone',
  'url',
  'discord',
  'colour',
]

/**
 * Native input type per field kind
 * @type {Record<string, string>}
 */

const INPUT_TYPES: Record<string, string> = {
  text: 'text',
  number: 'number',
  date: 'date',
  datetime: 'datetime-local',
  email: 'email',
  phone: 'tel',
  url: 'url',
  discord: 'text',
  colour: 'color',
}
