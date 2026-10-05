/**
 * Timed lifetimes for ephemeral UI
 * @type {Record<string, number>}
 */

export const MOTION_TIMERS = {
  hintLifetimeMs: 2400,
  autoDismissMs: 5000,
  // Quick answers never flash the bar
  loadingBarDelayMs: 250,
} as const
