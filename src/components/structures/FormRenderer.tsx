'use client'

import { Field } from '@/components/elements/forms/Field'
import { FieldControl } from '@/components/elements/forms/FieldControl'
import { Toggle } from '@/components/elements/forms/Toggle'
import { visibleFields } from '@/core/lib/forms'
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
    <div className="flex flex-col gap-4">
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
              <FieldControl
                id={id}
                field={field}
                value={raw}
                disabled={disabled}
                invalid={invalid}
                describedBy={describedBy}
                onChange={(next) => onChange(field.name, next)}
              />
            </Field>
          )
        })}
      </div>
    </div>
  )
}
