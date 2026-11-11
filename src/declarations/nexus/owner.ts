import 'server-only'

import { ROOT_IDENTITY } from '@/declarations/access/identity'

// PHC string of an Argon2id hash
const ARGON2ID_PATTERN = /^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/

/**
 * Read the stored hash, kept base64 because dollar signs get expanded by env loaders
 * @param {string | undefined} raw - Variable value
 * @return {string} - PHC string or empty
 */

const decodeHash = (raw: string | undefined): string => {
  const value = raw?.trim() ?? ''

  return value.startsWith('$') ? value : Buffer.from(value, 'base64').toString('utf8')
}

const passwordHash = decodeHash(process.env.NEXUS_OWNER_PASSWORD_HASH)

/**
 * Owner credentials read from the environment
 * @type {{ discordId: string | null, passwordHash: string | null }}
 */

export const NEXUS_OWNER = {
  // The root administrator owns the console
  discordId: ROOT_IDENTITY.discordId,
  passwordHash: ARGON2ID_PATTERN.test(passwordHash) ? passwordHash : null,
}

/**
 * Check the console is wired
 * @return {boolean} - Owner and hash both present
 */

export const isNexusConfigured = (): boolean =>
  NEXUS_OWNER.discordId !== null && NEXUS_OWNER.passwordHash !== null
