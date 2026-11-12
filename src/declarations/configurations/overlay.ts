/**
 * What a reader accepts at one path
 * @typedef {Object} ReaderSpec
 * @property {'number' | 'integer' | 'string' | 'boolean' | 'list' | 'choice'} kind - Value kind
 * @property {number} [min] - Lowest number
 * @property {number} [max] - Highest number
 * @property {readonly string[]} [allowed] - Allowed texts
 */

export interface ReaderSpec {
  kind: 'number' | 'integer' | 'string' | 'boolean' | 'list' | 'choice'
  min?: number
  max?: number
  allowed?: readonly string[]
}

interface OverlayStore {
  values: Map<string, unknown>
  specs: Map<string, ReaderSpec>
}

// Shared by every bundle of the process
const holder = globalThis as { __configOverlay?: OverlayStore }

const store = (): OverlayStore =>
  (holder.__configOverlay ??= { values: new Map(), specs: new Map() })

/**
 * Value the owner set for a path
 * @param {string} path - Reader path
 * @return {unknown} - Value or undefined
 */

export const overlayValue = (path: string): unknown => store().values.get(path)

/**
 * Replace the loaded overlay
 * @param {[string, unknown][]} entries - Path and value pairs
 * @return {void} - Stored
 */

export const setOverlay = (entries: [string, unknown][]): void => {
  store().values = new Map(entries)
}

/**
 * Remember what a reader accepts
 * @param {string} path - Reader path
 * @param {ReaderSpec} spec - Accepted shape
 * @return {void} - Stored
 */

export const recordSpec = (path: string, spec: ReaderSpec): void => {
  store().specs.set(path, spec)
}

/**
 * Reader shape of a path
 * @param {string} path - Reader path
 * @return {ReaderSpec | undefined} - Shape when a reader ran
 */

export const specOf = (path: string): ReaderSpec | undefined => store().specs.get(path)
