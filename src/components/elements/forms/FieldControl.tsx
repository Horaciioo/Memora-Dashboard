'use client'

import { DatePicker } from '@/components/elements/forms/DatePicker'
import { FileInput } from '@/components/elements/forms/FileInput'
import { Input } from '@/components/elements/forms/Input'
import { MarkdownEditor } from '@/components/elements/forms/MarkdownEditor'
import { MultiSelect } from '@/components/elements/forms/MultiSelect'
import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { TagsInput } from '@/components/elements/forms/TagsInput'
import { Textarea } from '@/components/elements/forms/Textarea'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { StorageBucket } from '@/types/storage'
import type { FieldDefinition, FieldValue } from '@/types/forms'

export interface FieldControlProps {
  id: string
  field: FieldDefinition
  value: FieldValue
  onChange: (value: FieldValue) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

// Bucket an image field lands in when its declaration stays silent
const DEFAULT_BUCKET: StorageBucket = 'files'

/**
 * Field kinds rendered by the drawn calendar
 * @type {string[]}
 */

const DATE_KINDS = ['date', 'datetime']

/**
 * Field kinds rendered by a single native input
 * @type {string[]}
 */

const SIMPLE_KINDS = ['text', 'number', 'email', 'phone', 'url', 'discord', 'colour']

/**
 * Native input type per field kind
 * @type {Record<string, string>}
 */

const INPUT_TYPES: Record<string, string> = {
  text: 'text',
  number: 'number',
  email: 'email',
  phone: 'tel',
  url: 'url',
  discord: 'text',
  colour: 'color',
}

/**
 * Control matching a field's kind, shared by the form engine and inline editors
 * @param {string} id - Identifier of the control
 * @param {FieldDefinition} field - Field declaration
 * @param {FieldValue} value - Current value
 * @param {(value: FieldValue) => void} onChange - Value handler
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {string} [describedBy] - Identifier of the message describing the control
 * @return {JSX.Element | null}
 */

export const FieldControl = ({
  id,
  field,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: FieldControlProps) => {
  if (field.kind === 'select') {
    return (
      <SelectMenu
        id={id}
        label={field.label}
        options={field.options ?? []}
        value={typeof value === 'string' ? value : ''}
        emptyLabel={ACTION_COPY.none}
        mark={field.mark}
        disabled={disabled || field.readOnly}
        invalid={invalid}
        describedBy={describedBy}
        onChange={(next) => onChange(next === '' ? null : next)}
      />
    )
  }

  if (DATE_KINDS.includes(field.kind)) {
    return (
      <DatePicker
        id={id}
        label={field.label}
        value={typeof value === 'string' ? value : ''}
        withTime={field.kind === 'datetime'}
        disabled={disabled || field.readOnly}
        invalid={invalid}
        describedBy={describedBy}
        onChange={(next) => onChange(next === '' ? null : next)}
      />
    )
  }

  if (field.kind === 'multiselect') {
    return (
      <MultiSelect
        id={id}
        options={field.options ?? []}
        value={Array.isArray(value) ? value : []}
        maxItems={field.maxItems}
        mark={field.mark}
        emptyLabel={field.placeholder ?? ACTION_COPY.none}
        onChange={onChange}
      />
    )
  }

  if (field.kind === 'tags') {
    return (
      <TagsInput
        id={id}
        value={Array.isArray(value) ? value : []}
        maxItems={field.maxItems}
        placeholder={field.placeholder}
        invalid={invalid}
        onChange={onChange}
      />
    )
  }

  if (field.kind === 'textarea') {
    return (
      <Textarea
        id={id}
        value={typeof value === 'string' ? value : ''}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        disabled={disabled || field.readOnly}
        invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  if (field.kind === 'image') {
    return (
      <FileInput
        id={id}
        value={typeof value === 'string' ? value : null}
        bucket={field.bucket ?? DEFAULT_BUCKET}
        disabled={disabled || field.readOnly}
        invalid={invalid}
        onChange={onChange}
      />
    )
  }

  if (field.kind === 'markdown') {
    return (
      <MarkdownEditor
        id={id}
        value={typeof value === 'string' ? value : ''}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        invalid={invalid}
        onChange={onChange}
      />
    )
  }

  if (!SIMPLE_KINDS.includes(field.kind)) return null

  return (
    <Input
      id={id}
      type={INPUT_TYPES[field.kind]}
      value={value === null || value === undefined ? '' : String(value)}
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
          onChange(next === '' ? null : Number(next))
          return
        }

        onChange(next === '' ? null : next)
      }}
    />
  )
}
