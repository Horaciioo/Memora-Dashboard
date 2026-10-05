import { EventEmitter } from 'node:events'

import { logger } from '@/core/lib/logger'

/**
 * One signal carried between instances
 * @typedef {Object} LiveEnvelope
 * @property {string} topic - Where it is heard
 * @property {unknown} payload - What it says
 */

export interface LiveEnvelope {
  topic: string
  payload: unknown
}

/**
 * Cross-instance carrier
 * @typedef {Object} LiveTransport
 * @property {(envelope: LiveEnvelope) => Promise<void>} publish - Send to every instance
 */

export interface LiveTransport {
  publish: (envelope: LiveEnvelope) => Promise<void>
}

// Survives dev hot reloads
const globalForBus = globalThis as unknown as {
  liveBus?: { local: EventEmitter; transport: LiveTransport | null }
}

const bus = (globalForBus.liveBus ??= {
  local: new EventEmitter().setMaxListeners(0),
  transport: null,
})

/**
 * Carry signals through Redis from now on
 * @param {LiveTransport} transport - Cross-instance carrier
 * @return {void}
 */

export const bindLiveTransport = (transport: LiveTransport): void => {
  bus.transport = transport
}

/**
 * Hand a received signal to this instance's listeners
 * @param {LiveEnvelope} envelope - Received signal
 * @return {void}
 */

export const deliverLive = (envelope: LiveEnvelope): void => {
  bus.local.emit(envelope.topic, envelope.payload)
}

/**
 * Send a signal to every listener of every instance
 * @param {string} topic - Where it is heard
 * @param {unknown} payload - What it says
 * @return {Promise<void>} - Sent
 */

export const publishLive = async (topic: string, payload: unknown): Promise<void> => {
  const envelope = { topic, payload }

  // Without Redis this process is the only listener
  if (!bus.transport) {
    deliverLive(envelope)
    return
  }

  try {
    await bus.transport.publish(envelope)
  } catch (error) {
    // A lost signal never fails the write that raised it
    logger.warn('[lives] signal not carried, delivered locally only', error)
    deliverLive(envelope)
  }
}

/**
 * Listen to one topic
 * @param {string} topic - Where to listen
 * @param {(payload: unknown) => void} listener - Called per signal
 * @return {() => void} - Stops listening
 */

export const subscribeLive = (topic: string, listener: (payload: unknown) => void) => {
  bus.local.on(topic, listener)

  return () => {
    bus.local.off(topic, listener)
  }
}
