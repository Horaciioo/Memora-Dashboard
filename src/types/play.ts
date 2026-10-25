import type { Prisma } from '@prisma/client'

/**
 * What an engine sees of a game
 * @typedef {Object} EngineSession
 * @property {string} id - Game
 * @property {string} hostId - Host
 * @property {Prisma.JsonValue} settings - Host choices
 * @property {string[]} players - Seated players
 */

export interface EngineSession {
  id: string
  hostId: string
  settings: Prisma.JsonValue
  players: string[]
}

/**
 * Result of one engine move
 * @typedef {Object} EngineStep
 * @property {boolean} changed - Players must refresh
 * @property {boolean} finished - Game over
 * @property {Date | null} deadline - Next timed move
 */

export interface EngineStep {
  changed: boolean
  finished: boolean
  deadline: Date | null
}

/**
 * Rules of one game
 * @typedef {Object} PlayEngine
 */

export interface PlayEngine {
  defaults: () => Prisma.InputJsonObject
  readSettings: (raw: Record<string, unknown>, current: Prisma.JsonValue) => Prisma.InputJsonObject
  start: (session: EngineSession) => Promise<EngineStep>
  act: (
    session: EngineSession,
    accountId: string,
    raw: Record<string, unknown>
  ) => Promise<EngineStep>
  settle: (session: EngineSession) => Promise<EngineStep>
  view: (session: EngineSession, viewerId: string) => Promise<unknown>
  extraStats: (sessionId: string) => Promise<Map<string, Record<string, number>>>
}
