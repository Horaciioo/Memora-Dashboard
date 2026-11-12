import 'server-only'

import { hash, verify } from '@node-rs/argon2'

import { NEXUS_PASSWORD } from '@/declarations/nexus/settings'

// Cost parameters of a stored hash
const PHC_COST = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$/

// Hash of nothing, so a missing hash still costs a verification
let decoy: Promise<string> | null = null

/**
 * Hash a password with the configured cost
 * @param {string} password - Clear password
 * @return {Promise<string>} - PHC string
 */

export const hashPassword = (password: string): Promise<string> =>
  hash(password, {
    memoryCost: NEXUS_PASSWORD.memoryKib,
    timeCost: NEXUS_PASSWORD.iterations,
    parallelism: NEXUS_PASSWORD.parallelism,
  })

/**
 * Form of a hash fit for an env file
 * @param {string} phc - PHC string
 * @return {string} - Base64 value
 */

export const encodeHash = (phc: string): string => Buffer.from(phc, 'utf8').toString('base64')

/**
 * Check a stored hash still carries the configured cost
 * @param {string} stored - PHC string
 * @return {boolean} - Cost is outdated
 */

export const needsRehash = (stored: string): boolean => {
  const match = PHC_COST.exec(stored)
  if (!match) return true

  return (
    Number(match[1]) !== NEXUS_PASSWORD.memoryKib ||
    Number(match[2]) !== NEXUS_PASSWORD.iterations ||
    Number(match[3]) !== NEXUS_PASSWORD.parallelism
  )
}

/**
 * Compare a password with the stored hash in constant time
 * @param {string} password - Candidate
 * @param {string | null} stored - PHC string or null
 * @return {Promise<boolean>} - Password matches
 */

export const verifyPassword = async (password: string, stored: string | null): Promise<boolean> => {
  // A missing hash verifies against a decoy
  decoy ??= hashPassword(crypto.randomUUID())
  const target = stored ?? (await decoy)

  try {
    const matches = await verify(target, password)

    return matches && stored !== null
  } catch {
    return false
  }
}
