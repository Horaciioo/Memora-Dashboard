/**
 * Who keeps the platform connections
 * @type {Record<string, string>}
 */

export const LIVE_WORKER_MODES = {
  // Inside the web process, one instance only
  inline: 'inline',
  off: 'off',
} as const

export type LiveWorkerMode = (typeof LIVE_WORKER_MODES)[keyof typeof LIVE_WORKER_MODES]

/**
 * Mode read from the environment, inline by default
 * @return {LiveWorkerMode} - Mode
 */

export const liveWorkerMode = (): LiveWorkerMode =>
  process.env.LIVE_WORKER?.trim() === LIVE_WORKER_MODES.off
    ? LIVE_WORKER_MODES.off
    : LIVE_WORKER_MODES.inline
