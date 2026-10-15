import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { SETTINGS } from './declarations.ts'
import { emptyState } from './history.ts'
import type { StatusState } from './history.ts'

/**
 * Load the saved state
 * @return {StatusState} - Saved or empty
 */

export const loadState = (): StatusState => {
  try {
    return JSON.parse(readFileSync(SETTINGS.dataFile, 'utf8')) as StatusState
  } catch {
    return emptyState()
  }
}

/**
 * Save the state
 * @param {StatusState} state - State to keep
 * @return {void}
 */

export const saveState = (state: StatusState): void => {
  // Write then rename, never half a file
  mkdirSync(dirname(SETTINGS.dataFile), { recursive: true })
  const temporary = `${SETTINGS.dataFile}.tmp`
  writeFileSync(temporary, JSON.stringify(state))
  renameSync(temporary, SETTINGS.dataFile)
}
