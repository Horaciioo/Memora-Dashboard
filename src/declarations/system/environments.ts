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
 * Environment manifests
 * @type {Record<Environment, EnvironmentManifest>}
 */

export const ENVIRONMENT_MANIFESTS: Record<Environment, EnvironmentManifest> = {
  dev: { label: 'development', required: [], strict: false },
  staging: { label: 'staging', required: [], strict: false },
  release: { label: 'release', required: [], strict: true },
  main: { label: 'production', required: [], strict: true },
}
