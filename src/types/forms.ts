/**
 * Value a form field can hold
 * @type {string | number | boolean | string[] | null}
 */

export type FieldValue = string | number | boolean | string[] | null

/**
 * Input shapes the form engine renders and validates
 * @type {string}
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'markdown'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'tags'
  | 'email'
  | 'phone'
  | 'url'
  | 'discord'
  | 'colour'

/**
 * Choice offered by a select field
 * @typedef {Object} FieldOption
 * @property {string} value - Stored value
 * @property {string} label - Display label
 * @property {string} [hint] - Secondary line
 * @property {string} [accent] - Colour token
 */

export interface FieldOption {
  value: string
  label: string
  hint?: string
  accent?: string
}

/**
 * Rule deciding whether a field shows
 * @typedef {Object} FieldCondition
 * @property {string} field - Watched field name
 * @property {FieldValue} [equals] - Exact match
 * @property {string[]} [oneOf] - Match any
 * @property {boolean} [truthy] - Match on filled
 */

export interface FieldCondition {
  field: string
  equals?: FieldValue
  oneOf?: string[]
  truthy?: boolean
}

/**
 * Single declaration driving validation and rendering
 * @typedef {Object} FieldDefinition
 * @property {string} name - Value key
 * @property {FieldKind} kind - Input shape
 * @property {string} label - Display label
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [hint] - Helper line
 * @property {boolean} [required] - Must be filled
 * @property {boolean} [readOnly] - Rendered disabled
 * @property {FieldOption[]} [options] - Choices
 * @property {number} [min] - Lowest number
 * @property {number} [max] - Highest number
 * @property {number} [step] - Number increment
 * @property {number} [maxLength] - Longest text
 * @property {number} [maxItems] - Most entries
 * @property {'full' | 'half'} [span] - Grid width
 * @property {FieldCondition} [visibleWhen] - Display rule
 */

export interface FieldDefinition {
  name: string
  kind: FieldKind
  label: string
  placeholder?: string
  hint?: string
  required?: boolean
  readOnly?: boolean
  options?: FieldOption[]
  min?: number
  max?: number
  step?: number
  maxLength?: number
  maxItems?: number
  span?: 'full' | 'half'
  visibleWhen?: FieldCondition
}

/**
 * Values keyed by field name
 * @type {Record<string, FieldValue>}
 */

export type FormValues = Record<string, FieldValue>

/**
 * Rejection attached to one field
 * @typedef {Object} FieldIssue
 * @property {string} field - Field name
 * @property {string} message - Display message
 */

export interface FieldIssue {
  field: string
  message: string
}

/**
 * Outcome of parsing raw values
 * @typedef {Object} ParseResult
 * @property {FormValues} values - Normalised values
 * @property {FieldIssue[]} issues - Rejections
 * @property {boolean} ok - No rejection
 */

export interface ParseResult {
  values: FormValues
  issues: FieldIssue[]
  ok: boolean
}

/**
 * Knobs of parseFormValues
 * @typedef {Object} ParseOptions
 * @property {boolean} [enforceRequired] - Reject empty required fields
 * @property {boolean} [fillMissing] - Add absent fields as null
 */

export interface ParseOptions {
  enforceRequired?: boolean
  fillMissing?: boolean
}
