import 'server-only'

import { validateArgs } from '@/core/lib/nexus/args'
import type { ArgContext, ArgValue } from '@/core/lib/nexus/args'
import {
  canonicalInput,
  issueConfirmToken,
  readConfirmArgument,
  spendConfirmToken,
} from '@/core/lib/nexus/confirm'
import { parseCommand } from '@/core/lib/nexus/parse'
import { redactInput, redactRecord } from '@/core/lib/nexus/redact'
import type { CommandRegistry } from '@/core/lib/nexus/registry'
import {
  AppError,
  conflict,
  forbidden,
  invalidInput,
  locked,
  notAuthenticated,
  notFound,
} from '@/core/lib/errors'
import type { AuditEntry } from '@/core/services/nexus/NexusAuditService'
import type { HostSession, NexusCaller } from '@/core/services/nexus/NexusSessionService'
import type {
  HandlerContext,
  HandlerResult,
  NexusHandler,
} from '@/core/services/nexus/handlers/types'
import type { NexusCommand, NexusOutputForm } from '@/declarations/nexus/commands/types'
import { NEXUS_COPY } from '@/declarations/nexus/copy'
import { NEXUS_COMMANDS, NEXUS_SESSION } from '@/declarations/nexus/settings'
import type { Environment } from '@/types/infrastructure'
import { ErrorCodes } from '@/utils/constants/errors'
import type { NexusSession, Prisma } from '@prisma/client'

/**
 * Everything the pipeline leans on, swappable in tests
 * @typedef {Object} DispatchDeps
 * @property {CommandRegistry} registry - Loaded commands
 * @property {Record<string, NexusHandler>} handlers - Handlers by key
 * @property {ArgContext} argContext - Entity lookups
 * @property {(entry: AuditEntry, tx?: Prisma.TransactionClient) => Promise<void>} audit - Audit writer
 * @property {(run: (tx: Prisma.TransactionClient) => Promise<unknown>) => Promise<unknown>} transact - Transaction runner
 * @property {Environment} environment - Running environment
 * @property {() => Promise<void>} limitWrites - Spends a change allowance
 */

export interface DispatchDeps {
  registry: CommandRegistry
  handlers: Record<string, NexusHandler>
  argContext: ArgContext
  audit: (entry: AuditEntry, tx?: Prisma.TransactionClient) => Promise<void>
  transact: <T>(run: (tx: Prisma.TransactionClient) => Promise<T>) => Promise<T>
  environment: Environment
  limitWrites: (accountId: string) => Promise<void>
}

/**
 * One command to run
 * @typedef {Object} DispatchRequest
 * @property {string} input - Typed text
 * @property {string} [confirmToken] - Token of a previous preview
 * @property {string} accountId - Owner
 * @property {NexusSession | null} nexus - Console session, null before unlock
 * @property {HostSession} host - Sign-in session
 * @property {NexusCaller} caller - Who is calling
 * @property {string} requestId - Request identifier
 */

export interface DispatchRequest {
  input: string
  confirmToken?: string
  accountId: string
  nexus: NexusSession | null
  host: HostSession
  caller: NexusCaller
  requestId: string
}

/**
 * Reply of a command
 * @typedef {Object} NexusResult
 * @property {'ok' | 'previewed'} status - Executed or only described
 * @property {string} level - Tone
 * @property {{ form: NexusOutputForm, value: unknown }} output - Drawn reply
 * @property {unknown} data - Structured companion
 * @property {{ page: number, total: number }} [pagination] - Page position
 * @property {string} [confirmToken] - Token to confirm a preview
 * @property {number} durationMs - Time taken
 * @property {string} requestId - Request identifier
 */

export interface NexusResult {
  status: 'ok' | 'previewed'
  level: string
  output: { form: NexusOutputForm; value: unknown }
  data: unknown
  pagination?: { page: number; total: number }
  confirmToken?: string
  durationMs: number
  requestId: string
}

// Steps in the order they run, the refused one lands in the audit
type Step =
  'syntax' | 'resolution' | 'arguments' | 'permission' | 'reauthentication' | 'risk' | 'execution'

// What the pipeline learned so far
interface Progress {
  step: Step
  command: NexusCommand | null
  target?: string
}

// One command at a time per console session
const busy = new Set<string>()

/**
 * Parse the text and find its command
 * @param {DispatchDeps} deps - Pipeline dependencies
 * @param {DispatchRequest} request - Command to run
 * @param {Progress} progress - Step tracker
 * @return {{ command: NexusCommand, params: Record<string, string>, values: Record<string, ArgValue> }} - Ready to run
 */

const prepare = (deps: DispatchDeps, request: DispatchRequest, progress: Progress) => {
  // Syntax
  const parsed = parseCommand(canonicalInput(request.input), NEXUS_COMMANDS)
  if (!parsed.ok) throw invalidInput([{ field: 'input', message: parsed.error.message }])

  // Resolution, a locked console only ever answers its one command
  progress.step = 'resolution'
  const resolved = deps.registry.resolve(parsed.value.path)
  if (!request.nexus && !resolved?.command.beforeUnlock) throw notAuthenticated(NEXUS_COPY.locked)
  if (!resolved) throw notFound(NEXUS_COPY.unknownCommand)
  progress.command = resolved.command

  // Arguments, the confirmation one is read apart
  progress.step = 'arguments'
  const checked = validateArgs(resolved.command.args, parsed.value.args, deps.argContext)
  if (!checked.ok) {
    throw invalidInput(
      Object.entries(checked.errors).map(([field, message]) => ({ field, message }))
    )
  }

  return { command: resolved.command, params: resolved.params, values: checked.values }
}

/**
 * Check modes, password freshness and environment
 * @param {DispatchDeps} deps - Pipeline dependencies
 * @param {NexusCommand} command - Command to run
 * @param {NexusSession | null} nexus - Console session
 * @param {Progress} progress - Step tracker
 * @return {void} - Throws on the first refusal
 */

const assertAllowed = (
  deps: DispatchDeps,
  command: NexusCommand,
  nexus: NexusSession | null,
  progress: Progress
): void => {
  if (!nexus) return

  const now = Date.now()

  // Armed modes
  progress.step = 'permission'
  if (command.level === 'write' && !(nexus.writeUntil && nexus.writeUntil.getTime() > now)) {
    throw locked(NEXUS_COPY.writeOff)
  }
  if (command.level === 'dangerous' && !(nexus.dangerUntil && nexus.dangerUntil.getTime() > now)) {
    throw locked(NEXUS_COPY.dangerOff)
  }

  // Password freshness, a dangerous command never settles for less than recent
  progress.step = 'reauthentication'
  const policy =
    command.level === 'dangerous' && command.reauth === 'never' ? 'recent' : command.reauth
  const window =
    policy === 'always' ? NEXUS_SESSION.reauthAlwaysSeconds : NEXUS_SESSION.dangerReauthSeconds
  if (policy !== 'never' && now - nexus.reauthAt.getTime() > window * 1000) {
    throw notAuthenticated(NEXUS_COPY.reauthNeeded)
  }

  // Where it may run
  progress.step = 'risk'
  if (command.environments !== 'all' && !command.environments.includes(deps.environment)) {
    throw forbidden(NEXUS_COPY.forbiddenEnvironment)
  }
}

/**
 * Turn a handler answer into the reply
 * @param {NexusCommand} command - Command that ran
 * @param {HandlerResult} result - Handler answer
 * @param {number} startedAt - Start time in ms
 * @param {string} requestId - Request identifier
 * @return {NexusResult} - Redacted reply
 */

const toResult = (
  command: NexusCommand,
  result: HandlerResult,
  startedAt: number,
  requestId: string
): NexusResult => {
  const safe = redactRecord({ output: result.output, data: result.data ?? null })

  return {
    status: 'ok',
    level: result.level ?? 'success',
    output: { form: command.output, value: safe.output },
    data: safe.data,
    pagination: result.pagination,
    durationMs: Date.now() - startedAt,
    requestId,
  }
}

/**
 * Run a handler against the clock
 * @param {NexusHandler} handler - Handler to run
 * @param {HandlerContext} context - Handler context, its signal is replaced
 * @param {number} timeoutMs - Longest run
 * @return {Promise<HandlerResult>} - Handler answer
 */

const runWithTimeout = async (
  handler: NexusHandler,
  context: Omit<HandlerContext, 'signal'>,
  timeoutMs: number
): Promise<HandlerResult> => {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined

  const clock = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new AppError(ErrorCodes.TimedOut, NEXUS_COPY.timedOut))
    }, timeoutMs)
  })

  try {
    return await Promise.race([handler({ ...context, signal: controller.signal }), clock])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Build the audit line of a command
 * @param {DispatchRequest} request - Command that ran
 * @param {Progress} progress - Step tracker
 * @param {Partial<AuditEntry>} outcome - Status and details
 * @param {number} startedAt - Start time in ms
 * @return {AuditEntry} - Line to write
 */

const auditLine = (
  request: DispatchRequest,
  progress: Progress,
  outcome: Pick<AuditEntry, 'status'> & Partial<AuditEntry>,
  startedAt: number
): AuditEntry => ({
  nexusSessionId: request.nexus?.id ?? null,
  accountId: request.accountId,
  commandId: progress.command?.id ?? null,
  input: redactInput(request.input),
  level: progress.command?.level ?? null,
  requestId: request.requestId,
  durationMs: Date.now() - startedAt,
  address: request.caller.address,
  target: progress.target,
  ...outcome,
})

/**
 * Details a command's audit depth keeps
 * @param {NexusCommand} command - Command that ran
 * @param {HandlerResult} result - Handler answer
 * @return {Partial<AuditEntry>} - Details to keep
 */

const auditDetails = (command: NexusCommand, result: HandlerResult): Partial<AuditEntry> => {
  const full = command.audit === 'full'

  return {
    target: result.target,
    reversible: full ? result.reversible : undefined,
    before: full && result.before ? redactRecord({ value: result.before }).value : undefined,
    after: full && result.after ? redactRecord({ value: result.after }).value : undefined,
  }
}

/**
 * Execute a command, a change shares its transaction with its audit line
 * @param {DispatchDeps} deps - Pipeline dependencies
 * @param {DispatchRequest} request - Command to run
 * @param {Progress} progress - Step tracker
 * @param {Omit<HandlerContext, 'signal' | 'tx' | 'dryRun'>} base - Handler context
 * @param {number} startedAt - Start time in ms
 * @return {Promise<HandlerResult>} - Handler answer
 */

const execute = async (
  deps: DispatchDeps,
  request: DispatchRequest,
  progress: Progress,
  base: Omit<HandlerContext, 'signal' | 'tx' | 'dryRun'>,
  startedAt: number
): Promise<HandlerResult> => {
  const command = progress.command as NexusCommand
  const handler = deps.handlers[command.handler]
  const timeoutMs = command.limits.timeoutMs ?? NEXUS_COMMANDS.timeoutMs

  if (command.level !== 'write' && command.level !== 'dangerous') {
    return runWithTimeout(handler, { ...base, tx: null, dryRun: false }, timeoutMs)
  }

  await deps.limitWrites(request.accountId)

  return deps.transact(async (tx) => {
    // Each statement is bounded too
    await tx.$executeRaw`SELECT set_config('statement_timeout', ${String(timeoutMs)}, true)`

    // A timeout throws here and rolls the whole change back
    const result = await runWithTimeout(handler, { ...base, tx, dryRun: false }, timeoutMs)

    // Trace and effect stand or fall together
    await deps.audit(
      auditLine(request, progress, { status: 'OK', ...auditDetails(command, result) }, startedAt),
      tx
    )

    return result
  })
}

/**
 * Describe a change without making it and hand out the token to confirm
 * @param {DispatchDeps} deps - Pipeline dependencies
 * @param {DispatchRequest} request - Command to run
 * @param {Progress} progress - Step tracker
 * @param {Omit<HandlerContext, 'signal' | 'tx' | 'dryRun'>} base - Handler context
 * @param {number} startedAt - Start time in ms
 * @return {Promise<NexusResult>} - Preview reply
 */

const preview = async (
  deps: DispatchDeps,
  request: DispatchRequest,
  progress: Progress,
  base: Omit<HandlerContext, 'signal' | 'tx' | 'dryRun'>,
  startedAt: number
): Promise<NexusResult> => {
  const command = progress.command as NexusCommand
  const timeoutMs = command.limits.timeoutMs ?? NEXUS_COMMANDS.timeoutMs
  const described = await runWithTimeout(
    deps.handlers[command.handler],
    { ...base, tx: null, dryRun: true },
    timeoutMs
  )

  await deps.audit(
    auditLine(
      request,
      progress,
      { status: 'PREVIEWED', ...auditDetails(command, described) },
      startedAt
    )
  )

  return {
    ...toResult(command, described, startedAt, request.requestId),
    status: 'previewed',
    confirmToken: issueConfirmToken(
      request.nexus?.tokenHash ?? '',
      request.input,
      Date.now(),
      NEXUS_COMMANDS.confirmSeconds
    ),
  }
}

/**
 * Check the confirmation that follows a preview
 * @param {NexusCommand} command - Command to run
 * @param {DispatchRequest} request - Command to run
 * @param {Record<string, ArgValue>} values - Validated arguments
 * @return {void} - Throws when refused
 */

const assertConfirmed = (
  command: NexusCommand,
  request: DispatchRequest,
  values: Record<string, ArgValue>
): void => {
  const secret = request.nexus?.tokenHash ?? ''
  if (
    !request.confirmToken ||
    !spendConfirmToken(secret, request.input, request.confirmToken, Date.now())
  ) {
    throw conflict(NEXUS_COPY.confirmNeeded)
  }

  // A double confirmation retypes the aimed identifier
  if (command.confirm === 'double') {
    const typed = readConfirmArgument(request.input)
    if (typed === null || typed !== String(values[command.confirmArg ?? ''])) {
      throw conflict(NEXUS_COPY.confirmWrong)
    }
  }
}

/**
 * Run the whole pipeline for one command
 * @param {DispatchDeps} deps - Pipeline dependencies
 * @param {DispatchRequest} request - Command to run
 * @return {Promise<NexusResult>} - Reply, errors are thrown with their status
 */

export const dispatchCommand = async (
  deps: DispatchDeps,
  request: DispatchRequest
): Promise<NexusResult> => {
  const startedAt = Date.now()
  const progress: Progress = { step: 'syntax', command: null }
  const sessionId = request.nexus?.id

  // One command at a time per console session
  if (sessionId && busy.has(sessionId)) throw conflict(NEXUS_COPY.busy)
  if (sessionId) busy.add(sessionId)

  try {
    const { command, params, values } = prepare(deps, request, progress)
    assertAllowed(deps, command, request.nexus, progress)

    const base = {
      args: values,
      params,
      nexus: request.nexus,
      accountId: request.accountId,
      host: request.host,
      caller: request.caller,
      requestId: request.requestId,
    }

    // Confirmation, first pass only describes
    progress.step = 'risk'
    if (command.confirm !== 'none') {
      if (!request.confirmToken) return await preview(deps, request, progress, base, startedAt)
      assertConfirmed(command, request, values)
    }

    progress.step = 'execution'
    const result = await execute(deps, request, progress, base, startedAt)
    progress.target = result.target

    // A change was traced inside its transaction already
    const traced = command.level === 'write' || command.level === 'dangerous'
    if (!traced && command.audit !== 'none') {
      await deps
        .audit(
          auditLine(
            request,
            progress,
            { status: 'OK', ...auditDetails(command, result) },
            startedAt
          )
        )
        .catch(() => undefined)
    }

    return toResult(command, result, startedAt, request.requestId)
  } catch (error) {
    // Every refusal and failure leaves a line
    const status = progress.step === 'execution' ? 'FAILED' : 'REFUSED'
    await deps
      .audit(auditLine(request, progress, { status, refusal: progress.step }, startedAt))
      .catch(() => undefined)
    throw error
  } finally {
    if (sessionId) busy.delete(sessionId)
  }
}
