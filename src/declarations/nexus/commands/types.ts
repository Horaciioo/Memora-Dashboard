import type { ArgSpec } from '@/core/lib/nexus/args'
import type { Environment } from '@/types/infrastructure'

/**
 * Families of commands
 * @type {readonly string[]}
 */

export const NEXUS_CATEGORIES = [
  'access',
  'memora',
  'client',
  'db',
  'configurations',
  'system',
  'game',
  'nexus',
] as const

export type NexusCategory = (typeof NEXUS_CATEGORIES)[number]

/**
 * Levels a command asks for, each armed apart
 * @type {readonly string[]}
 */

export const NEXUS_LEVELS = ['read', 'diagnostic', 'write', 'dangerous'] as const

export type NexusLevel = (typeof NEXUS_LEVELS)[number]

export type NexusRisk = 'low' | 'medium' | 'high' | 'critical'

/**
 * Shapes a reply is drawn in
 * @type {readonly string[]}
 */

export const NEXUS_OUTPUTS = [
  'table',
  'record',
  'tree',
  'diff',
  'timeline',
  'metrics',
  'text',
] as const

export type NexusOutputForm = (typeof NEXUS_OUTPUTS)[number]

/**
 * Declared command
 * @typedef {Object} NexusCommand
 * @property {string} id - Unique name
 * @property {string[]} pattern - Fixed segments and <variables>
 * @property {string} syntax - Usage shown to the owner
 * @property {string} description - One line
 * @property {NexusCategory} category - Family
 * @property {NexusLevel} level - Mode it needs
 * @property {ArgSpec[]} args - Arguments
 * @property {string} handler - Key of the server handler
 * @property {Object} limits - Timeout and rows
 * @property {'never' | 'recent' | 'always'} reauth - Password freshness needed
 * @property {NexusRisk} risk - Danger
 * @property {'none' | 'preview' | 'double'} confirm - Confirmation steps
 * @property {string} [confirmArg] - Argument retyped on a double confirmation
 * @property {NexusOutputForm} output - Reply shape
 * @property {'none' | 'summary' | 'full'} audit - Audit depth
 * @property {Environment[] | 'all'} environments - Where it may run
 * @property {boolean} [beforeUnlock] - Answerable without a console session
 */

export interface NexusCommand {
  id: string
  pattern: string[]
  syntax: string
  description: string
  category: NexusCategory
  level: NexusLevel
  args: ArgSpec[]
  handler: string
  limits: { timeoutMs?: number; maxRows?: number }
  reauth: 'never' | 'recent' | 'always'
  risk: NexusRisk
  confirm: 'none' | 'preview' | 'double'
  confirmArg?: string
  output: NexusOutputForm
  audit: 'none' | 'summary' | 'full'
  environments: Environment[] | 'all'
  beforeUnlock?: boolean
}

/**
 * Fields a declaration may leave out
 * @type {Pick<NexusCommand, 'level' | 'args' | 'limits' | 'reauth' | 'risk' | 'confirm' | 'audit' | 'environments'>}
 */

export const COMMAND_DEFAULTS: Pick<
  NexusCommand,
  'level' | 'args' | 'limits' | 'reauth' | 'risk' | 'confirm' | 'audit' | 'environments'
> = {
  level: 'read',
  args: [],
  limits: {},
  reauth: 'never',
  risk: 'low',
  confirm: 'none',
  audit: 'summary',
  environments: 'all',
}

type Required = 'id' | 'syntax' | 'description' | 'category' | 'handler' | 'output'

/**
 * Short form of a declaration
 * @type {Pick<NexusCommand, Required> & Partial<NexusCommand>}
 */

export type CommandInput = Pick<NexusCommand, Required> & Partial<Omit<NexusCommand, Required>>

/**
 * Complete a short declaration
 * @param {CommandInput} input - Short declaration
 * @return {NexusCommand} - Full command
 */

export const defineCommand = (input: CommandInput): NexusCommand => ({
  ...COMMAND_DEFAULTS,
  pattern: input.id.split('.'),
  ...input,
})
