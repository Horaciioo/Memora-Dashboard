import { NEXUS_PATHS } from '@/declarations/nexus/paths'

// Distinct errors sent per page load
const SENT_MAX = 10

// Wait that lets a burst travel together
const BATCH_DELAY_MS = 2000

const seen = new Set<string>()
let queue: { message: string; stack: string; path: string }[] = []
let timer: ReturnType<typeof setTimeout> | undefined

// One call, never retried
const flush = (): void => {
  timer = undefined
  const errors = queue
  queue = []
  if (errors.length === 0) return

  void fetch(NEXUS_PATHS.clientErrors, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ errors }),
    keepalive: true,
  }).catch(() => undefined)
}

// Queue a report once
const report = (message: string, stack: string): void => {
  const key = `${message}|${stack.split('\n')[0]}`
  if (seen.has(key) || seen.size >= SENT_MAX) return
  seen.add(key)

  // Pathname only, a query may carry a name
  queue.push({ message, stack, path: window.location.pathname })
  timer ??= setTimeout(flush, BATCH_DELAY_MS)
}

/**
 * Catch script errors and unhandled rejections, no form content
 * @return {void}
 */

export const captureClientErrors = (): void => {
  window.addEventListener('error', (event) => {
    report(
      event.message || 'Script error',
      event.error instanceof Error ? (event.error.stack ?? '') : ''
    )
  })
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as unknown
    report(
      reason instanceof Error ? reason.message : 'Unhandled rejection',
      reason instanceof Error ? (reason.stack ?? '') : ''
    )
  })
}
