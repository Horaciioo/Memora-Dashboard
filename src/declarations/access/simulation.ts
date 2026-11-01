/**
 * Methods a simulated view may send
 * @type {string[]}
 */

export const SIMULATION_SAFE_METHODS: string[] = ['GET', 'HEAD', 'OPTIONS']

/**
 * Routes a simulated view may still write
 * @type {string[]}
 */

export const SIMULATION_OPEN_PATHS: string[] = [
  '/api/parametres',
  '/api/notifications',
  // Reads a sentence, writes nothing
  '/api/assistant',
]
