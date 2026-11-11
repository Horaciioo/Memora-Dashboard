import 'server-only'

import { prisma } from '@/core/lib/db'
import { rateLimited } from '@/core/lib/errors'
import { consume } from '@/core/lib/http/rateLimit'
import { NEXUS_ARG_CONTEXT } from '@/core/lib/nexus/context'
import { buildCommandRegistry } from '@/core/lib/nexus/registry'
import { recordAudit } from '@/core/services/nexus/NexusAuditService'
import { dispatchCommand } from '@/core/services/nexus/NexusDispatcher'
import type { DispatchDeps, DispatchRequest } from '@/core/services/nexus/NexusDispatcher'
import { NEXUS_HANDLERS } from '@/core/services/nexus/handlers'
import { NEXUS_COMMAND_LIST } from '@/declarations/nexus/commands'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'

/**
 * Commands loaded once, a broken declaration stops here
 * @type {CommandRegistry}
 */

export const NEXUS_REGISTRY = buildCommandRegistry(
  NEXUS_COMMAND_LIST,
  Object.keys(NEXUS_HANDLERS),
  { entity: NEXUS_ARG_CONTEXT.hasEntity }
)

// Real dependencies of the pipeline
const DEPS: DispatchDeps = {
  registry: NEXUS_REGISTRY,
  handlers: NEXUS_HANDLERS,
  argContext: NEXUS_ARG_CONTEXT,
  audit: recordAudit,
  transact: (run) => prisma.$transaction(run),
  environment: APP_ENVIRONMENT,
  limitWrites: async (accountId) => {
    const verdict = await consume('nexusWrite', accountId)
    if (!verdict.allowed) throw rateLimited(verdict.retryAfterSeconds)
  },
}

/**
 * Run one console command
 * @param {DispatchRequest} request - Command to run
 * @return {Promise<NexusResult>} - Reply
 */

export const runNexusCommand = (request: DispatchRequest) => dispatchCommand(DEPS, request)
