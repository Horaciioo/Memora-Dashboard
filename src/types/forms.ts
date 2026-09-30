import type { MaturityName } from '@/declarations/maturity/registries'
import type { IconName } from '@/declarations/ui/icons'
import type { PermissionName } from '@/utils/constants/permissions'
import type { StorageBucket } from '@/types/storage'

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
  | 'daterange'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'tags'
  | 'email'
  | 'phone'
  | 'url'
  | 'discord'
  | 'colour'
  | 'emoji'
  | 'image'
  | 'scale'
  | 'announcement'

/**
 * Glyph drawn beside an option, telling colour and identity apart at a glance
 * @type {string}
 */

export type OptionMark = 'dot' | 'avatar' | 'priority' | 'emoji' | 'glyph'

/**
 * Value a blank creation form starts from
 * @type {'today' | 'actor' | 'default'}
 */

export type FieldPreset = 'today' | 'actor' | 'default'

/**
 * Choice offered by a select field
 * @typedef {Object} FieldOption
 * @property {string} value - Stored value
 * @property {string} label - Display label
 * @property {string} [hint] - Secondary line
 * @property {string} [accent] - Colour token
 * @property {string} [image] - Portrait URL
 * @property {string} [emoji] - Glyph drawn before the label
 * @property {string | null} [icon] - Glyph key, drawn by the glyph mark
 * @property {string} [prefix] - Link start it hands a handle field
 * @property {string} [group] - Category heading
 * @property {boolean} [isDefault] - Preset choice
 * @property {boolean} [disabled] - Shown but not selectable
 */

export interface FieldOption {
  value: string
  label: string
  hint?: string
  accent?: string
  image?: string | null
  emoji?: string | null
  icon?: string | null
  prefix?: string
  group?: string
  isDefault?: boolean
  disabled?: boolean
}

/**
 * Link pinned above a picker's options
 * @typedef {Object} FieldAction
 * @property {string} label - Link text
 * @property {string} href - Destination
 * @property {IconName} icon - Glyph
 * @property {PermissionName} permission - Needed to see it
 */

export interface FieldAction {
  label: string
  href: string
  icon: IconName
  permission: PermissionName
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
 * Moment an existing event already holds, a date field warns when it lands inside
 * @typedef {Object} BusySlot
 * @property {string} refId - Record it belongs to, ignored while that record is edited
 * @property {string} label - Event title
 * @property {string} startsAt - ISO start
 * @property {string | null} endsAt - ISO end
 * @property {boolean} allDay - Spans the whole day
 */

export interface BusySlot {
  refId: string
  label: string
  startsAt: string
  endsAt: string | null
  allDay: boolean
}

/**
 * Single declaration driving validation and rendering
 * @typedef {Object} FieldDefinition
 * @property {string} name - Value key
 * @property {FieldKind} kind - Input shape
 * @property {string} label - Display label
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [hint] - Helper line
 * @property {string} [info] - Explanation behind the info glyph
 * @property {FieldPreset} [preset] - Blank form start value
 * @property {FieldAction} [action] - Link above the options
 * @property {boolean} [required] - Must be filled
 * @property {boolean} [readOnly] - Rendered disabled
 * @property {FieldOption[]} [options] - Choices
 * @property {number} [min] - Lowest number
 * @property {number} [max] - Highest number
 * @property {number} [step] - Number increment
 * @property {number} [maxLength] - Longest text
 * @property {number} [maxItems] - Most entries
 * @property {string} [prefix] - Static text drawn before the control, never stored
 * @property {string} [prefixFrom] - Select whose chosen option hands the prefix
 * @property {string} [lookup] - Network a typed handle is checked against
 * @property {string} [glyph] - Emoji field drawn beside this control
 * @property {'full' | 'half'} [span] - Grid width
 * @property {string} [group] - Category the field sits under
 * @property {OptionMark} [mark] - Glyph drawn beside each option
 * @property {StorageBucket} [bucket] - Destination bucket of an image field
 * @property {MaturityName} [maturity] - Lifecycle tag drawn beside the label
 * @property {boolean} [adminOnly] - Only an administrator may write it
 * @property {FieldCondition} [visibleWhen] - Display rule
 * @property {boolean} [binary] - A toggle drawn as a plain check/cross, no label
 * @property {BusySlot[]} [busy] - Events a date field warns about
 */

export interface FieldDefinition {
  name: string
  kind: FieldKind
  label: string
  placeholder?: string
  hint?: string
  info?: string
  preset?: FieldPreset
  action?: FieldAction
  required?: boolean
  readOnly?: boolean
  options?: FieldOption[]
  min?: number
  max?: number
  step?: number
  maxLength?: number
  maxItems?: number
  prefix?: string
  prefixFrom?: string
  lookup?: string
  glyph?: string
  span?: 'full' | 'half'
  group?: string
  mark?: OptionMark
  bucket?: StorageBucket
  maturity?: MaturityName
  adminOnly?: boolean
  visibleWhen?: FieldCondition
  binary?: boolean
  busy?: BusySlot[]
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
