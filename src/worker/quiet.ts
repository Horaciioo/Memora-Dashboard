import { QUIET_PUSH_AGENTS } from '@/declarations/pwa/worker'

/**
 * Whether a push may skip its system notice, the open page showing it already
 * @param {boolean} isFocused - A Memora window has the focus
 * @param {string} userAgent - Worker user agent
 * @return {boolean} - Notice can stay hidden
 */

export const staysQuiet = (isFocused: boolean, userAgent: string): boolean =>
  // Safari and Firefox revoke or throttle subscriptions that push without a notice
  isFocused && QUIET_PUSH_AGENTS.test(userAgent)
