import { ENVIRONMENTS } from '@/types/infrastructure'
import type { Environment, EnvironmentManifest } from '@/types/infrastructure'

/**
 * Resolve running environment
 * @return {Environment} - Environment key
 */

const resolveEnvironment = (): Environment => {
  const fallback: Environment = process.env.NODE_ENV === 'development' ? 'dev' : 'main'
  const raw = process.env.APP_ENV?.trim()

  if (!raw) return fallback

  // Reject unknown branch names
  if (!(ENVIRONMENTS as readonly string[]).includes(raw)) {
    console.warn(
      `[config] APP_ENV is not a known environment (got ${raw}), falling back to ${fallback}`
    )

    return fallback
  }

  return raw as Environment
}

/**
 * Running environment
 * @type {Environment}
 */

export const APP_ENVIRONMENT = resolveEnvironment()

/**
 * Whether the first visit welcomes every account once
 * @type {boolean}
 */

export const WELCOMES_EVERY_ACCOUNT = APP_ENVIRONMENT === 'dev' || APP_ENVIRONMENT === 'staging'

/**
 * Environment manifests
 * @type {Record<Environment, EnvironmentManifest>}
 */

export const ENVIRONMENT_MANIFESTS: Record<Environment, EnvironmentManifest> = {
  dev: { label: 'development', required: [], strict: false, plainSecrets: true },
  staging: { label: 'staging', required: ['encryption'], strict: false, plainSecrets: false },
  release: { label: 'release', required: ['encryption'], strict: true, plainSecrets: false },
  main: { label: 'production', required: ['encryption'], strict: true, plainSecrets: false },
}

/**
 * Whether a secret may land in the database unencrypted
 * @return {boolean} - Clear storage tolerated
 */

export const arePlainSecretsAllowed = (): boolean =>
  ENVIRONMENT_MANIFESTS[APP_ENVIRONMENT].plainSecrets
