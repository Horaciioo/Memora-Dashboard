import type { FieldDefinition, FieldKind } from '@/types/forms'

/**
 * JSON Schema node
 * @type {Record<string, unknown>}
 */

export type JsonSchema = Record<string, unknown>

// Shape per field kind
const KIND_SCHEMAS: Record<FieldKind, JsonSchema> = {
  text: { type: 'string' },
  textarea: { type: 'string' },
  markdown: { type: 'string' },
  announcement: { type: 'string' },
  number: { type: 'number' },
  date: { type: 'string', format: 'date' },
  datetime: { type: 'string', format: 'date-time' },
  daterange: { type: 'array', items: { type: 'string', format: 'date' }, maxItems: 2 },
  select: { type: 'string' },
  multiselect: { type: 'array', items: { type: 'string' } },
  toggle: { type: 'boolean' },
  tags: { type: 'array', items: { type: 'string' } },
  email: { type: 'string', format: 'email' },
  phone: { type: 'string' },
  url: { type: 'string', format: 'uri' },
  discord: { type: 'string', pattern: '^\\d{15,25}$' },
  colour: { type: 'string' },
  emoji: { type: 'string' },
  image: { type: 'string', format: 'binary' },
  scale: { type: 'number' },
}

/**
 * One field schema
 * @param {FieldDefinition} field - Declaration
 * @return {JsonSchema} - Property schema
 */

const fieldSchema = (field: FieldDefinition): JsonSchema => {
  const base: JsonSchema = { ...KIND_SCHEMAS[field.kind], title: field.label }
  const values = field.options?.map((option) => option.value)

  if (values && field.kind === 'select') base.enum = values
  if (values && field.kind === 'multiselect') base.items = { type: 'string', enum: values }
  if (field.maxLength !== undefined) base.maxLength = field.maxLength
  if (field.min !== undefined) base.minimum = field.min
  if (field.max !== undefined) base.maximum = field.max
  if (field.maxItems !== undefined) base.maxItems = field.maxItems
  if (field.hint) base.description = field.hint

  return base
}

/**
 * Body schema from fields
 * @param {FieldDefinition[]} fields - Declarations
 * @param {boolean} [partial] - Nothing required
 * @return {JsonSchema} - Object schema
 */

export const fieldsSchema = (fields: FieldDefinition[], partial?: boolean): JsonSchema => {
  const required = partial ? [] : fields.filter((field) => field.required).map((f) => f.name)

  return {
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field.name, fieldSchema(field)])),
    ...(required.length > 0 ? { required } : {}),
  }
}

/**
 * Whether a body uploads files
 * @param {FieldDefinition[]} fields - Declarations
 * @return {boolean}
 */

export const isMultipart = (fields: FieldDefinition[]): boolean =>
  fields.some((field) => field.kind === 'image')
