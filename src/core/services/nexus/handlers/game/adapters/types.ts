import type { NexusGameCapability } from '@/declarations/nexus/inventory/games'

export type Row = Record<string, unknown>

/**
 * What the console can read and do on one game
 * @typedef {Object} GameAdapter
 * @property {NexusGameCapability[]} capabilities - Powers with a handler
 * @property {(sessionId: string, reveal: boolean) => Promise<Row>} state - Server side state
 * @property {(sessionId: string, skip: number, take: number) => Promise<Row[]>} turns - Moves in order
 */

export interface GameAdapter {
  capabilities: NexusGameCapability[]
  state: (sessionId: string, reveal: boolean) => Promise<Row>
  turns: (sessionId: string, skip: number, take: number) => Promise<Row[]>
}

/**
 * Powers every adapter shares
 * @type {NexusGameCapability[]}
 */

export const COMMON_CAPABILITIES: NexusGameCapability[] = ['pause', 'resume', 'kick', 'setScore']

/**
 * Drop hidden keys of rows unless asked
 * @param {Row[]} rows - Rows read
 * @param {string[]} hidden - Keys only a reveal shows
 * @param {boolean} reveal - Show them
 * @return {Row[]} - Rows to return
 */

export const strip = (rows: Row[], hidden: string[], reveal: boolean): Row[] =>
  reveal
    ? rows
    : rows.map((row) =>
        Object.fromEntries(Object.entries(row).filter(([key]) => !hidden.includes(key)))
      )
