/**
 * Verdict on the next attempt
 * @typedef {Object} AttemptVerdict
 * @property {boolean} allowed - Attempt may proceed
 * @property {number} retryAfterSeconds - Wait before retrying
 * @property {boolean} lock - This failure must open a lockout
 */

export interface AttemptVerdict {
  allowed: boolean
  retryAfterSeconds: number
  lock: boolean
}

/**
 * Failure policy
 * @typedef {Object} AttemptPolicy
 * @property {number} maxFailures - Failures before lockout
 * @property {number[]} backoffSeconds - Waits after each failure
 */

export interface AttemptPolicy {
  maxFailures: number
  backoffSeconds: number[]
}

/**
 * Judge the next attempt from recent failures
 * @param {Date[]} failures - Failures inside the window, any order
 * @param {Date} now - Current time
 * @param {AttemptPolicy} policy - Failure policy
 * @return {AttemptVerdict} - Verdict
 */

export const judgeAttempt = (
  failures: Date[],
  now: Date,
  policy: AttemptPolicy
): AttemptVerdict => {
  if (failures.length === 0) return { allowed: true, retryAfterSeconds: 0, lock: false }

  // Wait since the last failure
  const last = Math.max(...failures.map((failure) => failure.getTime()))
  const index = Math.min(failures.length - 1, policy.backoffSeconds.length - 1)
  const wait = policy.backoffSeconds[index] ?? 0
  const remaining = Math.ceil((last + wait * 1000 - now.getTime()) / 1000)

  return {
    allowed: remaining <= 0,
    retryAfterSeconds: Math.max(remaining, 0),
    lock: failures.length + 1 >= policy.maxFailures,
  }
}
