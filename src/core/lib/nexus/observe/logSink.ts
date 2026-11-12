import 'server-only'

import { readRequestId } from '@/core/lib/http/requestOrigin'
import { redactInput } from '@/core/lib/nexus/redact'
import { OBSERVABILITY } from '@/core/lib/nexus/observe/registry'
import { keepInfo } from '@/core/lib/nexus/observe/ring'
import { NEXUS_OBSERVABILITY } from '@/declarations/nexus/observability'

// Info lines seen this minute
let minuteStart = 0
let infoSeen = 0

// Printable text of log arguments
const textOf = (args: unknown[]): string =>
  args
    .map((arg) =>
      arg instanceof Error
        ? arg.message.split('\n')[0]
        : typeof arg === 'string'
          ? arg
          : JSON.stringify(arg)
    )
    .join(' ')
    .slice(0, 500)

/**
 * Keep a log line in the console buffer, info lines sampled
 * @param {string} level - Level
 * @param {unknown[]} args - Log arguments
 * @return {void}
 */

export const sinkLog = (level: string, args: unknown[]): void => {
  if (level === 'info') {
    const now = Date.now()
    if (now - minuteStart >= 60_000) {
      minuteStart = now
      infoSeen = 0
    }
    infoSeen += 1
    if (
      !keepInfo(
        infoSeen,
        NEXUS_OBSERVABILITY.infoPerMinute,
        NEXUS_OBSERVABILITY.infoSampleRate,
        Math.random()
      )
    ) {
      return
    }
  }

  OBSERVABILITY.logs.push({
    at: Date.now(),
    level,
    // Typed secrets never reach the buffer
    text: redactInput(textOf(args)),
    requestId: readRequestId(),
  })
}
