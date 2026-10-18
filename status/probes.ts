import { connect } from 'node:net'

import { SETTINGS } from './declarations.ts'
import type { Health, ProbeTarget } from './declarations.ts'

/**
 * Probe outcome
 * @typedef {Object} ProbeOutcome
 * @property {Health} health - Result level
 * @property {number} ms - Answer time
 */

export interface ProbeOutcome {
  health: Health
  ms: number
}

// Open a TCP socket
const probeTcp = (target: string): Promise<boolean> =>
  new Promise((resolve) => {
    const [host, port] = target.split(':')
    const socket = connect({ host, port: Number(port), timeout: SETTINGS.timeoutMs })

    socket.once('connect', () => (socket.destroy(), resolve(true)))
    socket.once('timeout', () => (socket.destroy(), resolve(false)))
    socket.once('error', () => (socket.destroy(), resolve(false)))
  })

// Fetch an URL
const probeHttp = async (target: string): Promise<boolean> => {
  const response = await fetch(target, { signal: AbortSignal.timeout(SETTINGS.timeoutMs) })

  return response.ok
}

/**
 * Check one component
 * @param {ProbeTarget} component - Component to check
 * @return {Promise<ProbeOutcome>} - Outcome
 */

export const probe = async (component: ProbeTarget): Promise<ProbeOutcome> => {
  const startedAt = Date.now()

  // Never throws, a failure is an answer
  const reachable = await (
    component.kind === 'tcp' ? probeTcp(component.target) : probeHttp(component.target)
  ).catch(() => false)

  const ms = Date.now() - startedAt
  if (!reachable) return { health: 'down', ms }

  return { health: ms > SETTINGS.slowMs ? 'degraded' : 'up', ms }
}
