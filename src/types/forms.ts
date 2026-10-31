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
  | 'time'
  | 'daterange'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'tags'
  | 'url'
  | 'discord'
  | 'colour'
  | 'emoji'
  | 'image'
  | 'scale'
  | 'announcement'

/**
 * Glyph drawn beside an option
 * @type {string}
 */

export type OptionMark =
  'dot' | 'avatar' | 'priority' | 'emoji' | 'glyph' | 'network' | 'division' | 'role' | 'flag'

/**
 * Value a blank creation form starts from
 * @type {'today' | 'nextWeek' | 'actor' | 'default'}
 */

export type FieldPreset = 'today' | 'nextWeek' | 'actor' | 'default' | 'sole'

/**
 * Choice offered by a select field
 * @typedef {Object} FieldOption
 * @property {string} value - Stored value
 * @property {string} label - Display label
 * @property {string} [hint] - Secondary line
 * @property {string} [accent] - Colour token
 * @property {string} [image] - Portrait URL
 * @property {string | null} [banner] - Wide banner URL
 * @property {string} [emoji] - Glyph drawn before the label
 * @property {string} [flag] - Country code of the flag it wears
 * @property {string | null} [icon] - Glyph key
 * @property {string} [prefix] - Link start it hands a handle field
 * @property {string} [group] - Category heading
 * @property {boolean} [isDefault] - Preset choice
 * @property {boolean} [disabled] - Shown but not selectable
 * @property {string} [owner] - Value of the owner field it belongs to
 * @property {string[]} [owners] - Several owner values it belongs to
 * @property {OptionDates} [dates] - Days the option stands for, filled into the date fields once picked
 * @property {Record<string, string>} [sets] - Values other fields take once the option is picked
 * @property {string} [alsoOwner] - Value of the second owner field it belongs to
 * @property {OptionSlot} [slot] - Moment the option proposes for the date fields
 */

export interface FieldOption {
  value: string
  label: string
  hint?: string
  accent?: string
  image?: string | null
  banner?: string | null
  emoji?: string | null
  flag?: string
  icon?: string | null
  prefix?: string
  group?: string
  // A line is drawn under it
  hasDividerAfter?: boolean
  isDefault?: boolean
  disabled?: boolean
  owner?: string
  owners?: string[]
  slot?: OptionSlot
  alsoOwner?: string
  dates?: OptionDates
  sets?: Record<string, string>
}

/**
 * Days an option stands for
 * @typedef {Object} OptionDates
 * @property {string} startsAt - ISO first moment
 * @property {string | null} endsAt - ISO last moment
 */

export interface OptionDates {
  startsAt: string
  endsAt: string | null
}

/**
 * Moment an option proposes once picked
 * @typedef {Object} OptionSlot
 * @property {number} weekday - Day it falls on, 1 for Monday
 * @property {string} time - Wall clock it starts at
 * @property {number | null} minutes - Length proposed
 */

export interface OptionSlot {
  weekday: number
  time: string
  minutes: number | null
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
 * @property {boolean} [negate] - Invert the match
 * @property {FieldCondition} [and] - Second rule that must hold too
 */

export interface FieldCondition {
  field: string
  equals?: FieldValue
  oneOf?: string[]
  truthy?: boolean
  negate?: boolean
  and?: FieldCondition
}

/**
 * Delay a date field keeps from another one
 * @typedef {Object} FollowRule
 * @property {string} field - Date field followed
 * @property {number} minutes - Delay after it
 * @property {FieldCondition} [when] - Rule only holds while this does
 */

export interface FollowRule {
  field: string
  minutes: number
  when?: FieldCondition
}

/**
 * Moment an existing event already holds
 * @typedef {Object} BusySlot
 * @property {string} refId - Record it belongs to
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
 * Rule greying a field
 * @typedef {Object} FrozenRule
 * @property {FieldCondition} when - Rule under which the field is greyed
 * @property {string} hint - Explanation shown on hover
 */

export interface FrozenRule {
  when: FieldCondition
  hint: string
}

/**
 * Value a field takes from the pair of fields it follows
 * @typedef {Object} ValueFrom
 * @property {[string, string]} fields - Names of the two fields read
 * @property {Record<string, string | string[]>} map - Value by `first|second`
 * @property {boolean} [onlyIfEmpty] - Never replaces a value already there
 */

export interface ValueFrom {
  fields: [string, string]
  map: Record<string, string | string[]>
  onlyIfEmpty?: boolean
}

/**
 * Field that must be filled before another one opens
 * @typedef {Object} FieldNeed
 * @property {string} field - Name of the field
 * @property {string} hint - Explanation shown on the greyed field
 */

export interface FieldNeed {
  field: string
  hint: string
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
 * @property {string | boolean} [initial] - Fixed start value of a blank form
 * @property {FieldAction} [action] - Link above the options
 * @property {boolean} [required] - Must be filled
 * @property {boolean} [readOnly] - Rendered disabled
 * @property {FieldOption[]} [options] - Choices
 * @property {number} [min] - Lowest number
 * @property {number} [max] - Highest number
 * @property {number} [step] - Number increment
 * @property {number} [maxLength] - Longest text
 * @property {number} [maxItems] - Most entries
 * @property {string} [prefix] - Static text drawn before the control
 * @property {string} [prefixFrom] - Select whose chosen option hands the prefix
 * @property {string} [lookup] - Network a typed handle is checked against
 * @property {boolean} [noLookup] - Handle never probed on a network
 * @property {string} [glyph] - Emoji field drawn beside this control
 * @property {'full' | 'half'} [span] - Grid width
 * @property {string} [group] - Category the field sits under
 * @property {OptionMark} [mark] - Glyph drawn beside each option
 * @property {StorageBucket} [bucket] - Destination bucket of an image field
 * @property {MaturityName} [maturity] - Lifecycle tag drawn beside the label
 * @property {boolean} [adminOnly] - Only an administrator may write it
 * @property {FieldCondition} [visibleWhen] - Display rule
 * @property {string} [notBefore] - Name of a date field this one can never precede
 * @property {FrozenRule[]} [frozen] - Rules under which the field is greyed with an explanation, it keeps the value it was handed
 * @property {ValueFrom | ValueFrom[]} [valueFrom] - Value the field takes from two others, one rule per pair
 * @property {FieldNeed} [needs] - Another field that must be filled first, this one is greyed and explains why until then
 * @property {string} [slotFor] - Date field an option's slot fills, its end follows after the option's length
 * @property {FieldCondition} [lockedOnWhen] - Toggle forced on and frozen while this rule holds
 * @property {string} [hoursOffWhen] - Toggle that, once on, drops the hour of this date field
 * @property {FollowRule} [follows] - Date field this one trails by a delay until edited
 * @property {string} [ownerField] - Field whose picks narrow the owned options
 * @property {boolean} [withTime] - A date or day range starts with the hour of each end, the picker can drop it
 * @property {boolean} [dayOnly] - The picker never offers an hour
 * @property {[string, string]} [defaultTimes] - Hours a timed range starts and ends on
 * @property {string} [alsoOwnedBy] - Second field whose pick narrows the owned options too
 * @property {Record<string, string[]>} [defaultPicks] - Options picked once an owner is chosen, by owner value
 * @property {boolean} [excludeOwned] - Options belonging to the picked owners are left out instead of kept
 * @property {boolean} [defaultFromOwner] - Every reachable option is picked once the owner changes
 * @property {boolean} [binary] - A toggle drawn as a plain check/cross
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
  initial?: string | boolean
  action?: FieldAction
  required?: boolean
  readOnly?: boolean
  options?: FieldOption[]
  min?: number
  max?: number
  step?: number
  maxLength?: number
  maxItems?: number
  // Year a date picker opens on while empty
  startYear?: number
  prefix?: string
  prefixFrom?: string
  lookup?: string
  noLookup?: boolean
  glyph?: string
  span?: 'full' | 'half'
  group?: string
  mark?: OptionMark
  bucket?: StorageBucket
  maturity?: MaturityName
  adminOnly?: boolean
  visibleWhen?: FieldCondition
  notBefore?: string
  frozen?: FrozenRule[]
  valueFrom?: ValueFrom | ValueFrom[]
  needs?: FieldNeed
  slotFor?: string
  lockedOnWhen?: FieldCondition
  hoursOffWhen?: string
  follows?: FollowRule
  ownerField?: string
  alsoOwnedBy?: string
  defaultPicks?: Record<string, string[]>
  excludeOwned?: boolean
  defaultFromOwner?: boolean
  withTime?: boolean
  dayOnly?: boolean
  defaultTimes?: [string, string]
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
