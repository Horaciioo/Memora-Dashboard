/**
 * What a push service answer means
 * @type {'sent' | 'expired' | 'retry' | 'failed'}
 */

export type PushOutcome = 'sent' | 'expired' | 'retry' | 'failed'

// Subscription gone for good
const GONE = new Set([404, 410])

// Worth another attempt later
const TRANSIENT = new Set([408, 425, 429])

/**
 * Read a push service status code
 * @param {number | null} statusCode - Answer, null when the request never landed
 * @return {PushOutcome} - Meaning
 */

export const pushOutcomeOf = (statusCode: number | null): PushOutcome => {
  // Network failure
  if (statusCode === null) return 'retry'
  if (statusCode >= 200 && statusCode < 300) return 'sent'
  if (GONE.has(statusCode)) return 'expired'

  return TRANSIENT.has(statusCode) || statusCode >= 500 ? 'retry' : 'failed'
}
