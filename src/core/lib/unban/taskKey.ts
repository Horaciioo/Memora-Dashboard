// Prefix of every home task a request opens
const TASK_PREFIX = 'unban'

/**
 * Key of the task a request opens, a reopening starts a new cycle
 * @param {string} requestId - Request
 * @param {number} cycle - Reopening counter
 * @return {string} - Stable key
 */

export const unbanTaskKey = (requestId: string, cycle: number): string =>
  `${TASK_PREFIX}:${requestId}:${cycle}`

/**
 * Part of a system key shared by every task of a request, whatever the cycle or the owner
 * @param {string} requestId - Request
 * @return {string} - Fragment to look for
 */

export const unbanTaskFragment = (requestId: string): string => `:${TASK_PREFIX}:${requestId}:`
