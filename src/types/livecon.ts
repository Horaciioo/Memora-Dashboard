import type { WorkTag } from '@/types/work'

/**
 * Alert level of the livecon
 * @typedef {Object} LiveconLevelView
 * @property {string} id - Level identifier
 * @property {number} level - Numeric level
 * @property {string} name - Level name
 * @property {string | null} summary - Situation it covers
 * @property {string | null} guidelines - Markdown guidelines
 * @property {string | null} accent - Colour token
 * @property {number} usage - Times it was applied
 */

export interface LiveconLevelView {
  id: string
  level: number
  name: string
  summary: string | null
  guidelines: string | null
  accent: string | null
  usage: number
}

/**
 * Level currently applied to one scope
 * @typedef {Object} LiveconStateView
 * @property {string} id - Entry identifier
 * @property {WorkTag | null} youtuber - Scope, null for the whole team
 * @property {LiveconLevelView} level - Level in force
 * @property {string} startedAt - ISO start
 * @property {string | null} actorName - Who switched it
 * @property {string | null} reason - Why it switched
 */

export interface LiveconStateView {
  id: string
  youtuber: WorkTag | null
  level: LiveconLevelView
  startedAt: string
  actorName: string | null
  reason: string | null
}

/**
 * Past switch of the livecon
 * @typedef {Object} LiveconHistoryEntry
 * @property {string} id - Entry identifier
 * @property {string} scopeLabel - Scope label
 * @property {string} levelName - Level name
 * @property {number} level - Numeric level
 * @property {string | null} accent - Colour token
 * @property {string} startedAt - ISO start
 * @property {string | null} endedAt - ISO end
 * @property {string | null} actorName - Who switched it
 * @property {string | null} reason - Why it switched
 */

export interface LiveconHistoryEntry {
  id: string
  scopeLabel: string
  levelName: string
  level: number
  accent: string | null
  startedAt: string
  endedAt: string | null
  actorName: string | null
  reason: string | null
}
