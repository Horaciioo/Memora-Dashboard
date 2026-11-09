/**
 * What a feature is in the console
 * @type {'page' | 'subpage' | 'game' | 'system'}
 */

export type FeatureKind = 'page' | 'subpage' | 'game' | 'system'

/**
 * Console sections, in display order
 * @type {'everyday' | 'team' | 'work' | 'twitch' | 'discord' | 'training' | 'play' | 'tools' | 'administration'}
 */

export type FeatureSection =
  | 'everyday'
  | 'team'
  | 'work'
  | 'twitch'
  | 'discord'
  | 'training'
  | 'play'
  | 'tools'
  | 'administration'

/**
 * Families under one feature
 * @type {'games' | 'tables' | 'social' | 'progress'}
 */

export type FeatureGroup = 'games' | 'tables' | 'social' | 'progress'

/**
 * One thing Memora can switch off
 * @typedef {Object} FeatureDefinition
 * @property {string} key - Dotted identifier, a child extends its parent's
 * @property {string} label - Display name
 * @property {string} description - What it covers
 * @property {FeatureKind} kind - Nature
 * @property {string} [parent] - Feature it sits under, closing the parent closes it
 * @property {FeatureSection} [section] - Console section, on top-level entries only
 * @property {FeatureGroup} [group] - Family among its siblings
 * @property {string[]} [routes] - Screen path prefixes, * stands for one segment
 * @property {string[]} [api] - Endpoint path prefixes, * stands for one segment
 * @property {boolean} [locked] - Stays on so the console never locks itself out
 */

export interface FeatureDefinition {
  key: string
  label: string
  description: string
  kind: FeatureKind
  parent?: string
  section?: FeatureSection
  group?: FeatureGroup
  routes?: string[]
  api?: string[]
  locked?: boolean
}

/**
 * Switch positions
 * @type {Record<string, string>}
 */

export const FeatureModes = {
  On: 'ON',
  Admins: 'ADMINS',
  Off: 'OFF',
} as const

export type FeatureModeName = (typeof FeatureModes)[keyof typeof FeatureModes]

/**
 * Switch in force for one feature
 * @typedef {Object} FeatureState
 * @property {FeatureModeName} mode - Position
 * @property {string | null} note - Words shown to members
 */

export interface FeatureState {
  mode: FeatureModeName
  note: string | null
}
