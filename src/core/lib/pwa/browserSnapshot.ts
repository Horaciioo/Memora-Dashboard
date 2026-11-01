// Read once, the browser never changes it under the page
const subscribeNever = (): (() => void) => () => undefined

/**
 * Arguments of useSyncExternalStore for a value only the browser knows
 * @param {() => T} read - Browser read
 * @return {[() => () => void, () => T, () => null]} - Subscribe, client and server snapshots
 */

export const browserSnapshot = <T>(read: () => T): [() => () => void, () => T, () => null] => [
  subscribeNever,
  read,
  () => null,
]
