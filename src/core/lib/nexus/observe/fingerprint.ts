import crypto from 'node:crypto'

// Values that change from one occurrence to the next
const VOLATILE: [RegExp, string][] = [
  [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid>'],
  [/\bc[a-z0-9]{24}\b/g, '<id>'],
  [/"[^"]*"|'[^']*'/g, '<text>'],
  [/\d+/g, '#'],
]

/**
 * Message without what varies
 * @param {string} message - Raw message
 * @return {string} - Stable message
 */

export const normalizeMessage = (message: string): string =>
  VOLATILE.reduce((text, [pattern, mark]) => text.replace(pattern, mark), message).trim()

/**
 * First frame of a stack
 * @param {string | null | undefined} stack - Stack lines
 * @return {string} - Frame or empty
 */

export const firstFrame = (stack: string | null | undefined): string =>
  (stack ?? '')
    .split('\n')
    .find((line) => line.trim().length > 0)
    ?.trim()
    // Line numbers move with every edit
    .replace(/:\d+(:\d+)?\)?$/, '') ?? ''

/**
 * Key that groups the same error
 * @param {Object} input - Error traits
 * @param {string} input.source - Where it came from
 * @param {string | null | undefined} input.route - Route
 * @param {string} input.message - Message
 * @param {string | null | undefined} input.stack - Stack
 * @return {string} - Short hash
 */

export const fingerprintOf = (input: {
  source: string
  route?: string | null
  message: string
  stack?: string | null
}): string =>
  crypto
    .createHash('sha256')
    .update(
      [
        input.source,
        input.route ?? '',
        normalizeMessage(input.message),
        firstFrame(input.stack),
      ].join('|')
    )
    .digest('hex')
    .slice(0, 32)

/**
 * Short code a member can read out
 * @param {string} requestId - Request identifier
 * @return {string} - Eight characters, upper case
 */

export const shortCode = (requestId: string): string =>
  requestId.replaceAll('-', '').slice(0, 8).toUpperCase()
