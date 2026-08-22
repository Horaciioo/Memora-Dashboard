/**
 * Logger facade
 * @typedef {Object} LoggerFacade
 * @property {(...args: unknown[]) => void} debug - Debug channel
 * @property {(...args: unknown[]) => void} info - Info channel
 * @property {(...args: unknown[]) => void} warn - Warn channel
 * @property {(...args: unknown[]) => void} error - Error channel
 */

export interface LoggerFacade {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

// Console until LoggerManager binds
const consoleFacade: LoggerFacade = {
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}

let bound: LoggerFacade = consoleFacade

/**
 * Bind logger facade
 * @param {LoggerFacade} facade - Facade
 * @return {void}
 */

export const bindLogger = (facade: LoggerFacade): void => {
  bound = facade
}

/**
 * Restore console facade
 * @return {void}
 */

export const unbindLogger = (): void => {
  bound = consoleFacade
}

/**
 * Active logger
 * @type {LoggerFacade}
 */

export const logger: LoggerFacade = {
  debug: (...args) => bound.debug(...args),
  info: (...args) => bound.info(...args),
  warn: (...args) => bound.warn(...args),
  error: (...args) => bound.error(...args),
}
