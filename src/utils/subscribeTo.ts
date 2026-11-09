/**
 * Subscribe handler over a listener set
 * @param {Set<() => void>} listeners - Listeners
 * @return {(listener: () => void) => () => void} - Subscribe
 */

export const subscribeTo =
  (listeners: Set<() => void>) =>
  (listener: () => void): (() => void) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }
