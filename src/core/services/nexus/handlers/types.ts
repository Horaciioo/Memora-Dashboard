import type { ArgValue } from '@/core/lib/nexus/args'
import type { HostSession, NexusCaller } from '@/core/services/nexus/NexusSessionService'
import type { NexusSession, Prisma } from '@prisma/client'

/**
 * What a handler receives
 * @typedef {Object} HandlerContext
 * @property {Record<string, ArgValue>} args - Validated arguments
 * @property {Record<string, string>} params - Variable path segments
 * @property {NexusSession | null} nexus - Console session, null before unlock
 * @property {string} accountId - Owner
 * @property {HostSession} host - Sign-in session
 * @property {NexusCaller} caller - Who is calling
 * @property {string} requestId - Request identifier
 * @property {AbortSignal} signal - Raised on timeout
 * @property {Prisma.TransactionClient | null} tx - Transaction of a change
 * @property {boolean} dryRun - Describe without acting
 */

export interface HandlerContext {
  args: Record<string, ArgValue>
  params: Record<string, string>
  nexus: NexusSession | null
  accountId: string
  host: HostSession
  caller: NexusCaller
  requestId: string
  signal: AbortSignal
  tx: Prisma.TransactionClient | null
  dryRun: boolean
}

/**
 * What a handler returns
 * @typedef {Object} HandlerResult
 * @property {unknown} output - Value drawn in the declared form
 * @property {'info' | 'warning' | 'error' | 'success'} [level] - Tone
 * @property {unknown} [data] - Structured companion
 * @property {{ page: number, total: number }} [pagination] - Page position
 * @property {string} [target] - Entity and identifier aimed at
 * @property {unknown} [before] - Value before a change
 * @property {unknown} [after] - Value after a change
 * @property {boolean} [reversible] - Can be undone
 */

export interface HandlerResult {
  output: unknown
  level?: 'info' | 'warning' | 'error' | 'success'
  data?: unknown
  pagination?: { page: number; total: number }
  target?: string
  before?: unknown
  after?: unknown
  reversible?: boolean
}

export type NexusHandler = (context: HandlerContext) => Promise<HandlerResult>
