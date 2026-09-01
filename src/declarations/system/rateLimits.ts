import { createRegistry } from '@/core/lib/registry'
import { readRateLimitWindow } from '@/declarations/configurations/settings'

/**
 * What a policy counts against
 * @type {Record<string, string>}
 */

export const RATE_LIMIT_SCOPES = {
  Address: 'address',
  Account: 'account',
} as const

export type RateLimitScope = (typeof RATE_LIMIT_SCOPES)[keyof typeof RATE_LIMIT_SCOPES]

/**
 * One rate limit policy
 * @typedef {Object} RateLimitPolicy
 * @property {string} label - Display name
 * @property {RateLimitScope} scope - Counted identity
 * @property {number} windowSeconds - Window length
 * @property {number} max - Attempts allowed
 */

export interface RateLimitPolicy {
  label: string
  scope: RateLimitScope
  windowSeconds: number
  max: number
}

/**
 * Build one policy from its declared default
 * @param {string} name - Policy name
 * @param {string} label - Display name
 * @param {RateLimitScope} scope - Counted identity
 * @param {number} windowSeconds - Default window
 * @param {number} max - Default attempts
 * @return {RateLimitPolicy} - Bounded policy
 */

const policy = (
  name: string,
  label: string,
  scope: RateLimitScope,
  windowSeconds: number,
  max: number
): RateLimitPolicy => ({ label, scope, ...readRateLimitWindow(name, { windowSeconds, max }) })

const RATE_LIMIT_MAP = {
  signIn: policy('signIn', 'Sign in', RATE_LIMIT_SCOPES.Address, 300, 10),
  admission: policy('admission', 'Admission', RATE_LIMIT_SCOPES.Address, 3600, 5),
  mutation: policy('mutation', 'Write', RATE_LIMIT_SCOPES.Account, 60, 60),
  read: policy('read', 'Read', RATE_LIMIT_SCOPES.Account, 60, 300),
  upload: policy('upload', 'Upload', RATE_LIMIT_SCOPES.Account, 3600, 40),
  search: policy('search', 'Search', RATE_LIMIT_SCOPES.Account, 60, 120),
  export: policy('export', 'Export', RATE_LIMIT_SCOPES.Account, 86400, 5),
  twoFactor: policy('twoFactor', 'Second factor', RATE_LIMIT_SCOPES.Account, 300, 10),
} satisfies Record<string, RateLimitPolicy>

/**
 * Rate limit policies
 * @type {Registry<RateLimitName, RateLimitPolicy>}
 */

export const RATE_LIMIT_REGISTRY = createRegistry<keyof typeof RATE_LIMIT_MAP, RateLimitPolicy>(
  RATE_LIMIT_MAP
)

export type RateLimitName = keyof typeof RATE_LIMIT_MAP

/**
 * Policy applied to a method when a route declares none
 * @type {Record<string, RateLimitName>}
 */

export const DEFAULT_METHOD_POLICIES: Record<string, RateLimitName> = {
  GET: 'read',
  HEAD: 'read',
  POST: 'mutation',
  PUT: 'mutation',
  PATCH: 'mutation',
  DELETE: 'mutation',
}
